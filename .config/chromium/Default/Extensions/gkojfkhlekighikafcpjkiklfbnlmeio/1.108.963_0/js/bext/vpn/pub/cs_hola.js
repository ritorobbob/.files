// LICENSE_CODE ZON
'use strict'; /*jslint browser:true*//*global browser*/
(function(){
var chrome = window.chrome, firefox = window.self, got_info, tries = 0;
var web_ext = firefox && !firefox.port;
firefox = web_ext ? false : firefox;

function hola_ext_present(){
    // Only <html> is present at document_start time, use it as a
    // storage to communicate presence of extension to web page.
    document.documentElement.setAttribute('hola_ext_present', 'true');
}
hola_ext_present();

function resp_cb(resp){
    if (!resp)
        return;
    resp.src = chrome ? 'hola_chrome' : 'hola_firefox';
    document.defaultView.postMessage(resp, '*');
}

function embed_info(resp){
    if (!chrome && !web_ext)
    {
        if (resp.id!='ping' && resp.id!='callback' || got_info)
            return;
        got_info = true;
        firefox.port.removeListener('resp', embed_info);
    }
    resp.data = JSON.stringify(resp.data);
    /* inject a simple script to access the window object of the page */
    var el = document.createElement('script');
    el.innerHTML = 'window.hola_extension_info = '+resp.data+';';
    document.head.appendChild(el);
}

// This chain of callbacks is used for website<->bext communication only.

var allowed_origin = /^https?:\/\/(www\.)?hola\.org$/;

function message_cb(e){
    if (!(e.origin||'').match(allowed_origin))
        return;
    if (e.data.src!='hola_ccgi')
        return;
    if (chrome)
        return chrome.runtime.sendMessage(e.data, resp_cb);
    if (web_ext)
        return browser.runtime.sendMessage(e.data, resp_cb);
    firefox.port.emit('req', e.data);
}
window.addEventListener('message', message_cb, false);
if (chrome)
    return chrome.runtime.sendMessage({id: 'ping'}, embed_info);
if (web_ext)
    return browser.runtime.sendMessage({id: 'ping'}, embed_info);

function get_info_ff(){
    if (got_info)
        return;
    if (tries++>10)
        return console.error('failed to get info from extensions');
    firefox.port.emit('req', {id: 'ping'});
    setTimeout(get_info_ff, 200);
}

function uninit(){
    try {
        window.removeEventListener('message', message_cb);
    } catch(e){}
    firefox.port.removeListener('resp', resp_cb);
    firefox.port.removeListener('resp', embed_info);
    firefox.removeListener('detach', uninit);
    firefox.port.removeListener('detach', uninit);
}
firefox.port.on('resp', resp_cb);
firefox.port.on('resp', embed_info);
firefox.on('detach', uninit); // FF<30
firefox.port.on('detach', uninit); // FF>=30
get_info_ff();

})();
