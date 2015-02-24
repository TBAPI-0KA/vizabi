define([
    'base/tool'
], function(Tool) {

    var lineChart = Tool.extend({
        /**
         * Initialized the tool
         * @param config tool configurations, such as placeholder div
         * @param options tool options, such as state, data, etc
         */
        init: function(config, options) {
            
            this.name = 'line-chart';
            this.template = "tools/_gapminder/line-chart/line-chart";

            this.state = options.state;

            this.components = [{
                component: '_gapminder/header',
                placeholder: '.vzb-tool-title'
            }, {
                component: '_gapminder/line-chart',
                placeholder: '.vzb-tool-viz',
                model: ["state.show", "data", "state.time"]
            }, {
                component: '_gapminder/timeslider',
                placeholder: '.vzb-tool-timeslider',
                model: ["state.time"]
            },{
                component: '_gapminder/buttonlist',
                placeholder: '.vzb-tool-buttonlist'
            }];

            this._super(config, options);
        },

        /**
         * Validating the tool model
         */
        validate: function() {

            var state = this.model.state;
            var data = this.model.data;

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
        }
        
    });

    return lineChart;
});
