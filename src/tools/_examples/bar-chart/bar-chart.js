//TODO: refactor hardcoded dates //former FIXME
//TODO: remove date formatting from here //former FIXME

define([
    'd3',
    'base/tool'
], function(d3, Tool) {

    var barChart = Tool.extend({

        /**
         * Initialized the tool
         * @param config tool configurations, such as placeholder div
         * @param options tool options, such as state, data, etc
         */
        init: function(config, options) {

            this.name = 'bar-chart';
            this.template = "tools/_examples/bar-chart/bar-chart";

            //instantiating components
            this.components = [{
                component: '_gapminder/header',
                placeholder: '.vzb-tool-title'
            }, {
                component: '_examples/bar-chart',
                placeholder: '.vzb-tool-viz', //div to render
                model: ["state.show", "data", "state.time"]
            }, {
                component: '_gapminder/timeslider',
                placeholder: '.vzb-tool-timeslider', //div to render
                model: ["state.time"]
            }
            ,{
                component: '_gapminder/buttonlist',
                placeholder: '.vzb-tool-buttonlist',
                model: ['state', 'data', 'language'],
                buttons: ['colors', 'more-options']
            }
            ];

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


    return barChart;
});
