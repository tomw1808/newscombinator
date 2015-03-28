'use strict';

angular.module('agrgtrApp')
    .factory('TopnewsResource', function ($resource, ENV) {
        return $resource (
            ENV.apiEndpoint + "search/topsimilar/"
        );
    });
