'use strict';

/**
 * @ngdoc overview
 * @name agrgtrApp
 * @description
 * # agrgtrApp
 *
 * Main module of the application.
 */
angular
    .module('agrgtrApp', [
        'ngAnimate',
        'ngCookies',
        'ngResource',
        'ngRoute',
        'ngSanitize',
        'ngTouch',
        'config',
        'ui.bootstrap',
        'angular-loading-bar',
        'duScroll',
        'infinite-scroll',
        'truncate',
        'angularMoment'
    ])
    .config(function ($routeProvider, $httpProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/top.html',
                controller: 'TopCtrl',
                reloadOnSearch: true



            })

            .when('/about', {
                templateUrl: 'views/about.html',
                controller: 'MainCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });



        // Use x-www-form-urlencoded Content-Type
        $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
        $httpProvider.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

        /**
         * The workhorse; converts an object to x-www-form-urlencoded serialization.
         * @param {Object} obj
         * @return {String}
         */
        var param = function (obj) {
            var query = '', name, value, fullSubName, subName, subValue, innerObj, i;

            for (name in obj) {
                value = obj[name];

                if (value instanceof Array) {
                    for (i = 0; i < value.length; ++i) {
                        subValue = value[i];
                        fullSubName = name + '[' + i + ']';
                        innerObj = {};
                        innerObj[fullSubName] = subValue;
                        query += param(innerObj) + '&';
                    }
                }
                else if (value instanceof Object) {
                    for (subName in value) {
                        subValue = value[subName];
                        fullSubName = name + '[' + subName + ']';
                        innerObj = {};
                        innerObj[fullSubName] = subValue;
                        query += param(innerObj) + '&';
                    }
                }
                else if (value !== undefined && value !== null)
                    query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
            }

            return query.length ? query.substr(0, query.length - 1) : query;
        };

        // Override $http service's default transformRequest
        $httpProvider.defaults.transformRequest = [function (data) {
            return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
        }];
    }).directive('navAutoClose', function () {
        return function (scope, elm, attrs) {
            var collapsible = $(elm).find(".navbar-collapse");
            var visible = false;

            collapsible.on("show.bs.collapse", function () {
                visible = true;
            });

            collapsible.on("hide.bs.collapse", function () {
                visible = false;
            });

            $(elm).find("a").each(function (index, element) {
                $(element).click(function (e) {
                    if (visible && "auto" == collapsible.css("overflow-y")) {
                        collapsible.collapse("hide");
                    }
                });
            });
        }
    });


