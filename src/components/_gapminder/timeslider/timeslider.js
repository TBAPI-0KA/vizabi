define([
    'jquery',
    'd3',
    'base/utils',
    'base/component',
    'jqueryui_slider'
], function($, d3, utils, Component) {

    var container,
        timeslider,
        range,
        value,
        data,
        minValue,
        maxValue,
        playing,
        playInterval,
        hidePlayButton,
        step,
        stepDecimals;

    var class_playing = "vzb-playing",
        class_hide_play = "vzb-hide-play-button";


    var TimeTimeslider = Component.extend({
        init: function(parent, options) {
            this.template = "components/_gapminder/timeslider/timeslider";
            hidePlayButton = options.hidePlayButton || false;
            step = options.step || 1;
            //TODO: can be improved
            stepDecimals = (step.toString().split('.')[1] || []).length;

            // Same constructor as the superclass
            this._super(parent, options);
        },

        postRender: function() {
            var _this = this;
            playing = false;

            container = utils.d3ToJquery(this.element);

            range = container.find(".vzb-ts-slider");
            value = container.find('.vzb-ts-slider-value');
            play = container.find(".vzb-ts-btn-play"),
            pause = container.find(".vzb-ts-btn-pause");

            play.click(function() {
                _this.play();
            });

            pause.click(function() {
                _this.pause();
            });

            this.events.bind('timeslider:dragging', function() {
                _this.pause();
            });

            range.on('input', function(){
                _this.setYear(parseFloat(this.value));
            });

            this.update();
        },


        resize: function() {
            if (hidePlayButton == true) container.addClass(class_hide_play);
            this.update();
        },

        update: function() {
            var _this = this,
                year = this.model.getState("time");

            data = this.model.getData()[0],
                minValue = d3.min(data, function(d) {
                    return +d.time;
                }),
                maxValue = d3.max(data, function(d) {
                    return +d.time;
                });
            
            range.attr("min", minValue)
                 .attr("max", maxValue)
                 .attr("data-year", year)
                 .attr("step", step)
                 .val(year);        
                 

            value.html(year);
            this.setYearPosition();
        },

        getYear: function() {
            return this.model.getState("time");
        },

        setYear: function(year, silent) {
            //update state
            this.model.setState({
                time: year
            }, silent);

            this.update();
        },

       play: function() {
            //return if already playing
            if (playing) return;

            container.addClass(class_playing);

            var _this = this,
                year = this.model.getState("time");
                
            playInterval = setInterval(function() {
                if (year >= maxValue) {
                    _this.pause();
                    return;
                } else {
                    year = year + step;
                    _this.setYear(year.toFixed(stepDecimals));
                }
            }, 100);
        },

        pause: function() {
            container.removeClass(class_playing);
            clearInterval(playInterval);
        },

        setYearPosition: function () {
            var inputWidth = range.width() - 16,
                timeRange = maxValue - minValue,
                currentYear = this.model.getState("time") - minValue,
                newPosition = Math.round(inputWidth * currentYear / timeRange);
                
            value.css("left", newPosition + "px");
        }
    });

    return TimeTimeslider;
});