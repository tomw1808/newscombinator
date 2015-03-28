'use strict';

angular.module('agrgtrApp')
    .filter('pad',  function() {
        return function(n) {
            n = n + '';
            return n.length >= 10 ? n : new Array(10 - n.length + 1).join('0') + n;
        }
    });