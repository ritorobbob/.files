// LICENSE_CODE ZON
'use strict'; /*jslint browser:true*//*global browser*/
define(['jquery', 'underscore', 'backbone', '/bext/pub/backbone.js',
    '/util/etask.js', '/bext/pub/util.js', '/bext/pub/tabs.js',
    '/bext/pub/ext.js', '/bext/pub/browser.js', '/svc/pub/util.js',
    '/util/escape.js', '/bext/pub/lib.js', '/util/url.js',
    '/bext/vpn/pub/tab_unblocker.js', '/bext/vpn/pub/info.js',
    '/bext/vpn/pub/rule.js', 'be_ver',
    '/util/zerr.js', '/util/storage.js', '/util/date.js',
    '/bext/vpn/pub/iframe.js', '/bext/vpn/pub/premium.js'],
    function($, _, Backbone, be_backbone, etask, be_util, be_tabs, be_ext,
    B, svc_util, zescape, be_lib, zurl, be_tab_unblocker, be_info, be_rule,
    be_ver, zerr, storage, date, be_iframe, premium){
B.assert_bg('be_tpopup');
var chrome = window.chrome, conf = window.conf, zconf = window.zon_config;
var zopts = be_util.zopts;
var be_bg_main = window.be_bg_main;
var E = new (be_backbone.model.extend({
    _defaults: function(){
        this.on('destroy', function(){
            this.uninit();
        }.bind(this));
    },
}))();

function script_data(iframe_int, opt){
    // XXX pavlo: must be called to init $ in iframe.js
    iframe_int.init_jquery();
    // can't use window.browser
    var B = window.chrome || typeof browser!='undefined' && browser;
    var $frame, cid = opt.connection_id, port, self;
    var origin = opt.origin, inited = false;
    var _init = B ? chrome_init : firefox_init;
    var _uninit = B ? chrome_uninit : firefox_uninit;
    function add_iframe(){
        if (document.getElementById('_hola_popup_iframe__'))
            return void console.error('frame already exists');
        if (!document.body) // XXX bahaa: wait for it
            return void console.error('document not ready');
        var tpopup_html, top = '5px', body_click = true;
        switch (opt.type)
        {
        case 'svc_require': tpopup_html = 'engine_update.html'; break;
        case 'site_trial_try':
        case 'site_trial_timer':
            body_click = false;
            top = '60px'; // to don't overlap Netflix "Sign In" button
            tpopup_html = 'site_trial.html';
            break;
        case 'trial_ended':
            body_click = false;
            tpopup_html = 'trial_ended.html';
            break;
        default: tpopup_html = 'tpopup.html';
        }
        var f = iframe_int.add({url: opt.base_url+'/'+tpopup_html+'?ver='
            +opt.ver});
        // XXX arik/alexeym hack: need something better than just z-index
        // alexeym: 99999 because need to be undex MPlayer overlay (100000)
        var styles = {position: 'fixed', top: top, right: '20px',
            'background-color': 'transparent', 'z-index': 99999,
            overflow: 'hidden', visibility: 'hidden', border: 'none'};
        if (opt.type=='svc_require')
        {
            styles.top = '0px';
            styles.right = '0px';
            styles.height = '100%';
            styles.width = '100%';
        }
        f.css(styles).attr('id', '_hola_popup_iframe__');
        if (body_click)
            document.body.addEventListener('mousedown', mousedown_cb);
        window.addEventListener('message', on_tab_msg, false);
        return f;
    }
    function rm_iframe(){
        try {
            if (!$frame)
                return;
            if (document.body)
                document.body.removeEventListener('mousedown', mousedown_cb);
            rm_msg_listener();
            $frame = null;
            iframe_int.remove();
        } catch(e){
            // in firefox when navigate to different page we get error:
            // "Permission denied to access property 'document'"
            console.error('rm_iframe error: '+e);
        }
    }
    function rm_msg_listener(forced){
        if (opt.persistent && !forced)
            return;
        window.removeEventListener('message', on_tab_msg, false);
    }
    function mousedown_cb(){
        if (!$frame)
            return;
        // XXX arik/bahaa hack: best solution is to ask ui_vpn to call
        // set_dont_show_again
        if (!opt.type)
        {
            ext_send_msg({type: 'be_msg_req', id: Math.random(),
                _type: 'tpopup', _tab_id: opt.tab_id, context: {rmt: true},
                msg: {msg: 'call_api', obj: 'tpopup',
                func: 'set_dont_show_again', args: [{tab_id: opt.tab_id,
                period: 'session', root_url: opt.root_url,
                src: 'ext_click'}]}});
        }
        // XXX arik/bahaa hack: need generic way to pass messages to tpopup
        iframe_int.send({id: 'cs_tpopup.hide_anim'});
        // XXX arik/alexeym hack: we set 500 to allow tpopup close animation
        // to finish
        setTimeout(uninit, 500);
    }
    function ext_send_msg(msg){
        if (B)
            return void B.runtime.sendMessage(msg);
        self.postMessage(msg);
    }
    function on_ext_msg(msg){
        if (!msg || msg._connection_id!=cid)
            return;
        iframe_int.send(msg, origin);
    }
    function on_tab_msg(e){
        var msg = e.data;
        if (msg && msg.id=='enable_root_url')
        {
            msg.no_resp = true;
            msg.opt = msg.opt||{};
            if (!msg.opt.root_url)
                msg.opt.root_url = opt.root_url;
            if (!msg.opt.country)
                msg.opt.country = 'US';
            ext_send_msg(msg);
            rm_msg_listener(true);
            return;
        }
        if (!msg || e.origin!=origin || !$frame)
            return;
        switch (msg.id)
        {
        case 'tpopup.show': $frame.css('visibility', 'visible'); break;
        case 'tpopup.hide': $frame.css('visibility', 'hidden'); break;
        case 'tpopup.init':
            // XXX arik/bahaa: need to send opt as is to popup
            msg = {id: msg.id, conf: opt.conf, zon_config: opt.zon_config,
                ver: opt.ver, tab_id: opt.tab_id, root_url: opt.root_url,
                url: opt.url, type: opt.type, zopts: opt.zopts,
                browser_have: opt.browser_have};
            if (opt.screenshot)
                msg.screenshot = opt.screenshot;
            iframe_int.send(msg, origin);
            break;
        case 'tpopup.resize':
            on_resize(msg);
            break;
        case 'tpopup.close': uninit(); break;
        default: // forward to extension
            msg._tab_id = opt.tab_id;
            msg._connection_id = cid;
            ext_send_msg(msg);
            break;
        }
    }
    function on_resize(msg){
        var height = msg && msg.height;
        var width = msg && msg.width;
        if (opt.type=='svc_require')
        {
            height = '100%';
            width = '100%';
        }
        iframe_int.resize({width: width, height: height});
    }
    function init(){
        if (inited)
            return;
        // url might change between the time BG called tabs.executeScript and
        // this point (happens consistently on some sites)
        if (opt.url!=location.href)
        {
            console.error('expected url: '+opt.url+' actual: '+location.href);
            return;
        }
        inited = true;
        if (!($frame = add_iframe()))
            return;
        _init();
    }
    function uninit(){
        if (!inited)
            return;
        rm_iframe();
        _uninit();
        inited = false;
    }
    function on_disconnect(){
        uninit();
        rm_msg_listener(true);
    }
    function chrome_init(){
        port = B.runtime.connect({name: cid});
        B.runtime.onMessage.addListener(on_ext_msg);
        port.onDisconnect.addListener(on_disconnect);
    }
    function chrome_uninit(){
        B.runtime.onMessage.removeListener(on_ext_msg);
        port.onDisconnect.removeListener(on_disconnect);
        port = null;
    }
    function firefox_init(){
        self = window.self;
        self.on('message', on_ext_msg);
        self.on('detach', on_disconnect); // FF<30
        self.port.on('detach', on_disconnect); // FF>=30
    }
    function firefox_uninit(){
        self.removeListener('message', on_ext_msg);
        self.removeListener('detach', on_disconnect);
        self.port.removeListener('detach', on_disconnect);
        self = null;
    }
    init();
}

function _is_dont_show(tab_id, val, type){
    if (!val)
        return false;
    // XXX arik BACKWARD: < 1.3.265 didn't save user ts. need to fix db
    // entries and rm "||val.ts".
    var ts_diff = new Date() - date.from_sql(val.ts_user||val.ts);
    var is_type = val.type==type;
    if (val.period=='never')
        return is_type;
    if (val.period=='default')
        return is_type && ts_diff<date.ms.WEEK;
    var dur;
    if (dur = date.str_to_dur(val.period))
        return is_type && ts_diff<dur;
    var dont_show_tabs = be_info.get('dont_show_tabs')||{};
    var tab_data = dont_show_tabs[tab_id]||{};
    return tab_data.period=='session' && tab_data.type==type;
}

function is_dont_show(tab, root_url, type){
    var settings = be_info.get('settings');
    if (!settings||!settings.dont_show)
        return false;
    if (tab && tab.id && redirect_tabs[tab.id])
        return false;
    type = !type ? undefined : type;
    if (_is_dont_show(tab.id, settings.dont_show.all, type) ||
        _is_dont_show(tab.id, settings.dont_show[root_url], type))
    {
        return true;
    }
    return false;
}

function popup_showing(){
    if (chrome)
    {
        var views = chrome.extension.getViews({type: 'popup'});
        return views && views.length>0;
    }
    return B.have['firefox.panel.is_showing'] &&
        etask.cb_apply(B.firefox.panel, '.is_showing', []);
}

function is_disabled(){
    return !be_ext.get('r.ext.enabled');
}

// Minimum unblocking rate to suggest unblocking via tpopup
var min_suggest_rate=0.3;

var forced_urls = {}, connected_tpopups = {};
function is_connected(tab_id, tpopup_type){
    if (tpopup_type=='svc_require')
        return false;
    var tab_connected = B.tabs.is_connected(tab_id);
    return tab_connected && tpopup_type ?
        connected_tpopups[tab_id]==tpopup_type :
        tab_connected && connected_tpopups[tab_id];
}
E.is_connected = is_connected;
function is_current_tab(tab_id){
    return be_tabs.get('active.id')==tab_id;
}
// XXX arik/alexeym: need to mv logic out and add a test
// injects tpopup into a page
// whether to inject tpopup into a page depends on the following conditions
// in different combinations:
// - regular/incognito tab
// - extension enabled/disabled
// - svc installed/doesn't exist
// - domain unblock rate in user's country
// - tpopup forced to be shown
// - trial available for domain
// - trial active for domain
// - global trial is ended
// - user chosen "don't show" in a tpopup for domain
// - website redirected user to another domain (e.g. bbc.co.uk->bbc.com)
// - website shown error
// - version up to date
function do_tpopup(tab, tpopup_opt){
    if (!tab || !tab.url || is_disabled())
        return;
    var root_url, url = tab.url, id = tab.id;
    tpopup_opt = tpopup_opt||{};
    var tpopup_type, deactivated_rules, enabled_rule;
    E.unset('tpopup_type');
    return etask({name: 'do_tpopup', cancel: true}, [function(){
        root_url = svc_util.get_root_url(url);
        deactivated_rules = root_url && get_deactivated_rule(root_url);
        enabled_rule = root_url && get_enabled_rule(root_url);
        var has_rules = deactivated_rules||enabled_rule;
        return has_rules ? check_activation() : false;
    }, function(check_activation){
        if (check_activation && deactivated_rules)
            tpopup_type = 'svc_require';
        // XXX pavlo: bug, sometimes we think we still connected, while we are
        // not. Happens when you open regular popup, while tpopup is opened,
        // refresh the page and tpopup won't appear
        // fast path. rechecked before attach
        if (is_connected(id, tpopup_type) && !redirect_tabs[id])
            return this.return(zerr.notice('tab already attached'));
        E.set('tpopup_type', tpopup_type);
        if (tpopup_type=='svc_require')
        {
            zerr.notice('svc require tpopup should be shown');
            return this.goto('render');
        }
    }, function(){
        if (premium.is_uuid_trial_using(root_url))
        {
            tpopup_type = 'site_trial_timer';
            zerr.notice('trial active - tpopup should be shown');
            return this.goto('render');
        }
        if (premium.is_trial_ended() &&
            !is_dont_show(tab, root_url, 'trial_ended') &&
            (be_ext.get('bext_config')||{}).show_trial_ended)
        {
            tpopup_type = 'trial_ended';
            zerr.notice('trial ended - tpopup should be shown');
            return this.goto('render');
        }
        var is_trial_available = premium.is_uuid_trial_available(root_url);
        if (is_trial_available && !premium.is_active() &&
            !is_dont_show(tab, root_url, 'site_trial_try'))
        {
            tpopup_type = 'site_trial_try';
            zerr.notice('trial available - tpopup should be shown');
            return this.goto('render');
        }
        if (be_info.is_force_tpopup(root_url))
        {
            forced_urls[root_url] = true;
            be_info.unset_force_tpopup(root_url);
            zerr.notice('popup was forced');
            return this.goto('check_ver');
        }
        if (is_dont_show(tab, root_url))
        {
            zerr.notice('tab is don\'t show');
            return this.return();
        }
        if (forced_urls[root_url])
        {
            zerr.notice('popup was forced2');
            return this.goto('check_ver');
        }
        zerr.notice('checking if site has high unblocking rate');
        // XXX arik: decide if to call with root_url and if to mv logic
        // to server-side
        return be_info.get_unblocking_rate(200);
    }, function(unblocking_rate){
        if (!unblocking_rate)
            return false;
        for (var i=0, r, rate; !rate && (r = unblocking_rate[i]); i++)
        {
            if (r.root_url==root_url && r.unblocking_rate>min_suggest_rate)
                rate = r;
        }
        return !!rate;
    }, function(unblock_by_rate){
        if (unblock_by_rate)
            return true;
        zerr.notice('unblock rate is low, check if unblock by redirect/error');
        return redirect_tabs[id] || (error_tabs[id] ? error_tabs[id].etask ||
            error_tabs[id].is_blocked : undefined);
    },
    function(need_unblock){
        if (!need_unblock)
        {
            zerr.notice('skip tpopup, no unblock by redirect/error');
            return this.return();
        }
    }, function check_ver(){ return window.RMT.check_ver();
    }, function render(e){
        connected_tpopups[id] = tpopup_type ? tpopup_type : true;
        if (e && e.load_ver)
            return this.return(zerr('skip tpopup, load new ver'+e.load_ver));
        if (!tpopup_type)
            return popup_showing();
    }, function(showing){
        if (showing && !redirect_tabs[id])
            return this.return(zerr.notice('extension popup is opened'));
        return be_tabs.get_tab(id);
    }, function(tab){
        // while we decide if need to insert tpopup, the tab can be removed,
        // replaced, changed url, already injected with tpopup
        if (!tab)
            return this.return(zerr('tpopup tab disappeared'));
        if (tab.url!=url && !(error_tabs[id] && error_tabs[id].redirect))
        {
            zerr('tpopup tab changed url '+url+' -> '+tab.url);
            return this.return();
        }
        if (is_connected(id, tpopup_type) && !redirect_tabs[id])
            return this.return(zerr.notice('tab already attached'));
        zerr.notice('applying tpopup to tab id %s', id);
        var proto = zurl.get_proto(url);
        var base_url = zconf._RELEASE ? conf.url_bext_cdn4||conf.url_bext :
            conf.url_bext;
        var zhost = zurl.get_host(base_url);
        if (tpopup_type=='svc_require')
        {
            base_url = conf.url_site;
            // XXX michaelg/alexeym get_host requires slash at the end
            zhost = zurl.get_host(base_url+'/');
        }
        var opt = {conf: conf, zon_config: zconf,
            base_url: base_url.replace(/^https?/, proto),
            tab_id: id, connection_id: id+':tpopup:'+_.random(0xffff),
            root_url: root_url, url: url, ver: be_ver.ver,
            origin: proto+'://'+zhost,
            persistent: !!redirect_tabs[id], zopts: zopts.table,
            browser_have: B.have};
        if (tpopup_type)
            opt.type = tpopup_type;
        if (tpopup_opt.reason)
        {
            be_lib.perr_ok({id: 'be_tpopup_inject', info: {url: tab.url,
                reason: tpopup_opt.reason}});
        }
        etask([function(){
            if (tpopup_type=='svc_require' && chrome && chrome.tabs)
            {
                var current_tab = is_current_tab(opt.tab_id);
                var econt = this.continue_fn();
                setTimeout(function(){
                    if (current_tab)
                        current_tab = is_current_tab(opt.tab_id);
                    chrome.tabs.captureVisibleTab(tab.windowId, null,
                        function(url){
                        if (current_tab)
                            current_tab = is_current_tab(opt.tab_id);
                        // XXX alexeym/michaelg: need to be sure
                        // the screenshot is taken from tpopup tab
                        if (current_tab)
                            opt.screenshot = url;
                        econt();
                    });
                }, 1000);
                return this.wait();
            }
        }, function(){
            if (redirect_tabs[id])
                delete redirect_tabs[id];
            zerr.notice('inject tpopup iframe');
            return be_iframe.inject(id, script_data, opt,
                chrome ? {} : {tpopup: 1, connection_id: opt.connection_id});
        }, function(){
            zerr.notice('tpopup iframe injected');
            if (tpopup_type=='svc_require')
            {
                E.listenTo(be_bg_main, 'change:is_svc', function(){
                    var is_svc = be_bg_main.get('is_svc');
                    if (!is_svc)
                        return;
                    E.stopListening(be_bg_main);
                    B.tabs.update(opt.tab_id, {url: tab.url});
                });
            }
        }]);
        return opt;
    }, function cancel$(){
        delete connected_tpopups[id];
        return this.return();
    }, function catch$(err){
        var ok = err.message=='OK';
        be_lib.perr_err({id: 'be_tpopup2_err', err: err,
            info: ok ? 'src_country: '+be_ver.country : null,
            filehead: ok ? zerr.log_tail() : ''});
        delete connected_tpopups[id];
    }, function finally$(){
        if (error_tabs[id])
            delete error_tabs[id];
    }]);
}

function get_enabled_rule(root_url){
    var rules = be_rule.get_rules('http://'+root_url+'/');
    var r = rules && rules[0];
    return r && r.enabled ? r : undefined;
}

function get_deactivated_rule(root_url){
    var rules = be_rule.get_rules('http://'+root_url+'/');
    var r = rules && rules[0];
    return r && (r.enabled || r.cond=='svc_check_flow') ? true : false;
}

function tpopup_on_updated(o){
    do_tpopup(o.tab);
}

function tpopup_on_replaced(o){
    B.tabs.get(o.added, function(tab){
        do_tpopup(tab);
    });
}

function tpopup_on_error(o){
    if (!o || !o.id || is_disabled())
        return;
    var url;
    etask([function(){ return be_tabs.get_tab(o.id);
    }, function(tab){
        if (!tab)
            return this.return();
        url = tab.url;
        var root_url = svc_util.get_root_url(url);
        if (get_enabled_rule(root_url))
            return this.return();
        return check_gov_block(url, o.id);
    }, function(is_blocked){
        if (!is_blocked)
            return this.return();
        return be_tabs.get_tab(o.id);
    }, function(tab){
        if (!tab || tab.url!=url)
            return this.return();
        // alexeym: chrome doesn't allow to inject scripts for internal pages
        if (chrome && o.info && o.info.http_status_code==0)
            redirect_to_unblock(o.id);
        else
            do_tpopup(tab, {reason: 'gov_block'});
    }]);
}

var error_tabs = {};
function check_gov_block(url, tab_id){
    if (!url)
        return;
    if (error_tabs[tab_id] && error_tabs[tab_id].url==url)
        return;
    var keep_redirect = error_tabs[tab_id] && error_tabs[tab_id].redirect;
    error_tabs[tab_id] = {url: url};
    if (keep_redirect)
    {
        error_tabs[tab_id].redirect = keep_redirect;
        error_tabs[tab_id].is_blocked = true;
        return;
    }
    error_tabs[tab_id].etask = etask([function(){
        return be_tab_unblocker.check_gov_blocking(url);
    }, function(is_blocked){
        if (is_blocked===undefined)
            return this.return();
        var tab_url = be_tabs.get_url(tab_id);
        if (is_blocked && tab_url==url)
            return be_tabs.get_tab(tab_id);
        return this.return(is_blocked);
    }, function(tab){
        if (!error_tabs[tab_id])
        {
            if (tab && tab.url==url)
                error_tabs[tab_id] = {url: url};
            else
                return;
        }
        error_tabs[tab_id].is_blocked = true;
        delete error_tabs[tab_id].etask;
        return true;
    }]);
    return error_tabs[tab_id].etask;
}

var redirect_tabs = {};
function redirect_to_unblock(tab_id){
    if (!chrome)
        return;
    etask([function(){ return be_tabs.get_tab(tab_id);
    }, function(tab){
        if (!tab||!tab.url)
            return this.return();
        var tab_url = tab.url;
        if (!be_tab_unblocker.is_vpn_allowed(tab_url, true))
            return this.return();
        tab_url = svc_util.get_root_url(tab_url);
        if (!tab_url)
            return this.return();
        if (get_enabled_rule(tab_url))
            return this.return();
        be_lib.perr_ok({id: 'be_tpopup_rewrite', info: {url: tab.url,
            reason: 'http_code_0'}});
        be_tab_unblocker.rewrite_to_proxy(tab.url, tab_id);
        redirect_tabs[tab_id] = true;
    }]);
}

E.uninit = function(){
    if (!E.inited)
        return;
    E.inited = 0;
    E.sp.return();
    E.stopListening();
};

function set_rules_cond(set){
    return etask([function(){
        return be_rule.set_rules_cond({cond: 'svc_check_flow', set: set});
    }, function(){
        // XXX alexeym/shachar: check if we need to fetch it here
        return be_rule.fetch_rules();
    }]);
}

// checks whether svc is required and enabled and toggles rules accordingly
function check_activation(){
    var svc_require;
    return etask([function(){
        return be_util.check_activation();
    }, function(check_activation){
        svc_require = check_activation;
        if (svc_require==true)
            return set_rules_cond(true);
        if (svc_require==false)
            return set_rules_cond(false);
    }, function(){
        return svc_require;
    }]);
}

E.init = function(){
    if (E.inited)
        return;
    E.inited = 1;
    E.sp = etask('be_tpopup', [function(){ return this.wait(); }]);
    if (!B.have.tpopup)
        return;
    try { E.tpopup_user = storage.get_json('tpopup_user')||{}; }
    catch(e){ E.tpopup_user = {}; }
    if (E.tpopup_user=='false') /* old fmt */
        E.tpopup_user = {};
    E.listenTo(be_tabs, 'updated', tpopup_on_updated);
    E.listenTo(be_tabs, 'replaced', tpopup_on_replaced);
    E.listenTo(be_tabs, 'error_occured', tpopup_on_error);
};

return E; });
