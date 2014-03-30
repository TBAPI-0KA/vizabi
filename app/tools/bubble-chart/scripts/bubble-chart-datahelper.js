define(['d3', 'data-cube', 'util', 'data-manager'], function (d3, dataCube, util, dataManager) {

    // supposed to be available at window.vizabi.data.bubbleChartDataHelper
    var bubbleChartDataHelper = function (fileFormat, entityName, fileName, dataPathUri) {

        var _dataCube;
        var indicators;
        var entityMeta;
        var yAxisName;
        var xAxisName;
        var yAxisInfo;
        var xAxisInfo;
        var dataHelperModel;
        var dataSetInfo;
        var dataIsReadyCallback;
        var chartFooter;
        var regionsList;
        var timeUnit;
        var skeleton;
        var dmLoadIndicators = true;
        var _changedState = undefined;
        var statsLoaded = false;
        var things = {};

        var colorScale = d3.scale.category20();
        var colors = {
            America: {
                fill: "#80EC00",
                stroke: "#038000"
            },
            Europe: {
                fill: "#FFE800",
                stroke: "#CF6112"
            },
            Africa: {
                fill: "#00D6EA",
                stroke: "#07579C"
            },
            Asia: {
                fill: "#FF5973",
                stroke: "#960570"
            },
            bra: {
                fill: "#80EC00",
                stroke: "#038000"
            },
            ind: {
                fill: "#FF5973",
                stroke: "#960570"
            },
            ind_kind: {
                fill: "#D6CBBA",
                stroke: "#D6CBBA"
            },
            bra_kind: {
                fill: "#FFFF00",
                stroke: "#000000"
            },
            rest: {
                fill: "#D6CBBA",
                stroke: "#D6CBBA"
            },
            IND: {
                fill: "#FF5973",
                stroke: "#960570"
            },
            BRA: {
                fill: "#FFFF00",
                stroke: "#000000"
            },
            AME: {
                fill: "#80EC00",
                stroke: "#038000"
            },
            EUR: {
                fill: "#FFE800",
                stroke: "#CF6112"
            },
            AFR: {
                fill: "#00D6EA",
                stroke: "#07579C"
            },
            ASI: {
                fill: "#FF5973",
                stroke: "#960570"
            }
        };

        var initialize = function (callback, args) {
            var options = {dataFormat: fileFormat, entity: entityName, fileName: fileName, dataPath: dataPathUri};

            _dataCube = new dataCube();
            _dataCube.initialize(options, function (skeletonObj) {
                skeleton = skeletonObj;
                callback(args[0], args[1], args[2], args[3]);
            });
        };

        var get = function (indicator, entity, year, appModel, category) {
            var prevYear = appModel.get("prevYear");
            var nextYear = appModel.get("nextYear");
            var fraction = appModel.get("fraction");
            var entityIndicator = indicators[timeUnit][category][indicator]["years"][entity];

            if (entityIndicator && entityIndicator["trends"][prevYear] && entityIndicator["trends"][nextYear]) {
                return interpolateValueBetweenYears(entityIndicator["trends"][prevYear].v, entityIndicator["trends"][nextYear].v, fraction);
            }
        };

        var loadData = function (model, _changedState, callback) {
            dataIsReadyCallback = callback;
            dataHelperModel = model;
            changedState = _changedState;
            var dataPath = model.get("dataPath");
            var indicatorsToLoad = getIndicatorsToLoad(model);
            _dataCube.loadNestedData(model, _changedState, dataIsReady, indicatorsToLoad);
        };

        var getEntityLayerObject = function () {
            var entities = [];
            for (var entity in entityMeta) {
                if (entityMeta.hasOwnProperty(entity)) {
                    var entityObj = entityMeta[entity][0];
                    var o = {id: entityObj.id, max: get(dataHelperModel.get("sizeIndicator"), entityMeta[entity].id, getMaxYear(), dataHelperModel, entityObj.parent)};
                    entities.push(o);
                }
            }

            return entities;
        };

        var dataIsReady = function (entityObj, indicatorsObj, chartInfo, regions) {
            indicators = util.extend(true, indicators, indicatorsObj);
            entityMeta = util.extend(true, entityMeta, entityObj);

            setTimeUnit();
            if (regions) {
                regionsList = regions;
            }

            setDatasetAndChartInfo(chartInfo);

            temporaryDataManagerCaller();
        };

        var temporaryDataManagerCaller = function() {
            if (changedState.language) dmLoadIndicators = true;

            var totalReq = 8;

            var action = function() {
                if (!--totalReq) {
                    setAxesNameAndInfo();
                    if (typeof dataIsReadyCallback === 'function') {
                        dataIsReadyCallback();
                    }
                }
            }

            if (dmLoadIndicators && !statsLoaded) {
                var lang = changedState.language;
                
                dataManager.getIndicator('gdp', lang, action);
                dataManager.getIndicator('gdp_per_cap', lang, action);
                dataManager.getIndicator('lex', lang, action);
                dataManager.getIndicator('pop', lang, action);
                
                dataManager.getCategory('unstate', lang, function(resp) {
                    for (var i = 0; i < resp.things.length; i++) {
                        things[resp.things[i].id] = resp.things[i].name;
                    }
                    action();
                });
                
                dataManager.getStats('pop', action);
                dataManager.getStats('lex', action);
                dataManager.getStats('gdp', action);
                
                dmLoadIndicators = false;
                statsLoaded = true;
            } else if (dmLoadIndicators) {
                var totalReq = 5;
                var lang = changedState.language;
                
                dataManager.getIndicator('gdp', lang, action);
                dataManager.getIndicator('gdp_per_cap', lang, action);
                dataManager.getIndicator('lex', lang, action);
                dataManager.getIndicator('pop', lang, action);
                
                dataManager.getCategory('unstate', lang, function(resp) {
                    for (var i = 0; i < resp.things.length; i++) {
                        things[resp.things[i].id] = resp.things[i].name;
                    }
                    action();
                });
                dmLoadIndicators = false;
            } else {
                if (typeof dataIsReadyCallback === 'function') {
                    dataIsReadyCallback();
                }
            }
        }

        var setTimeUnit = function () {
            for (var unit in indicators) {
                if (indicators.hasOwnProperty(unit)) {
                    timeUnit = unit;
                }
            }
        };


        var getIndicatorsToLoad = function (model) {
            var dataPath = model.get("dataPath");
            var entity = model.get("entity");
            var indicatorsToLoad = {};
            var categories = model.get("category");
            var indicators = [model.get("xIndicator"), model.get("yIndicator"), model.get("sizeIndicator")];
            var skeletonCategories = skeleton.categories;

            if (categories.length === 0) {
                categories.push(entity);
            }

            for (var i = 0; i < categories.length; i++) {
                indicatorsToLoad[categories[i]] = [];
                if (skeletonCategories && skeletonCategories.length > 0) {
                    for (var j = 0; j < skeletonCategories.length; j++) {
                        if (categories[i] === skeletonCategories[j].id) {
                            var loadedIndicators = skeletonCategories[j].things;
                            if (loadedIndicators.length > 0) {
                                // Check which indicators are already loaded
                                for (k = 0; k < indicators.length; k++) {
                                    var indicatorLoaded = false;
                                    for (var m = 0; m < loadedIndicators.length; m++) {
                                        if (loadedIndicators[m] === indicators[k]) {
                                            indicatorLoaded = true;
                                        }
                                    }

                                    if (!indicatorLoaded) {
                                        indicatorsToLoad[categories[i]].push(indicators[k]);
                                    }
                                }
                            }
                            else {
                                // No indicator for this category loaded; load all of them
                                for (var k = 0; k < indicators.length; k++) {
                                    indicatorsToLoad[categories[i]].push(indicators[k]);
                                }
                            }
                        }
                    }
                }
                else {
                    for (var k = 0; k < indicators.length; k++) {
                        indicatorsToLoad[categories[i]].push(indicators[k]);
                    }
                }
            }


            for (var category in indicatorsToLoad) {
                if (indicatorsToLoad.hasOwnProperty(category)) {
                    if (indicatorsToLoad[category].length === 0) {
                        delete indicatorsToLoad[category];
                    }
                }
            }

            return indicatorsToLoad;
        };


        var getScopeOfIndicators = function (indicator, isMax) {
            var index = 0;
            var indicatorName = dataHelperModel.get(indicator);
            var scopeOfIndicators = [];

            if (isMax) {
                index = 1;
            }

            for (var entity in indicators[timeUnit]) {
                if (indicators[timeUnit].hasOwnProperty(entity)) {
                    for (var ind in indicators[timeUnit][entity]) {
                        if (ind === indicatorName) {
                            scopeOfIndicators.push(indicators[timeUnit][entity][ind]["scope"]["value"][index]);
                        }
                    }
                }
            }

            var scopeValue;
            if (isMax) {
                scopeValue = Math.max.apply(Math, scopeOfIndicators);
            }
            else {
                scopeValue = Math.min.apply(Math, scopeOfIndicators);
            }

            return scopeValue;

        };

        var getTimeScope = function (isMax) {
            var index = 0;
            var scopeOfIndicators = [];

            if (isMax) {
                index = 1;
            }

            for (var entity in indicators[timeUnit]) {
                if (indicators[timeUnit].hasOwnProperty(entity)) {
                    for (var indicatorName in indicators[timeUnit][entity]) {
                        if (indicators[timeUnit][entity].hasOwnProperty(indicatorName)) {
                            scopeOfIndicators.push(indicators[timeUnit][entity][indicatorName]["scope"]["time"][index]);
                        }
                    }
                }
            }

            return Math.max.apply(Math, scopeOfIndicators);
        };

        var getDataObject = function (year) {
            var currentEntities = [];
            var category = dataHelperModel.get("entity") || dataHelperModel.get("category");

            for (var entityId in entityMeta) {
                if (entityMeta.hasOwnProperty(entityId)) {
                    currentEntities[entityId] = [];
                    var entityCategory = entityMeta[entityId][0].parent;
                    if (category.indexOf(entityCategory) >= 0) {
                        var o = {
                            id: entityId,
                            x: dataManager.retrieve('gdp', entityId, year) / dataManager.retrieve('pop', entityId, year),
                            //get(dataHelperModel.get("xIndicator"), entityId, year, dataHelperModel, entityCategory),
                            y: dataManager.retrieve('lex', entityId, year),
                            //get(dataHelperModel.get("yIndicator"), entityId, year, dataHelperModel, entityCategory),
                            size: dataManager.retrieve('pop', entityId, year),
                            //get(dataHelperModel.get("sizeIndicator"), entityId, year, dataHelperModel, entityCategory),
                            color: getColor(entityId, "fill", entityCategory),
                            year: year,
                            category: entityCategory
                        };

                        if (o.x && o.y && o.size) {
                            currentEntities[entityId].push(o);
                        }
                    }
                }
            }

            return currentEntities;
        };

        var getEntityMeta = function () {
            return entityMeta;
        };

        var getNestedData = function () {
            return indicators;
        };

        var getMaxOfXIndicator = function () {
            return getScopeOfIndicators("xIndicator", true);
        };

        var getMinOfXIndicator = function () {
            return getScopeOfIndicators("xIndicator", false);
        };

        var getMaxOfYIndicator = function () {
            return getScopeOfIndicators("yIndicator", true);
        };

        var getMinOfYIndicator = function () {
            return getScopeOfIndicators("yIndicator", false);
        };

        var getMinOfSizeIndicator = function () {
            return getScopeOfIndicators("sizeIndicator", false);
        };

        var getMaxOfSizeIndicator = function () {
            return getScopeOfIndicators("sizeIndicator", true);
        };

        var getMinYear = function () {
            return getTimeScope(false);
        };

        var getMaxYear = function () {
            return getTimeScope(true);
        };

        var getChartInfo = function () {
            return dataSetInfo;
        };

        var getChartFooter = function () {
            return chartFooter;
        };

        var getAxisNames = function () {
            return [xAxisName, yAxisName];
        };

        var getAxisInfo = function () {
            return [xAxisInfo, yAxisInfo];
        };

        var getColor = function (id, type, category) {
            //var region = entityMeta[category][id][0].region;
            var region = entityMeta[id][0].region;
            if (colors[region]) {
                return colors[region][type];
            }
            else if (regionsList.length > 0) {
                return colorScale(regionsList.indexOf(region));
            }
            else {
                return "#FF5973";
            }
        };

        var interpolateValueBetweenYears = function (prevNumber, nextNumber, fraction) {
            return prevNumber + (nextNumber - prevNumber) * fraction;
        };

        var getName = function (id, category) {
            //return entityMeta[id][0].name;
            return things[id.toLowerCase()];
        };

        var setDatasetAndChartInfo = function (chartInfo) {
            if (chartInfo) {
                dataSetInfo = chartInfo[0];
                chartFooter = chartInfo[1];
            }
        };

        var setAxesNameAndInfo = function () {
            var xIndicator = dataHelperModel.get("xIndicator");
            var yIndicator = dataHelperModel.get("yIndicator");
            //var yIndicator = dataManager.cache.definitions.indicators['lex'];
            //console.log(yIndicator);

            for (var entity in indicators[timeUnit]) {
                if (indicators[timeUnit].hasOwnProperty(entity)) {
                    for (var indicatorName in indicators[timeUnit][entity]) {
                        if (indicators[timeUnit][entity].hasOwnProperty(indicatorName) && indicatorName == xIndicator) {
                            xAxisInfo = indicators[timeUnit][entity][indicatorName]["info"].info;
                            xAxisName = dataManager.cache.definitions.indicators['gdp_per_cap'].name;
                        }
                        else if (indicators[timeUnit][entity].hasOwnProperty(indicatorName) && indicatorName == yIndicator) {
                            yAxisInfo = indicators[timeUnit][entity][indicatorName]["info"].info;
                            yAxisName = dataManager.cache.definitions.indicators['lex'].name;
                        }
                    }
                }
            }

        };

        var getIndicatorValuesForAllEntitiesWithinYear = function (indicator, year) {
            var values = [];

        for (var category in indicators[timeUnit]) {
            if (indicators[timeUnit].hasOwnProperty(category)) {
                for (var countryName in indicators[timeUnit][category][indicator]["years"]) {
                    if (indicators[timeUnit][category][indicator]["years"].hasOwnProperty(countryName)) {
                        var curEntityIndiValue;
                        if (year % 1 === 0 && indicators[timeUnit][category][indicator]["years"][countryName]["trends"].hasOwnProperty(year)) {
                                curEntityIndiValue = indicators[timeUnit][category][indicator]["years"][countryName]["trends"][year].v;
                                values.push(curEntityIndiValue);
                        }
                        else if (indicators[timeUnit][category][indicator]["years"][countryName]["trends"].hasOwnProperty(Math.floor(year))) {
                                curEntityIndiValue = get(indicator, countryName, year, dataHelperModel, category);
                                values.push(curEntityIndiValue);
                        }
                    }
                }
            }
        }

            return values;
        };

        var getDataForYear = function (indicator, entity, year, category) {
            return indicators[timeUnit][category][indicator]["years"][entity]["trends"][year].v;
        };


        var getScopeOfIndicatorForCurrentYear = function (indicator, model) {
            var year = model.get("year");
            var scope = {};
            var indicatorValues = getIndicatorValuesForAllEntitiesWithinYear(indicator, year);

            scope.min = Math.min.apply(null, indicatorValues);
            scope.max = Math.max.apply(null, indicatorValues);

            return scope;
        };

        var getSkeleton = function () {
            return skeleton;
        };

    return {
        loadData: loadData,
        getEntityMeta: getEntityMeta,
        getNestedData: getNestedData,
        getMaxOfXIndicator: getMaxOfXIndicator,
        getMinOfXIndicator: getMinOfXIndicator,
        getMaxOfYIndicator: getMaxOfYIndicator,
        getMinOfYIndicator: getMinOfYIndicator,
        getMinOfSizeIndicator: getMinOfSizeIndicator,
        getMaxOfSizeIndicator: getMaxOfSizeIndicator,
        getScopeOfIndicatorForCurrentYear: getScopeOfIndicatorForCurrentYear,
        getMinYear: getMinYear,
        getMaxYear: getMaxYear,
        getChartInfo: getChartInfo,
        getChartFooter: getChartFooter,
        getAxisNames: getAxisNames,
        getAxisInfo: getAxisInfo,
        getEntityLayerObject: getEntityLayerObject,
        getDataObject: getDataObject,
        getColor: getColor,
        get: get,
        getName: getName,
        getDataForYear: getDataForYear,
        initialize: initialize,
        getSkeleton: getSkeleton
    };


};
    return bubbleChartDataHelper;
});
