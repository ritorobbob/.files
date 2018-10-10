// LICENSE_CODE ZON
'use strict'; /*jslint browser:true*/
define(['jquery', 'underscore', '/bext/pub/backbone.js', '/util/etask.js',
    '/bext/pub/browser.js', '/util/zerr.js', '/bext/pub/util.js',
    '/bext/pub/lib.js', '/util/version_util.js', '/util/escape.js',
    '/util/util.js', '/util/storage.js'],
    function($, _, be_backbone, etask, B, zerr, be_util, be_lib, version_util,
    zescape, zutil, storage){
B.assert_bg('be_ext');
var chrome = window.chrome, conf = window.conf, assign = Object.assign;
var be_bg_main = window.be_bg_main; /* XXX arik: rm and use require */
var E = new (be_backbone.model.extend({
    _defaults: function(){
	this.on('destroy', function(){
	    B.backbone.server.stop('be_ext');
	    uninit();
	});
	B.backbone.server.start(this, 'be_ext');
    },
}))();

E.init = function(){
    if (E.get('inited'))
	return;
    E.sp = etask('be_ext', [function(){ return this.wait(); }]);
    E.set('inited', true);
    E.set_perr(function(opt){ be_lib.perr_err(opt); });
    bg_main_to_ext_init();
    ext_init();
    vpn_init();
};

E._set = function(key, val){
    return be_bg_main.set.apply(be_bg_main, arguments); };

function uninit(){
    if (!E.get('inited'))
	return;
    E.sp.return();
    E.stopListening();
}

var bb_keys = zutil.bool_lookup('uuid browser session_key enabled ccgi_url '
    +'cid plugin.version sync_uuid '
    +'plugin.running status.unblocker.effective_pac_url use_http ext.slave '
    +'ext.conflict install_details proxy.effective.control_level '
    +'info agent_key');
// proxies all bg_main model changes to be_ext model
function bg_main_to_ext_init(){
    var change = {};
    _.each(bb_keys, function(v, k){ change[k] = be_bg_main.get(k); });
    E.safe_set(change);
    change = {};
    function commit_change(){
        if (_.isEmpty(change))
            return;
        var t = change;
        change = {};
        E.safe_set(t);
    }
    be_bg_main.on('all', function(key){
        if (key=='change')
            return commit_change();
        if (!key.startsWith('change:'))
            return;
        key = key.substr(7); /* 'change:'.length */
        if (!bb_keys[key])
            return;
        change[key] = be_bg_main.get(key);
    });
    E.on_init('change:enabled', function(){
        E.set('state', E.get('enabled') ? 'on' : 'off'); });
}

function ext_init(){
    // XXX bahaa: auth.* abstraction is not needed anymore
    E.on_init('change:uuid change:session_key', function(){
	var id = E.get('uuid'), key = E.get('session_key');
        var stamp = E.get('auth.stamp')||0;
        var change = {'auth.id': id, 'auth.key': key}, diff;
        if (!(diff = E.changedAttributes(change)))
            return;
        diff['auth.stamp'] = stamp+1;
        E.safe_set(diff);
    });
    E.on_init('change:ext.conflict', function(){
        if (E.get('ext.conflict'))
            be_lib.perr_err({id: 'be_ext_conflict'});
    });
    E.on('change:use_http', function(){
        var http = E.get('use_http');
	conf.url_ccgi = conf.url_ccgi.replace(
            http ? /^https:\/\// : /^http:\/\//,
            http ? 'http://' : 'https://');
    });
}

function vpn_init(){
    E.on_init('change:session_key change:state change:ext.conflict '+
	'change:ext.slave change:uuid', function(){
	var vpn_on, ext_enabled;
	if (E.get('ext.slave') || E.get('ext.conflict'))
	    vpn_on = ext_enabled = false;
	else
	{
	    ext_enabled = E.get('state')=='on';
	    vpn_on = ext_enabled && E.get('uuid') && E.get('session_key');
	}
        E.safe_set({'r.vpn.on': !!vpn_on, 'r.ext.enabled': !!ext_enabled});
    });
}

E.set_enabled = function(on){
    try {
	on = !!on;
        be_bg_main.set_enabled(on);
	if (!!E.get('r.ext.enabled')!=on)
	{
	    var attributes = zutil.clone(E.attributes);
	    delete attributes['status.unblocker.effective_pac_url'];
	    be_lib.perr_err({id: 'be_set_enabled_mismatch',
		info: {on: on, attributes: attributes}});
	}
    } catch(e){
	be_lib.perr_err({id: 'be_set_enabled_err', err: e});
	throw e;
    }
};

E.qs_ver_str = function(){ return 'ver='+E.get('rmt_ver'); };

E.qs_ajax = function(o){
    var info = {rmt_ver: E.get('rmt_ver'), ext_ver: be_util.version(),
        browser: E.get('browser'), product: be_util.get_product(),
        lccgi: +!!window.is_local_ccgi};
    assign(info, o);
    return info;
};

E.auth = function(o){
    var info = E.qs_ajax();
    if (be_bg_main.get('is_svc')) /* XXX bahaa: needed? */
        info.svc_ver = be_bg_main.get('svc.version');
    info.uuid = E.get('auth.id');
    info.session_key = E.get('auth.key')||0;
    return assign(info, o);
};

return E; });
