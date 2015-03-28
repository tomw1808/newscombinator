'use strict';

angular.module('agrgtrApp')
    .filter('getfavicon', function () {
        return function(data) {
            var    a      = document.createElement('a');
            a.href = data;

            var favicon = "favicon.ico";
            if(a.hostname.indexOf("makerland") != -1) {
                favicon = "static/img/makerland_favicon_SMALL.ico";
            }
            if(a.hostname.indexOf("soylentnews") != -1) {
                favicon = "favicon-soylentnews.png";
            }
            if(a.hostname.indexOf("inbound") != -1) {
                favicon = "assets/sites/inbound/img/fav.ico";
            }
            return a.protocol + "//" + a.hostname+"/"+favicon;
        };
    });