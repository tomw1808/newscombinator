'use strict';

angular.module('agrgtrApp')
    .factory('SourceitemsResource', function ($resource, ENV) {
        return $resource (
            ENV.apiEndpoint + "search/sourceitems/"
        );
    });
