define(['d3', 'chart-grid-scale'], function(d3, scale) {

	var yAxis = function() {
		
		var availableWidth = 880;
		var availableHeight = 440;
		var availableWidth;
		var availableHeight;


		var vizState;
		var g;
		var axis;

		var init = function(svg, state)  {
			g = svg;
			vizState = state;
		};

		var setAxisScale = function() {
			var yDomain = [];
			if (vizState.get("minYValue") !== undefined && vizState.get("maxYValue") !== undefined) {
				var updatedMinY = vizState.get("updatedMinYValue");
				var minY = vizState.get("minYValue");

				if (updatedMinY && updatedMinY < minY) {
					yDomain[0] = updatedMinY;
				} else {
					yDomain[0] = minY;
				}

				var maxY = vizState.get("maxYValue");
				var updatedMaxY = vizState.get("updatedMaxYValue");

				if (updatedMaxY && updatedMaxY > maxY) {
					yDomain[1] = updatedMaxY;
				} else {
					yDomain[1] = maxY;
				}
			} else {
				yDomain = [vizState.getDataHelper().getMinOfYIndicator(), vizState.getDataHelper().getMaxOfYIndicator()];
			}

			// if (zoomScale) {
			// 	yDomain[0] /= zoomScale;
			// 	yDomain[1] /= zoomScale;
			// }

			 scale.init("y", vizState.get("yAxisScale"), yDomain, [availableHeight, 0]);
		};

		var createYAxis = function() {
			ySvgAxis = d3.svg.axis()
				.scale(scale.get("y"))
				.orient("left")
				.tickSize(-availableWidth, 0);

			if (vizState.get("yAxisTickValues")) {
				ySvgAxis.tickValues(vizState.get("yAxisTickValues"));
			}

			axis = g
				.attr("stroke", "lightgrey")
				.classed("print", !vizState.get("isInteractive"))
				.call(ySvgAxis);
		};

		var render = function(w, h) {
			 if (w) availableWidth = w;
			 if (h) availableHeight = h;
			 
			 // if (axis) {
			 // 	axis.remove();
			 // }

			 setAxisScale();
			 createYAxis();
		};

		var getGroup = function() {
			return g;
		};


		var clone = function(selector) {
			var node = d3.select(selector).node();

			return d3.select(node.parentNode.insertBefore(node.cloneNode(true),
				node.nextSibling));
		};

		var setAxisTextG = function() {
			yAxisTextG = d3.select(g[0][0]);

			yAxisTextG.attr("class", "axis y text");
			var yAxisTextMaxWidth = d3.max(yAxisTextG.selectAll("g").selectAll("text"), function () {
				return this.node().getBBox().width;
			});
			
			yAxisTextG.selectAll("g").selectAll("text").each(function() {
				var textNode = d3.select(this);
				var currentVal = parseFloat(textNode.attr("x"));
				textNode.attr("x", currentVal + 8 + yAxisTextMaxWidth);
			});

			yAxisTextG.selectAll(".tick").selectAll("line").remove();

			var axisPath = yAxisTextG.select('.domain');

			axisPath.attr('transform', 'translate(' + (yAxisTextMaxWidth + 8) + ',0)');

			return yAxisTextG;
		};

		var setAxisGridG = function() {
			var yAxisGridG = clone(g[0][0]);

			yAxisGridG.attr("class", "axis y line");
			yAxisGridG.selectAll(".tick").selectAll("text").remove();
			yAxisGridG.selectAll('.domain').remove();

			return yAxisGridG;
		};

		var removeRestOfChartTicks = function () {
			g.selectAll(".tick").filter(function() {
				return d3.select(d3.select(this).node().parentNode).attr("class") === g.attr("class");
			})
			.remove();
		};

		var getScale = function () {
			return yScale;
		};

		return {
			render: render,
			init: init,
			getGroup: getGroup,
			setAxisTextG: setAxisTextG,
			setAxisGridG: setAxisGridG,
			removeRestOfChartTicks: removeRestOfChartTicks,
			getScale : getScale
		};
	};

	return yAxis();

});