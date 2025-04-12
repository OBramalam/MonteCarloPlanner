var exampleSimulationData = {
    "timesteps": [0, 10, 20, 30, 40, 50],
    "destitution": [0, 0, 0, 0, .2, .3],
    "real" : {
        "mean": [1000, 1100, 1200, 1300, 1400, 1500],
        "percentiles": {
            "5.0": [900, 950, 1000, 1050, 1100, 1150],
            "50.0": [1000, 1050, 1100, 1150, 1200, 1250],
            "95.0": [1100, 1150, 1200, 1250, 1300, 1350],
        },
    },
    "nominal" : {
        "mean": [1000, 1050, 1100, 1150, 1200, 1250],
        "percentiles": {
            "5.0": [900, 950, 1000, 1050, 1100, 1150],
            "95.0": [1100, 1150, 1200, 1250, 1300, 1350],
        },
    }
}

function drawDestitutionGraph (simData){

    let tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("background", "lightgray")
        .style("padding", "5px")
        .style("border-radius", "5px")
        .style("pointer-events", "none")
        .style("visibility", "hidden")
        .style("width", "180px")
        .style("opacity", 0.8)
        .style("font-size", "12px");

    let chart = d3.select("#extinction-chart"),
        margin = { top: 20, right: 20, bottom: 30, left: 50 },
        width = +chart.attr("width") - margin.left - margin.right,
        height = +chart.attr("height") - margin.top - margin.bottom;

    chart.selectAll("*").remove();

    let chartData = [];

    for (let i = 0; i < simData.timesteps.length; i++) {
        chartData.push({
            'Step': simData.timesteps[i] * simStep,
            'Value': simData.destitution[i],
        });
    }

    let x = d3.scaleLinear()
        .rangeRound([0, width]);

    let y = d3.scaleLinear()
        .rangeRound([height, 0]);

    let focus = chart.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let extinctionArea = d3.area()
        .x(function(d) { return x(d.Step); })
        .y0(height)
        .y1(function(d) { return y(d.Value); });

    x.domain([0, maxSteps]);
    y.domain([0, 1]);

    let xAxis = d3.axisBottom(x)
        .tickValues(d3.range(0, d3.max(chartData, d => d.Step) + 1, Math.ceil(maxSteps/simStep/30)*simStep))
        .tickFormat(d => d / 12);

    let yAxis = d3.axisLeft(y)
        .ticks(10)
        .tickFormat(d => d * 100 + "%");

    chart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(" + margin.left + "," + (height + margin.top) + ")")
        .call(xAxis);

    chart.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(yAxis);

    focus.append("path")
        .datum(chartData)
        .attr("class", "line")
        .attr("d", extinctionArea)
        .style("fill", "red")
        .style("stroke-width", "2px");

    focus.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height - 6)
        .text("Years");


    let verticalLine = d3.select("#extinction-chart")
        .append("line")
        .attr("class", "cursor-line")
        .attr("y1", 0 + margin.top)
        .attr("y2", height + margin.top)
        .style("stroke", "gray")
        .style("stroke-width", 1)
        .style("pointer-events", "none")
        .style("visibility", "hidden")
        .style("opacity", 0.8);

    let overlay = focus
        .append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mousemove", function (event) {
            let xPos = x.invert(d3.pointer(event, this)[0]);
            let xValue = (xPos + 1)/ simStep ;
            
            let closestIndex = Math.round(xValue);
            let closestData = chartData[closestIndex+1];
            if (closestData === undefined) {
                return;
            }

            verticalLine
                .attr("x1", x(xPos) + margin.left)
                .attr("x2", x(xPos) + margin.left)
                .style("visibility", "visible");

            tooltip.html(
                    "Year" + ": " + d3.format(",.0f")(closestData.Step / simStep) + "<br>" +
                    "Probability" + ": " + d3.format(",.2f")(closestData.Value*100) + "%<br>"
                )
                .style("visibility", "visible")
                .style("left", ((event.pageX - tooltip.node().offsetWidth - 5)) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function () {
            tooltip.style("visibility", "hidden");
            verticalLine.style("visibility", "hidden");
        });

}

drawDestitutionGraph(exampleSimulationData);