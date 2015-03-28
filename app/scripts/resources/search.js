'use strict';

angular.module('agrgtrApp')
    .factory('SearchResource', function ($resource, ENV) {
        return $resource (
            ENV.apiEndpoint + "search/", {}, {query: {isArray: false}}
        );
    });
