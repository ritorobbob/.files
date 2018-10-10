// LICENSE_CODE ZON
'use strict'; /*jslint node:true, browser:true*/
(function(){
var define;
var is_node = typeof module=='object' && module.exports;
if (!is_node)
    define = self.define;
else
    define = require('../../../util/require_node.js').define(module, '../');
define([], function(){
var E = {};

function get_end_by_period(membership){
    var end = new Date(membership.start);
    if (membership.period=='1 M')
        end.setUTCMonth(end.getUTCMonth()+1);
    else if (membership.period=='6 M')
        end.setUTCMonth(end.getUTCMonth()+6);
    else if (membership.period=='1 Y')
        end.setUTCFullYear(end.getUTCFullYear()+1);
    else if (membership.period=='2 Y')
        end.setUTCFullYear(end.getUTCFullYear()+2);
    else
        throw 'Unexpected period: '+membership.period;
    return end;
}

E.get_end_date = function(membership){
    var end = membership && (membership.end || membership.trial_end ||
        membership.start && membership.period &&
        get_end_by_period(membership));
    return end ? new Date(end) : null;
};

E.is_active = function(membership){
    if (!membership)
        return false;
    if (membership.trial_end && Date.now()<=new Date(membership.trial_end))
        return true;
    if (membership.end && Date.now()<=new Date(membership.end))
        return true;
    if (membership.start && membership.period &&
        Date.now()<=get_end_by_period(membership))
    {
        return !membership.cancelled || !membership.end;
    }
    return false;
};

E.is_in_trial = function(membership){
    return E.is_trial(membership) && Date.now()<new Date(membership.trial_end);
};

E.is_trial = function(membership, type){
    return !!membership && !!membership.trial_end &&
        (!type || type==(membership.type||'start'));
};

E.had_premium = function(history){
    return !!history && history.some(function(h){ return !E.is_trial(h); });
};

E.had_trial = function(history, type){
    return !!history && history.some(function(h){
        return E.is_trial(h, type); });
};

E.trial_forbidden = function(membership, hisotry, type){
    if (E.is_in_trial(membership))
        return 'trial exists';
    if (E.is_trial(membership, type))
        return 'trial expired';
    if (E.is_active(membership))
        return 'already premium';
    if (E.had_premium(hisotry))
        return 'had premium';
    if (E.had_trial(hisotry, type))
        return 'had trial';
    return false;
};

E.is_paid = function(membership){
    return !!membership && !!membership.gateway; };

E.is_expired = function(membership){
    var end_date = E.get_end_date(membership);
    return !!end_date && Date.now()>end_date;
};

E.classify = function(membership){
    if (E.is_active(membership))
        return E.is_in_trial(membership) ? 'trial' : 'premium';
    if (E.is_expired(membership))
        return E.is_trial(membership) ? 'trial_expired' : 'premium_expired';
    return 'free';
};

return E; }); }());
