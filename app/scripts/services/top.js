'use strict';

angular.module('agrgtrApp')
    .service('TopnewsService', function (SearchResource, SourceitemsResource, $q) {
        var self = this;
        self.start = 0;
        self.siteState = {loading: false};
        self.topEntities = [];
        self.news = [];





        self.getQueryString = function () {
            var queryString = '( _val_:"log(add(1,hn_num_points))"^'+self.query.importancy.points*2.5+' _val_:"log(add(1,similar_doc_ids_count_i))"^'+self.query.importancy.similar*5+' _val_:"recip(ms(NOW/HOUR,created_at),3.16e-11,2300,1)"^'+self.query.importancy.age+')';
            for(var i = 0; i < self.query.entities.length; i++) {
                queryString += ' +named_entities:"'+self.query.entities[i]+'"';
            }
            for(i = 0; i < self.query.tags.length; i++) {
                queryString += ' +content_analyze:'+self.query.tags[i];
            }

            if("sourcelinks" in self.query) {
                var source_links_set = false;
                for (i = 0; i < self.query.sourcelinks.length; i++) {
                    if (self.query.sourcelinks[i].checked == 1) {
                        if(!source_links_set) {
                            queryString += " AND (";
                            source_links_set = true;
                        }
                        queryString += " source_links:*" + self.query.sourcelinks[i].host+"*";
                    }
                }
                if(source_links_set) {
                    queryString += " )";
                }
            }

            if(self.query.custom.length > 0) {
                queryString += ' '+self.query.custom+' ';
            }


            if(self.query.dates.from_date instanceof Date || self.query.dates.to_date instanceof Date) {
                queryString += ' AND (created_at:[';
                if(self.query.dates.from_date instanceof Date) {
                    queryString += self.query.dates.from_date.toISOString();
                } else {
                    queryString += "*";
                }
                queryString += " TO ";

                if(self.query.dates.to_date instanceof Date) {
                    queryString += self.query.dates.to_date.toISOString();
                } else {
                    queryString += "*";
                }
                queryString += "])"
            }
            return queryString;
        };

        self.groupBySimilar = function() {
            return self.query.custom == "" ? "1" : "0";
        };

        self.getLoading = function () {
            return self.siteState.loading;
        };


        self.fetchSimilarToArticle = function (objArticle) {
            if (!("similar_docs" in objArticle) || objArticle.similar_docs == null) {
                SearchResource.query({
                    "q": "{!join from=similar_doc_ids to=id}id:" + objArticle.id,
                    "dismax": 0,
                    "highlight": 0,
                    "only_newest_similar": 0,
                    "rows": 30,
                    "order_by_desc": "created_at"
                }, function (result) {
                    objArticle.similar_docs = result.response.docs;
                });

            }
        };

        self.fetchSourceitems = function(objArticle) {
            if (!("sourceitems" in objArticle) || objArticle.sourceitems == null) {
                SourceitemsResource.query({"id": objArticle.id},function(result) {
                    objArticle.sourceitems = result;
                })
            }
        };

        self.getTopEntities = function (force) {
            if (!("$promise" in self.topEntities) || force) {
                var queryObj = {
                    "q": self.getQueryString(),
                    "fq[1]": "newest_similar_doc:true",
                    "facet": "1",
                    "highlight": "0",
                    "dismax": 0,
                    "rows": 0
                };

                if(self.query.custom == "" && self.query.entities.length == 0) {
                    queryObj["fq[2]"] =  "created_at:[NOW/DAY TO *]";
                }
                self.topEntities = SearchResource.query(queryObj, function (results) {

                    var entities = [];
                    var tags = [];
                    var sentiments = [];
                    var ent_for = results.facet_counts.facet_fields.entities;
                    var max_value = 0;
                    for (var i = 0; i < ent_for.length; i = i + 2) {
                        var obj_entity = {};

                        if (i == 0) {
                            max_value = ent_for[i + 1];
                        }
                        obj_entity.key = ent_for[i];

                        obj_entity.val = ent_for[i + 1];
                        obj_entity.perc = 100 * ent_for[i + 1] / max_value;

                        entities.push(obj_entity);
                        if (i > 30) {
                            break;
                        }
                    }

                    ent_for = results.facet_counts.facet_fields.keywords;
                    max_value = 0;
                    for (i = 0; i < ent_for.length; i = i + 2) {
                        var obj_tag = {};

                        if (i == 0) {
                            max_value = ent_for[i + 1];
                        }
                        obj_tag.key = ent_for[i];

                        obj_tag.val = ent_for[i + 1];
                        obj_tag.perc = 100 * ent_for[i + 1] / max_value;

                        tags.push(obj_tag);
                        if (i > 50) {
                            break;
                        }
                    }

                    ent_for = results.facet_counts.facet_ranges.sentiment.counts;
                    for (i = 0; i < ent_for.length; i = i + 2) {
                        var obj_entity = {};

                        obj_entity.key = ent_for[i];

                        obj_entity.val = ent_for[i + 1];

                        sentiments.push(obj_entity);

                    }


                    self.sentiments = sentiments;
                    self.entities = entities;
                    self.tags = tags;
                });
            }

            return self.topEntities.$promise;
        };

        self.loadNews = function (force) {
            self.siteState.loading = true;
            var deferred = $q.defer();
            if (!("$promise" in self.news) || force) {
                self.news = SearchResource.query({
                    "q": self.getQueryString(),
                    "dismax": 0,
                    "highlight": 0,
                    "only_newest_similar": self.groupBySimilar(),
                    "rows": 30
                });
            }

            self.news.$promise.then(function (result) {
                self.results = result.response.docs;
                self.start = result.response.docs.length;
                self.numFound = result.response.numFound;
                self.maxScore = result.response.maxScore;
                self.siteState.loading = false;
                self.getTopEntities(force);
                deferred.resolve(self.results);
            }, function () {
                deferred.reject();
            });

            return deferred.promise;
        };

        self.getQueryEntities = function () {
            return self.query.entities;
        };
        self.removeEntity = function (index) {
            if(self.query.entities[index] != undefined) {
                self.query.entities.splice(index,1);
            }

        };

        self.addEntity = function(entity) {

            var add = true;
            //do nothing if entity is already in the list
            angular.forEach(self.query.entities, function(value) {
                if(value == entity) {
                    add = false;
                }
            });
            if(add) {
                self.query.entities.push(entity);
                return true;
            }
            return false;
        };

        self.getResults = function () {
            return self.results;
        };

        self.setQuery = function(query) {
            self.query.custom = query;

        };

        self.getQueryTags = function () {
            return self.query.tags;
        };
        self.removeTag = function (index) {
            if(self.query.tags[index] != undefined) {
                self.query.tags.splice(index,1);
            }

        };

        self.addTag = function(tag) {

            var add = true;
            //do nothing if entity is already in the list
            angular.forEach(self.query.tags, function(value) {
                if(value == tag) {
                    add = false;
                }
            });
            if(add) {
                self.query.tags.push(tag);
                return true;
            }
            return false;
        };

        self.getResults = function () {
            return self.results;
        };

        self.setQuery = function(query) {
            self.query.custom = query;

        };


        self.nextPage = function () {
            if (self.siteState.loading == false) {
                if (self.start < self.numFound) {
                    self.start += 10;
                    self.siteState.loading = true;
                    SearchResource.query({
                        "q": self.getQueryString(),
                        "start": self.start,
                        "dismax": 0,
                        "highlight": 0,
                        "only_newest_similar": self.groupBySimilar()
                    }, function (response) {
                        var items = response.response.docs;
                        for (var i = 0; i < items.length; i++) {
                            self.results.push(items[i]);
                        }
                        self.siteState.loading = false;
                    });
                }
            }
        };

        self.reset = function() {
            self.query = {};
            self.query.entities = [];
            self.query.tags = [];
            self.query.custom = "";
            self.query.dates = {
                from_date: null,
                to_date: null
            };
            self.query.importancy = {"points": 2.5, "similar": 2.5, "age": 2.5};

            self.query.sourcelinks = [
                {host: "ycombinator.com", checked: 0},
                {host: "/r/algorithms", checked: 0},
                {host: "/r/analytics", checked: 0},
                {host: "/r/angularjs", checked: 0},
                {host: "/r/BSD", checked: 0},
                {host: "/r/linux", checked: 0},
                {host: "/r/linuxadmin", checked: 0},
                {host: "/r/linuxdev", checked: 0},
                {host: "/r/Bitcoin", checked: 0},
                {host: "coinspotting", checked: 0},
                {host: "/r/Entrepreneur", checked: 0},
                {host: "/r/crypto", checked: 0},
                {host: "/r/MachineLearning", checked: 0},
                {host: "/r/dataisbeautiful", checked: 0},
                {host: "datatau", checked: 0},
                {host: "devmaster.net", checked: 0},
                {host: "dzone.com", checked: 0},
                {host: "echojs.com", checked: 0},
                {host: "/r/webdev", checked: 0},
                {host: "/r/web_design", checked: 0},
                {host: "pullup.io", checked: 0},
                {host: "lobste.rs", checked: 0},
                {host: "slashdot.org", checked: 0},
                {host: "soylentnews.org", checked: 0},
                {host: "firespotting.com", checked: 0},
                {host: "woodspotting.com", checked: 0}
            ];
        };


    });