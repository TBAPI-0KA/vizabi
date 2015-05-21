define([
    'd3',
    'lodash',
    'models/hook'
], function(d3, _, Hook) {



    var Axis = Hook.extend(   {

        /**
         * Initializes the color hook
         * @param {Object} values The initial values of this model
         * @param parent A reference to the parent model
         * @param {Object} bind Initial events to bind
         */
        init: function(values, parent, bind) {

            this._type = "axis";
            values = _.extend({
                use: "value",
                unit: "",
                value: undefined
            }, values);
            this._super(values, parent, bind);
        },

        /**
         * Validates a color hook
         */
        validate: function() {

            var possibleScales = ["log", "linear", "time", "pow"];
            if (!this.scaleType || (this.use === "indicator" && possibleScales.indexOf(this.scaleType) === -1)) {
                this.scaleType = 'linear'; 
            }

            if (this.use !== "indicator" && this.scaleType !== "ordinal") {
                this.scaleType = "ordinal";
            }

            //TODO a hack that kills the scale, it will be rebuild upon getScale request in model.js
            if(this.value_1 != this.value || this.scaleType_1 != this.scaleType) this.scale = null;
            this.value_1 = this.value;
            this.scaleType_1 = this.scaleType;

            //TODO: add min and max to validation
        },


        /**
         * Gets the domain for this hook
         * @returns {Array} domain
         */
        buildScale: function() {
            var domain,
                scale = this.scaleType || "linear";

            if(this.value=="time"){
                var limits = this.getLimits(this.value);
                this.scale = d3.time.scale().domain([limits.min, limits.max]);
                return;
            }
            
            switch (this.use) {
                case "indicator":
                    var limits = this.getLimits(this.value),
                        margin = (limits.max - limits.min) / 20;
                    domain = [(limits.min - margin), (limits.max + margin)];
                    if(scale == "log") {
                        domain = [(limits.min-limits.min/4), (limits.max + limits.max/4)];
                    }

                    break;
                case "property":
                    domain = this.getUnique(this.value);
                    break;
                case "value":
                default:
                    domain = [this.value];
                    break;
            }

            this.scale = d3.scale[scale]().domain(domain);
        }

    });

    return Axis;
});