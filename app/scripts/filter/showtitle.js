'use strict';

angular.module('agrgtrApp')
    .filter('showtitle',  function($filter) {
        return function(objResult, arrHighlight) {
            if(objResult.title_website != '' && objResult.title_website != null && objResult.title_website.indexOf("Firespotting! Interesting Ideas, Every Day!") == -1) {


                if(arrHighlight != undefined) {
                    return $filter('highlight')(objResult.title_website, arrHighlight, objResult.id, "title_website");
                } else {
                    return objResult.title_website;
                }
            }

            if(objResult.title_link != ''  && objResult.title_link != null) {
                return objResult.title_link;
            }

            return objResult.url;
        }
    });