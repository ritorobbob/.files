// LICENSE_CODE ZON
'use strict'; /*jslint browser:true*/
define(['/bext/pub/browser.js', '/bext/pub/backbone.js', 'underscore',
    '/util/etask.js', '/util/zerr.js', '/bext/vpn/pub/ajax.js',
    '/bext/pub/lib.js', '/bext/pub/ext.js', '/util/storage.js',
    '/util/date.js', '/util/util.js', '/bext/vpn/pub/info.js'],
    function(B, be_backbone, _, etask, zerr, ajax, be_lib, be_ext, storage,
    date, zutil, be_info){
var conf = window.conf;
var E = new (be_backbone.task_model.extend({
    _defaults: function(){
        this.on('destroy', function(){
            B.backbone.server.stop('be_agent');
            uninit();
        });
        B.backbone.server.start(this, 'be_agent');
    },
}))();

E.init = function(){
    E.agents = {};
    E.agent_types = {};
    schedule_refresh();
    // refresh agents list when we assume user status changed (free/premium),
    // it can load another type of agents
    var update_agents = _.debounce(function(){ E.resolve_agents(E.agents); },
        2*date.ms.SEC);
    E.listenTo(be_ext, 'change:is_premium', function(){ update_agents(); });
    E.listenTo(be_info, 'user_id_set', function(){ update_agents(); });
};

function schedule_refresh(timeout){
    schedule_refresh.timer = clearTimeout(schedule_refresh.timer);
    schedule_refresh.timer = setTimeout(refresh_key, timeout||12*date.ms.HOUR);
}

function refresh_key(){
    schedule_refresh.timer = null;
    return etask([function try_catch$(){
        return E.resolve_agents({xx: 1}, null, {key_only: 1});
    }, function(){
        schedule_refresh(this.error ? 10*date.ms.MIN : 0);
    }]);
}

function uninit(){
    schedule_refresh.timer = clearTimeout(schedule_refresh.timer); }

E.is_agent = function(ip){
    return !!_.find(E.agents, function(country_agents){
        return zutil.find_prop(country_agents, 'ip', ip); });
};

E.has_pool = function(country, pool){
    var ap = E.agents[country+'.pool_'+pool];
    return ap && ap.length;
};

// returns agent type from route string
// agent type can be 'hola' for hola agents pool that is used by free users
// and 'vpn' for vpn agents pool used by premium users
//
// route_str - string in a format "xx[.peer]", where xx - country code,
// examples: 'us.peer', 'ca', etc.
// returns 'hola', 'vpn' or undefined if there are no agents for this route
// string
E.get_agents_type = function(route_str){ return E.agent_types[route_str]; };

// gets new agents and agent key
//
// [agent_specs] - dict in the format 'proxy string: true', where
// 'proxy string' has the format xx[.peer|.pool_bbc].
// Example: {us.peer: true, ua: true, gb.pool_bbc: true}.
// If set, function will request agents for proxy strings from this list. If
// not set, function will request agents for proxy strings w/o agents from
// E.agents.
// [exclude] - list of agent names to exclude. Example: ['zagent1.hola.org'].
// [opt.key_only] - get only agent key. Doesn't get new agents.
E.resolve_agents = function(agent_specs, exclude, opt){
    var zgettunnels = {}, new_only = !agent_specs;
    opt = opt||{};
    agent_specs = agent_specs || E.agents;
    return etask([function(){
        if (_.isEmpty(agent_specs))
            return this.return();
        // sites have different algorithms for the various urls, we need
        // to make sure that we always choose the same agent
        _.keys(agent_specs).forEach(function(agent_spec){
            if (new_only && E.agents[agent_spec].length)
                return;
            zgettunnels[agent_spec] = 1;
        });
        if (!(zgettunnels=_.keys(zgettunnels)).length)
            return this.return();
        return ajax.json({url: conf.url_ccgi+'/zgettunnels',
            qs: be_ext.auth({country: zgettunnels.join(';')}),
            data: {exclude: exclude ? exclude.join(',') : undefined},
            retry: 1});
    }, function(ret){
        be_ext._set('agent_key', ret.agent_key);
        storage.set('agent_key', ret.agent_key);
        if (opt.key_only)
            return;
        for (var z in ret.ztun)
        {
            if (!ret.ztun[z].length)
            {
                be_lib.perr_ok({id: 'all_agents_failed',
                    info: {country_str: z}});
            }
            var route_str = z.toLowerCase();
            E.agents[route_str] = ret.ztun[z].map(function(str){
                var match = str.match(/.* (.*):(.*)/);
                var host = match[1];
                if (exclude && _.contains(exclude, host))
                {
                    be_lib.perr_err({id: 'exclude_peer_ignored',
                        info: {country_str: z, host: host}});
                }
                return {
                    host: host,
                    port: match[2],
                    ip: ret.ip_list[match[1]],
                };
            });
            E.agent_types[route_str] = ret.agent_types[route_str];
        }
        zerr.info('agents set to', JSON.stringify(E.agents));
    }]);
};

return E; });
