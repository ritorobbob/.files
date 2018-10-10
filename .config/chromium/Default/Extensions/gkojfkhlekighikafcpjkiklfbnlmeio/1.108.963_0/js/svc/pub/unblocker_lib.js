// LICENSE_CODE ZON
'use strict'; /*jslint node:true, browser:true*/
(function(){
var define;
var is_node = typeof module=='object' && module.exports;
if (!is_node)
    define = self.define;
else
    define = require('../../util/require_node.js').define(module, '../');
define(['/protocol/pub/pac_engine.js', '/util/date.js',
    '/util/escape.js', '/util/url.js', '/util/util.js'],
    function(pac_engine, date, zescape, zurl, zutil){
var E = {};

var CACHE_TTL = date.ms.MIN;
var POLICY_TTL = 5*date.ms.MIN;

// These are the actual, up-to-date extension lists. Any similar extension list
// elsewhere is obsolete. -- alexey 2015-05-19
var extensions = {
    archive: zutil.bool_lookup(
        '7z apk arj bin bz deb dmg exe gz iso msi rar rpm tbz tgz xz zip'),
    media: zutil.bool_lookup(
        '3gp avi f4v flv h264 m4a m4s m4v mkv mov mp3 mp4 ogg ogv swf ts wav '
        +'webm wmv'),
    static: zutil.bool_lookup(
        'css eot gif ico jar jpeg jpg png svg svgz ttf webp woff'),
};

var expected_types = {
    archive: /^application\/(?!json$)/,
    media: /^((audio|video)\/|application\/octet-stream$)/,
};

var strategies = {};
var cache = {};
var peer_domain_re;
var pools_re;
var _premium_mode = false;
var _app_trial_mode = false;

// handle_request(url, [opt]):
//
// url: the absolute url string or the object returned by
//     zurl.parse(absolute_url, true)
//
// opt: a hash of options:
//
// opt.top_url: the root URL of the web page loaded in a browser tab; if not
//     available, it's acceptable to pass the Referer header here
//
// opt.method: request method in uppercase (if known)
//
// opt.type: request type as per
//     https://developer.chrome.com/extensions/webRequest#type-ResourceType
//     (if known)
//
// opt.force: force 'direct', 'proxy' or 'peer' routing
//
// opt.country: country (uppercase), for policy caching purposes
//
// opt.premium: force 'proxy'
//
// Returns a decision function. The caller should obtain a new decision
// function instance for each new URL being handled, and even when handling a
// new request to the same URL.
//
// The decision function has an extra property: desc. It's a string for use in
// the logs that briefly describes the chosen strategy.
//
// Decision function signature: (direct, proxy)
//
// The decision function should be called first at the start of request
// handling, and then again each time one of the subrequests comes back with a
// response, times out or suffers from a network error. A subrequest that has
// timed out should continue to run (the timeout is soft). The timeout event
// should not happen after the request has already returned a response or a
// network error. The caller should also set a reasonably long (minutes) hard
// timeout and treat it as a network error, to prevent unbounded memory
// consumption.
//
// The direct and proxy arguments are objects describing the subrequests. One
// or both can be null when the corresponding subrequest does not (yet) exist.
// The caller should not create any subrequests automatically. This means that,
// in the first call to the decision function, both arguments shall be null.
//
// Fields in the subrequest objects (all optional):
//
// code: (int) response code, if the subrequest has received a response
//
// type: the response's Content-Type header value, if any
//
// len: (int) the response's Content-Length header value, as integer, if any
//
// etag: the response's ETag header value, if any
//
// location: the response's Location header value, if any
//
// policy: the value of the proxy response's X-Hola-Policy header, if any
//
// error: the error description, in case of a network error. A non-empty string
//     or an object meaningfully convertible to a string.
//
// slow: (boolean) true if the request has timed out. Once it has happened,
//     this shall remain true even if the subrequest later gets a response.
//
// peer: (boolean) true in case of a proxy response routed through the P2P
//     network. This must be set even before a response arrives.
//
// pool: (string) name of servers pool; falsy value means use servers w/o
//    any pool
//
// hdrs_only: (boolean) true in case of a headers-only proxy response. This
//     need not be set before a response arrives.
//
// The decision function should return a decision object or undefined; the
// latter is equivalent to {}.
//
// Fields in the decision object (all optional):
//
// direct: a nested object describing actions on the direct subrequest
//
// proxy: a nested object describing actions on the proxy subrequest
//
// (direct|proxy).start: a truthy value to start the subrequest. This can also
//     be used to restart a previously headers-only subrequest as a full one,
//     or to switch between peer and agent proxies.
//
// direct.timeout: only meaningful together with start; a truthy value
//     instructs the caller to set an implementation-defined soft timeout on
//     the subrequest.
//
// proxy.peer: only meaningful together with start; a truthy value to route the
//     request through the P2P network rather than an agent.

// proxy.hdrs_only: only meaningful together with start; a truthy value
//     specifies that the proxy request should be for headers only.
//
// proxy.allowed: only meaningful together with start; a truthy value means
//     that we know in advance that proxy access is allowed due to a cached
//     policy value. Unless this is set, the implementation may need to issue
//     an advance probe request to the proxy.
//
// (direct|proxy).abort: a truthy value to abort the subrequest.
//
// (direct|proxy).serve: a truthy value to serve the response from this
//     subrequest to the client. Also valid for a subrequest with a network
//     error: relay the error to the client, as 502 response or by other means.
//     When one subrequest is being served while another one has a response and
//     is not explicitly aborted, the caller may choose to download the latter
//     one's body for caching, if applicable, or, alternatively, to abort
//     automatically. This should be ignored if a subresponse is being served
//     already. Both direct.serve and proxy.serve can be set together; in this
//     case, the caller should choose whichever one is easier to serve.
//
// log: a string commenting the decision; to be logged by the caller. This
//     won't describe the actions listed above (they should be logged by the
//     caller anyway), but rather give additional explanations as to why the
//     decision is made.
//
// Some aspects of a decision may be impossible to implement due to limitations
// of the environment; in such cases, the caller should make the best effort to
// carry out the remaining part of the decision object.

E.handle_request = function(url, opt){
    opt = opt||{};
    opt.premium = opt.premium||_premium_mode||_app_trial_mode;
    if (typeof url=='string')
        url = zurl.parse(url, true);
    var top_url = typeof opt.top_url=='string' ?
        zurl.parse(opt.top_url, true) : opt.top_url;
    var strategy;
    var cache_entry = E.cache_access(url.hostname);
    var policy_key = 'policy:'+opt.country;
    var policy = cache_entry.get(policy_key);
    if (policy=='blocked')
        strategy = {name: 'direct'};
    else if (opt.premium)
        strategy = {name: 'proxy', peer: false};
    else if (opt.force=='peer')
        strategy = {name: 'proxy'};
    else if (opt.force)
        strategy = {name: opt.force, peer: false};
    else if ((strategy = choose_strategy(url, opt)) && strategy.name!='direct')
    {
        var ex = pac_engine.find_proxy_for_url_exception(url.orig,
            url.hostname);
        // ex: null|DIRECT|PROXY|PROXY XX|PROXY XX.PEER|PROXY XX.direct_first
        switch (ex)
        {
        case 'DIRECT': strategy = {name: 'direct'}; break;
        case 'PROXY XX': strategy.name = 'proxy'; break;
        case 'PROXY XX.direct_first': strategy.name = 'direct_first'; break;
        case 'PROXY XX.PEER':
            strategy.name = 'proxy';
            strategy.peer = true;
            break;
        }
    }
    if (strategy.cache)
    {
        var cached = cache_entry.get(strategy.cache);
        if (cached)
            strategy = {name: cached, peer: strategy.peer};
    }
    var peer = strategy.peer===true || strategy.peer===undefined &&
        peer_domain_re && (peer_domain_re.test(url.hostname) ||
            top_url && peer_domain_re.test(top_url.hostname));
    var res = strategies[strategy.name].bind(null, {
        cache: cache_entry,
        cache_key: strategy.cache,
        policy: policy,
        policy_key: policy_key,
        peer: peer,
        expect_type: strategy.expect_type,
        pool: opt.pool,
    });
    res.desc = strategy.name;
    if (strategy.cache)
        res.desc += ' cache '+strategy.cache;
    if (peer && strategy.name!='direct')
        res.desc += ' peer';
    if (strategy.name=='proxy' && opt.pool)
        res.desc += ' pool_'+opt.pool;
    return res;
};

function choose_strategy(url, opt){
    var ext = url.ext && url.ext.toLowerCase();
    if (opt.method && opt.method!='GET')
        return {name: 'proxy'};
    if (opt.type=='stylesheet' || opt.type=='image')
        return {name: 'parallel', cache: 'static', peer: false};
    if (url.query && zurl.qs_parse(url.query, 0, 1).callback) // JSONP
        return {name: 'parallel'};
    if (extensions.archive[ext])
    {
        return {name: 'direct_first', cache: 'archive', peer: false,
            expect_type: expected_types.archive};
    }
    if (extensions.media[ext] || /=\d+-\d+\.dash/.test(url.file) ||
        /Seg\d+-?Frag\d+/.test(url.pathname) ||
        /\/QualityLevels\(\d+\)\/Fragments\(.+=\d+(,format=.+)?\)/
        .test(url.pathname))
    {
        return {name: 'direct_first', cache: 'media', peer: false,
            expect_type: expected_types.media};
    }
    if (extensions.static[ext])
        return {name: 'parallel', cache: 'static', peer: false};
    if (opt.type=='main_frame')
        return {name: 'proxy'};
    if (url.protocol=='https:')
        return {name: 'proxy'};
    return {name: 'parallel'};
}

E.set_premium_mode = function(mode){ _premium_mode = mode; };
E.set_app_trial_mode = function(mode){ _app_trial_mode = mode; };

// deprecated
E.resp_match = function(a, b){
    if (a.code!=b.code)
        return {match: false, basis: 'response code'};
    if (a.type!=b.type)
        return {match: false, basis: 'content type'};
    if (a.etag || b.etag)
        return {match: a.etag==b.etag, basis: 'etag'};
    if (a.len || b.len)
        return {match: a.len==b.len, basis: 'content-length'};
};

E.unblocker_json_set = function(json, opt){
    pac_engine.init(json, opt||{ext: true});
    if (json.exceptions)
    {
        E.set_peer_sites(json.exceptions.peer);
        if (0) // XXX sergeir: disable until real example
        E.set_pool_sites(json.exceptions.pool);
    }
};

// deprecated
E.set_peer_sites = function(list){
    if (!list)
        return;
    peer_domain_re = new RegExp(
        '(^|\\.)('+list.map(zescape.regex).join('|')+')$', 'i');
};

E.set_pool_sites = function(pool){
    if (!pool)
        return;
    pools_re = {};
    for (var n in pool)
    {
        if (!pool[n] || !pool[n].length)
            continue;
        pools_re[n] = new RegExp(
            '(^|\\.)('+pool[n].map(zescape.regex).join('|')+')$', 'i');
    }
};

function get_pool(name){
    if (!pools_re)
        return;
    for (var n in pools_re)
    {
        if (pools_re[n].test(name))
            return n;
    }
}

// deprecated
E.gen_rule = function(opt){
    var peer = peer_domain_re && peer_domain_re.test(opt.name);
    var premium = opt.premium || _premium_mode || opt.md5=='premium';
    var p = 'PROXY '+opt.country.toUpperCase();
    var p_dyn = p+(peer ? '.PEER' : '');
    var p2 = p+'.';
    var p_dyn2 = p2+(peer ? 'PEER,' : '');
    var rule = {
        name: opt.name,
        country: opt.country.toLowerCase(),
        peer: peer,
        pool: get_pool(opt.name),
        link: opt.name,
        description: opt.country.toUpperCase()+' VPN'+
            (premium ? ' Premium' : ''),
        icon: 'img/icon_'+(premium ? 'premium' : 'vpn')+'.png',
        type: 'url',
        md5: premium ? 'premium' : 'vpn',
        no_direct_filter: premium,
        enabled: opt.enabled!==undefined ? !!opt.enabled : true,
        cond: opt.cond,
        supported: true,
        root_url_orig: ['**.'+opt.name],
        root_url: [zurl.http_glob_url('**.'+opt.name, 1)],
        ts: opt.ts ? new Date(opt.ts) : new Date(),
        cmds: [{
            'if': [
                {ext: extensions.static, type: '=o',
                    then: p2+'direct_first_discover'},
                {ext: extensions.media, type: '=o',
                    then: p2+'direct_first'},
                {url: zurl.http_glob_url('**/**=\\d+-\\d+\.dash', 1),
                    type: '=~', then: p2+'direct_first'},
                {url: zurl.http_glob_url('**/**Seg[0-9]+-?Frag[0-9]+**', 1),
                    type: '=~', then: p2+'direct_first'},
                {url: '^'+zurl.http_glob_url('**/**/')+
                    'QualityLevels\\(\\d+\\)\\/'+
                    'Fragments\\(.+=\\d+(,format=.+)?\\)',
                    type: '=~', then: p2+'direct_first'},
                {main: true, type: '==', then: p_dyn},
                {url: zurl.http_glob_url('https://**', 1), type: '=~',
                    then: p_dyn},
                {url: zurl.http_glob_url('http://**', 1), type: '=~',
                    then: p_dyn2+'direct_discover'},
            ],
            then: p_dyn,
        }],
    };
    rule.id = E.get_rule_id(rule);
    return rule;
};

// deprecated
E.get_rule_id = function(opt){
    return opt.name+'_'+opt.country+'_'+
        (opt.md5=='premium' || opt.premium ? 'premium' : 'vpn');
};

function cache_entry(){ this.timers = {}; }

cache_entry.prototype.get = function(key){ return this[key]; };

cache_entry.prototype.put = function(key, value, ttl){
    var _this = this;
    _this[key] = value;
    if (_this.timers[key])
        clearTimeout(_this.timers[key]);
    _this.timers[key] = ttl && setTimeout(function(){
        delete _this[key];
        delete _this.timers[key];
    }, ttl);
    return _this;
};

cache_entry.prototype.put_weak = function(key, value, ttl){
    if (!this[key])
        this.put(key, value, ttl);
    return this;
};

cache_entry.prototype.del = function(key){
    delete this[key];
    delete this.timers[key];
    return this;
};

E.cache_access = function(domain){
    var entry = cache[domain];
    if (!entry)
        entry = cache[domain] = new cache_entry();
    return entry;
};

E.cache_purge = function(){ cache = {}; };

strategies.direct = function(opt, direct, proxy){
    var res = {direct: {}};
    if (!direct)
    {
        res.direct.start = true;
        return res;
    }
    if (direct.code || direct.error)
        res.direct.serve = true;
    return res;
};

strategies.proxy = function(opt, direct, proxy){
    if (opt.policy=='blocked')
        return strategies.direct(opt, direct, proxy);
    var res = {direct: {}, proxy: {}};
    if (!proxy)
    {
        res.proxy.start = true;
        res.proxy.peer = opt.peer;
        res.proxy.pool = opt.pool;
        res.proxy.allowed = opt.policy=='allowed';
        return res;
    }
    if (handle_policy(proxy.policy, opt)=='blocked')
    {
        res.direct.start = true;
        return res;
    }
    if (proxy.code || proxy.error)
        res.proxy.serve = true;
    if (opt.pool)
        res.proxy.pool = opt.pool;
    return res;
};

strategies.parallel = function(opt, direct, proxy){
    if (opt.policy=='blocked')
        return strategies.direct(opt, direct, proxy);
    var res = {direct: {}, proxy: {}};
    function serve_proxy(){
        if (proxy.hdrs_only)
        {
            res.proxy.start = true;
            res.proxy.peer = opt.peer;
            res.proxy.pool = opt.pool;
            res.proxy.allowed = opt.policy=='allowed';
        }
        else
            res.proxy.serve = true;
        return !proxy.hdrs_only;
    }
    if (!direct)
    {
        res.direct.start = true;
        res.direct.timeout = true;
    }
    if (!proxy)
    {
        res.proxy.start = true;
        res.proxy.peer = opt.peer;
        res.proxy.pool = opt.pool;
        res.proxy.allowed = opt.policy=='allowed';
        res.proxy.hdrs_only = true;
    }
    if (!direct || !proxy)
        return res;
    if (handle_policy(proxy.policy, opt)=='blocked')
        return strategies.direct(opt, direct, proxy);
    if (proxy.error)
    {
        if (direct.code || direct.error)
            res.direct.serve = true;
        if (direct.error)
            res.proxy.serve = true; // indifferent
        return res;
    }
    if (!proxy.code)
        return res;
    if (!direct.code)
    {
        if (!serve_proxy())
            return res;
        if (opt.cache_key && direct.slow && is_ok(proxy, opt.expect_type))
        {
            res.log = 'cache put weak proxy';
            opt.cache.put_weak(opt.cache_key, 'proxy', CACHE_TTL);
        }
        else if (!opt.cache_key)
            res.direct.abort = true;
        return res;
    }
    var m = E.resp_match(direct, proxy);
    if (!m)
    {
        serve_proxy();
        return res;
    }
    res.log = m.basis + (m.match ? ' match' : ' mismatch');
    if (m.match)
    {
        res.direct.serve = true;
        if (!proxy.hdrs_only)
            res.proxy.serve = true; // indifferent
        if (opt.cache_key)
        {
            res.log += '; cache put direct';
            opt.cache.put(opt.cache_key, 'direct', CACHE_TTL);
        }
    }
    else
    {
        if (!serve_proxy())
            return res;
        if (opt.cache_key)
        {
            res.log += '; cache put proxy';
            opt.cache.put(opt.cache_key, 'proxy', CACHE_TTL);
        }
    }
    return res;
};

strategies.direct_first = function(opt, direct, proxy){
    if (opt.policy=='blocked')
        return strategies.direct(opt, direct, proxy);
    var res = {direct: {}, proxy: {}};
    if (!direct)
    {
        res.direct.start = true;
        res.direct.timeout = true;
        return res;
    }
    if (is_ok(direct, opt.expect_type))
    {
        res.direct.serve = true;
        if (opt.cache_key)
        {
            res.log = 'cache del';
            opt.cache.del(opt.cache_key);
        }
        return res;
    }
    if (!proxy)
    {
        if (direct.slow || direct.code || direct.error)
        {
            res.proxy.start = true;
            res.proxy.peer = opt.peer;
            res.proxy.pool = opt.pool;
            res.proxy.allowed = opt.policy=='allowed';
        }
        return res;
    }
    if (handle_policy(proxy.policy, opt)=='blocked')
        return strategies.direct(opt, direct, proxy);
    if (proxy.code)
    {
        if (opt.cache_key && (is_ok(proxy, opt.expect_type) || !direct.code))
        {
            res.log = 'cache put proxy';
            opt.cache.put(opt.cache_key, 'proxy', CACHE_TTL);
        }
        else if (proxy.code==302 && direct.code==302)
        {
            if (proxy.location==direct.location)
                res.direct.serve = true;
            else
            {
                var p = zurl.parse(proxy.location, true);
                var d = zurl.parse(direct.location, true);
                if (p.path==d.path)
                    res.direct.serve = true;
            }
        }
        if (!res.direct.serve)
            res.proxy.serve = true;
        return res;
    }
    if (proxy.error && !direct.slow)
    {
        res.direct.serve = true;
        if (direct.error)
            res.proxy.serve = true; // indifferent
        return res;
    }
};

function is_ok(resp, expect_type){
    var res = resp.code>=200 && resp.code<300 || resp.code==304;
    if (res && expect_type)
        res = expect_type.test(resp.type);
    return res;
}

function handle_policy(policy, opt){
    var m = /^(allowed|blocked)( domain)?$/.exec(policy);
    if (!m)
        return 'allowed';
    opt.policy = m[1];
    if (opt.policy_key && m[2])
        opt.cache.put(opt.policy_key, opt.policy, POLICY_TTL);
    return opt.policy;
}

E.t = {
    cache_entry: cache_entry,
    choose_strategy: choose_strategy,
    expected_types: expected_types,
    extensions: extensions,
    strategies: strategies,
};

E.unblocker_json_set({});

return E; }); }());
