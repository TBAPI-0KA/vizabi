//FIXME: refactor hardcoded dates
//FIXME: remove date formatting from here

define([
    'lodash',
    'd3',
    'base/tool'
], function(_, d3, Tool) {

    var bubbleChart = Tool.extend({
        /**
         * Initialized the tool
         * @param config tool configurations, such as placeholder div
         * @param options tool options, such as state, data, etc
         */
        init: function(config, options) {

            this.name = 'bubble-chart';
            this.template = "tools/_examples/bubble-chart/bubble-chart";

            //instantiating components
            this.components = [{
                component: '_gapminder/header',
                placeholder: '.vzb-tool-title'
            }, {
                component: '_examples/bubble-chart',
                placeholder: '.vzb-tool-viz', //div to render
                model: ["state.time", "state.entity", "state.marker", "data"]
            }, {
                component: '_gapminder/timeslider',
                placeholder: '.vzb-tool-timeslider', //div to render
                model: ["state.time"]
            }, {
                component: '_gapminder/buttonlist',
                placeholder: '.vzb-tool-buttonlist',
                model: ['state', 'data', 'language'],
                buttons: ['find', 'colors', 'size', 'more-options']
            }];

            this._super(config, options);

        },

        /**
         * Validating the tool model
         * @param model the current tool model to be validated
         */
        toolModelValidation: function(model) {

            var state = model.state;
            var data = model.data;

            //don't validate anything if data hasn't been loaded
            if(!data.getItems() || data.getItems().length < 1) {
                return;
            }

            var dateMin = data.getLimits('time').min,
                dateMax = data.getLimits('time').max;

            if (state.time.start < dateMin) {
                state.time.start = dateMin;
            }
            if (state.time.end > dateMax) {
                state.time.end = dateMax;
            }
        },

        /**
         * Returns the query (or queries) to be performed by this tool
         * @param model the tool model will be received
         */
         //TODO: remove specific references to "geo", "geo.category", ...
         //TODO: improve generalization of querying
        getQuery: function(model) {
            var state = model.state,
                time_start = d3.time.format("%Y")(state.time.start),
                time_end = d3.time.format("%Y")(state.time.end),
                indicators = state.getIndicators(),
                properties = state.getProperties();
            return [{
                "from": "data",
                "select": _.union(["geo", "geo.name", "time", "geo.region"], indicators, properties),
                "where": {
                    //TODO: remove this hack for getting geo and geo.category
                    "geo": state.entity.show[0].filter["geo"],
                    "geo.category": state.entity.show[0].filter["geo.category"],
                    "time": [time_start + "-" + time_end]
                }
            }, {
                "from": "data",
                "select": ["geo", "geo.name", "geo.region", "geo.category"],
                "where": {
                    "geo": ["*"],
                    "geo.category": ["*"]
                }
            }];
        }
    });

    return bubbleChart;
});
