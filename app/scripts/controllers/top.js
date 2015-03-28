'use strict';

/**
 * @ngdoc function
 * @name agrgtrApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the agrgtrApp
 */
angular.module('agrgtrApp')
    .controller('TopCtrl', function ($scope, TopnewsService, $location, $routeParams, $route, $window, amTimeAgoConfig) {

        $scope.collapsed = {};

        $scope.collapsed['mobile_menu'] = true;
        $scope.collapsed['sources'] = true;
        $scope.collapsed['top_entities'] = true;
        $scope.collapsed['top_tags'] = true;
        if("qs" in $routeParams) {
            TopnewsService.query = angular.fromJson($routeParams.qs);

            if("dates" in TopnewsService.query) {
                if ("from_date" in TopnewsService.query.dates && TopnewsService.query.dates.from_date != null) {
                    TopnewsService.query.dates.from_date = new Date(TopnewsService.query.dates.from_date);
                }
                if ("to_date" in TopnewsService.query.dates  && TopnewsService.query.dates.to_date != null) {
                    TopnewsService.query.dates.to_date = new Date(TopnewsService.query.dates.to_date);
                }
            }
        } else {
            TopnewsService.reset();
        }
        if("ranking" in $routeParams) {
            $scope.ranking = angular.fromJson($routeParams.ranking);
            if($scope.ranking == 'custom') {
                $scope.collapsed['ranking_custom'] = false;
            } else {
                $scope.collapsed['ranking_custom'] = true;
            }
        } else {
            $scope.ranking = "top";
            $scope.collapsed['ranking_custom'] = true;
        }

        TopnewsService.loadNews(true);

        $scope.getResults = function () {
            return TopnewsService.results;
        };



        $scope.date = TopnewsService.query.dates;

        $scope.q = TopnewsService.query.custom;

        $scope.importancy = TopnewsService.query.importancy;
        $scope.sources = TopnewsService.query.sourcelinks;



        $scope.toggleCollapsed = function (objArticle, forceopen) {
            if (forceopen == true) {
                $scope.collapsed[objArticle.id] = false;
                TopnewsService.fetchSimilarToArticle(objArticle);
                TopnewsService.fetchSourceitems(objArticle);
            } else {
                if (!(objArticle.id in $scope.collapsed) || $scope.collapsed[objArticle.id]) {

                    $scope.collapsed[objArticle.id] = false;
                    TopnewsService.fetchSimilarToArticle(objArticle);
                    TopnewsService.fetchSourceitems(objArticle);


                } else {
                    $scope.collapsed[objArticle.id] = !$scope.collapsed[objArticle.id];
                }
            }
        };

        $scope.nextPage = function () {
            amTimeAgoConfig.serverTime = new Date().getTime()+(60*60*1000);
            TopnewsService.nextPage();
        };

        $scope.getTopEntities = function () {
            return TopnewsService.entities;
        };
        $scope.getTopSentiments = function () {
            return TopnewsService.sentiments;
        };
        $scope.getTopTags = function () {
            return TopnewsService.tags;
        };


        $scope.addEntity = function (entity) {
            TopnewsService.addEntity(entity);
            $scope.startSearch();
        };
        $scope.addTag = function (tag) {
            TopnewsService.addTag(tag);
            $scope.startSearch();
        };

        $scope.getSelectedEntities = function () {
            return TopnewsService.query.entities;
        };
        $scope.getSelectedTags = function () {
            return TopnewsService.query.tags;
        };

        $scope.removeEntity = function (index) {
            TopnewsService.removeEntity(index);

            $scope.startSearch();
        };
        $scope.removeTag = function (index) {
            TopnewsService.removeTag(index);

            $scope.startSearch();
        };

        $scope.setQuery = function(query) {
            $scope.q = query;
            $scope.startSearch();
        };

        $scope.setStartDate = function(date) {
            $scope.date.from_date = date;
            $scope.startSearch();
        };
        $scope.setEndDate = function(date) {
            $scope.date.to_date = date;
            $scope.startSearch();
        };

        $scope.toolTipContentFunction = function (obj) {
            console.log(obj);
        };

        $scope.isLoading = function () {
            return TopnewsService.siteState.loading;
        };

        $scope.reloadData = function () {
            $route.reload();
            //TopnewsService.loadNews(true);
        };

        $scope.getJsonLink = function() {
            return "http://nagrgtr.com/api/search/?dismax=0&highlight=0&only_newest_similar=0&rows=30&q="+escape(TopnewsService.getQueryString());
        };

        $scope.startSearch = function () {
            amTimeAgoConfig.serverTime = new Date().getTime()+(60*60*1000);
            TopnewsService.query.custom = $scope.q;
            //var qs = angular.toJson(TopnewsService.query);
            $location.search({qs: angular.toJson(TopnewsService.query), ranking: angular.toJson($scope.ranking)});
            //$location.search({a: "blubb", b: "bla"});
            //$window.location.href = "/#/?qs=" + escape(angular.toJson(TopnewsService.query)) + "&ranking="+escape(angular.toJson($scope.ranking));
        };

        $scope.resetData = function () {
            TopnewsService.reset();
            $location.search({qs: angular.toJson(TopnewsService.query)});
            //TopnewsService.loadNews(true);
        };

        $scope.chartEntityXFunction = function (x) {
            if (x.key == -2) {
                return "Very Bad News";
            } else if (x.key == -1) {
                return "Bad News";
            } else if (x.key == 0) {
                return "Neutral News";
            } else if (x.key == 1) {
                return "Good News";
            } else if (x.key == 2) {
                return "Very Good News";
            }
        };
        $scope.chartEntityYFunction = function (y) {
            return y.val;
        };

        $scope.open = function ($event, datepicker) {
            $event.preventDefault();
            $event.stopPropagation();
            if ($scope.opened == undefined) {
                $scope.opened = {};
            }

            $scope.opened[datepicker] = true;
        };

        $scope.setRanking = function(type) {
            $scope.ranking = type;
        };



    });

