// LICENSE_CODE ZON
'use strict'; /*jslint browser:true*/
define(['jquery', '/bext/pub/backbone.js', '/bext/pub/browser.js',
    '/util/zerr.js', '/bext/pub/popup_lib.js', '/bext/pub/util.js',
    '/bext/pub/locale.js', '/util/escape.js', '/util/etask.js', 'underscore',
    '/util/storage.js', 'purl', '/util/util.js'],
    function($, be_backbone, B, zerr, be_popup_lib, be_util, T, zescape,
    etask, _, storage, purl, zutil){
var chrome = window.chrome, conf = window.conf, zconf = window.zon_config;
var E = new (be_backbone.model.extend())();

// XXX alexeym: unify with www/hola/pub/be.js
function print_product_info($info, build, dev){
    function add_line(s, val){
        $('<div>').append($('<span>').text(s), $('<span>').text(val))
            .appendTo($info);
        return s+val+'\n';
    }
    var s = '';
    if (build.ext_version)
        s += add_line('Ext version: ', build.ext_version);
    else
        s += add_line('Ext version: ', be_util.version());
    if (build.rmt_version)
    {
        s += add_line('RMT version: ', build.rmt_version);
        if (build.server_version)
            s += add_line('WWW version: ', build.server_version);
    }
    else if (build.server_version)
        s += add_line('RMT version: ', build.server_version);
    if (build.svc_version)
        s += add_line(T('Service')+': ', build.svc_version);
    if (build.svc_mode)
    {
        var mode = build.svc_mode+' active';
        if (build.svc_mode_pending)
            mode += ', '+build.svc_mode_pending+' pending';
        s += add_line(T('Mode')+': ', mode);
    }
    if (build.product_type)
        s += add_line(T('Product')+': ', build.product_type);
    if (build.browser2)
        s += add_line(T('Browser')+': ', build.browser2);
    else if (build.browser)
        s += add_line(T('Browser')+': ', build.browser);
    if (build.platform)
        s += add_line(T('Platform')+': ', build.platform);
    var cid, uuid;
    if (E.be_bg_main)
    {
        if (E.be_bg_main.get('svc.cid'))
            cid = E.be_bg_main.get('svc.cid');
        uuid = E.be_bg_main.get('uuid');
    }
    else
    {
        cid = build.cid;
        uuid = build.uuid;
    }
    if (cid)
        s += add_line(T('CID')+': ', cid);
    if (uuid)
        s += add_line('UUID: ', uuid);
    if (dev)
        s += add_line('Dev info: ', dev);
    return s;
}

function ver_info(){
    var $mailto;
    var build = be_util.build_info(), dev = dev_info();
    var $info = $('<div>'), $el = $('<div>').append($info);
    var s = print_product_info($info, build, dev);
    $('<div>').append($('<span>').text(T('Report a problem')+': '),
        $mailto = $('<a>', {href: zescape.mailto_url({
	to: 'help_be@hola.org',
        subject: 'Problem with Hola extension',
	body: '(Please include a brief explanation of the problem and '
	+'a screenshot if possible)\n\n'
	+'Information automatically generated about my problem:\n'+s})})
	.text('help_be@hola.org')
	.click(function(e){
            be_popup_lib.perr_err({id: 'be_report_problem',
                rate_limit: {count: 1}});
            if (chrome)
                return;
            e.preventDefault();
            var link = $(e.target).attr('href');
            /* for firefox open in new window which will offer to send with
             * gmail, yahoo, etc.. if no mail client present */
            window.open(link, '_blank', 'resizable');
        }))
    .appendTo($info);
    if (chrome)
    {
        /* workaround mailto links not working in chrome about */
        $mailto.attr('target', 'report_mailto_frame');
        $info.append($('<iframe>', {id: 'report_mailto_frame'}).hide());
    }
    return $el;
}

function dev_info(){
    try {
        var a = [], manifest;
        if (chrome && !(manifest = chrome.runtime.getManifest()).update_url &&
            !zutil.get(manifest, 'applications.gecko.update_url'))
        {
            a.push('no update');
        }
        if (chrome && !conf.browser.firefox &&
            !be_util.ext_type(chrome.runtime.id))
        {
            a.push('unknown id');
        }
        if (zconf._RELEASE_LEVEL!=2)
        {
            if (zconf._RELEASE_LEVEL==1)
                a.push('rel1');
            if (zconf.BUILDTYPE_DEBUG)
                a.push('debug');
        }
        if (conf.arch)
            a.push(conf.arch);
        return a.join(',');
    } catch(e){ zerr('dev_info %s', zerr.e2s(e)); }
    return '';
}

function parse_dev_cmds(){
    var qs;
    try { qs = $.url().data.param.query; } catch(e){ return; }
    _.each(qs, function(v, k){
        if (!k.startsWith('storage.'))
            return;
        k = k.substr(8); // 'storage.'.length
        if (v)
            storage.set(k, v);
        else
            storage.clr(k);
    });
}

var dev_mode_counter = 0;
function dev_mode_init(){
    if (!E.R.be_dev_mode)
        return;
    $('#title').on('click', function(){
        dev_mode_counter++;
        if (dev_mode_counter!=5)
            return;
        E.R.be_dev_mode.fcall('enable');
        window.alert('Dev mode activated.');
    });
}

function post_init(){
    window.RMT = E.R; // XXX amir: fix nicely
    zerr.notice('l.about inited');
    $('.content').append(ver_info());
    dev_mode_init();
    parse_dev_cmds();
}

E.init = function(){
    if (E.inited)
        return;
    E.inited = true;
    $(window).unload(function(){ E.uninit(); });
    B.init({context: null});
    etask([function bg_ping(){
        E.et = this;
        if (!B.use_msg)
            return this.goto('got_bg');
        return etask.cb_apply(B.backbone.client, '.ping', ['be_bg_main', 500]);
    }, function(ret){
        if (!ret.error)
            return this.continue();
        zerr('l.popup ping bg failed %s', zerr.json(ret));
        return this.goto('bg_ping');
    }, function got_bg(){
	zerr.notice('l.about got bg');
	E.be_bg_main = B.backbone.client.start('be_bg_main');
        if (B.use_msg)
            return wait_for(E.be_bg_main, '_backbone_client_started', true);
    }, function(){
        return wait_for(E.be_bg_main, 'inited', true);
    }, function(){
        if (!B.use_msg)
            return E.R = B.bg && B.bg.RMT;
        E.R = B.backbone.client.start('RMT');
        return wait_for(E.R, '_backbone_client_started', true, 500);
    }, function(){
        if (!B.use_msg)
            return;
        E.R.be_ext = B.backbone.client.start('be_ext');
        return wait_for(E.R.be_ext, '_backbone_client_started', true, 500);
    }, function(){
        if (!B.use_msg)
            return;
        E.R.be_mode = B.backbone.client.start('be_mode');
        return wait_for(E.R.be_mode, '_backbone_client_started', true, 500);
    }, function catch$(err){
        if (E.R && err=='timeout')
            return;
        throw err;
    }, function(){
        setTimeout(post_init);
    }, function catch$(err){
        zerr('be_about_main_init_err', err);
    }, function finally$(){
        E.et = null;
    }]);
};

E.uninit = function(){
    if (!E.inited)
	return;
    E.inited = false;
    if (E.et)
        E.et.return();
    B.backbone.client.stop('be_bg_main');
    B.backbone.client.stop('RMT');
    B._destroy();
    E.off();
    E.stopListening();
};

// XXX bahaa/arik: add to be_backbone?
function wait_for(obj, key, val, timeout){
    var l;
    return etask([function(){
        var _this = this;
        E.listen_to(obj, 'change:'+key, l = function(){
            if (obj.get(key)===val)
                _this.continue();
        });
        return this.wait(timeout);
    }, function finally$(){
        E.stopListening(obj, 'change:'+key, l);
    }]);
}

return E; });
