var currentSimulationData = {
    "timesteps": [],
    "destitution": [],
    "real" : {
        "mean": [],
        "percentiles": {},
    },
    "nominal" : {
        "mean": [],
        "percentiles": {},
    }
}

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

function drawWealthGraph(simData, moneyType="real", yScale="linear") {

    let chart = d3.select("#wealth-chart"),
        margin = { top: 20, right: 20, bottom: 30, left: 50 },
        width = +chart.attr("width") - margin.left - margin.right,
        height = +chart.attr("height") - margin.top - margin.bottom;

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



    chart.selectAll("*").remove();

    let x = d3.scaleLinear()
        .rangeRound([0, width]);

    let y = d3.scaleLinear()
        .rangeRound([height, 0]);

    let smallvalue = 0;

    if (yScale === "log") {
        y = d3.scaleLog()
            .rangeRound([height, 0.01]);
        smallvalue = 1;
    }

    let focus = chart.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let chartData = [];
    let percentiles = simData[moneyType].percentiles;
    let maxY = 0;

    if (moneyType==="real") {
        for (let i = 0; i < simData.timesteps.length; i++) {

            let percentilesData = {}; 
            for (let key in percentiles) {
                percentilesData[key] = percentiles[key][i]+ smallvalue;
                if (percentiles[key][i] > maxY) {
                    maxY = percentiles[key][i] + smallvalue;
                }
            }
            chartData.push({
                "Step": simData.timesteps[i] * simStep,
                "Mean": simData.real.mean[i] + smallvalue,
                "Percentiles": percentilesData
            });
        }
    } else {
        for (let i = 0; i < simData.timesteps.length; i++) {
            let percentilesData = {}; 
            for (let key in percentiles) {
                percentilesData[key] = percentiles[key][i]+ smallvalue;
                if (percentiles[key][i] > maxY) {
                    maxY = percentiles[key][i] + smallvalue;
                }
            }
            chartData.push({
                "Step": simData.timesteps[i] * simStep,
                "Mean": simData.nominal.mean[i] + smallvalue,
                "Percentiles": percentilesData
            });
        }
    }

    console.log(chartData);
    x.domain([0, maxSteps]);
    y.domain([smallvalue, maxY * 1.05]);

    let xAxis = d3.axisBottom(x)
        .tickValues(d3.range(0, d3.max(chartData, d => d.Step) + 1, Math.ceil(maxSteps/simStep/30)*simStep))
        .tickFormat(d => d / 12);

    if (yScale === "log") {
        yAxis = d3.axisLeft(y)
            .tickValues(y.ticks().filter(tick => Number.isInteger(Math.log10(tick)))) // Only powers of 10
            .tickFormat(d => {
                const exponent = Math.round(Math.log10(d));
                if (exponent === 0) return "$1";
                
                // Map exponents to proper superscript characters
                const superscripts = {
                    0: "⁰",
                    1: "¹",
                    2: "²",
                    3: "³",
                    4: "⁴",
                    5: "⁵",
                    6: "⁶",
                    7: "⁷",
                    8: "⁸",
                    9: "⁹"
                };
                
                const exponentStr = String(exponent)
                    .split("")
                    .map(char => superscripts[char])
                    .join(""); // Convert each digit to superscript
                
                return `$1x10${exponentStr}`; // Format as $1x10^exponent
            });
    } else {
        yAxis = d3.axisLeft(y)
            .tickFormat(d => "$" + d3.format(",.1f")(d / 1e6) + "M");
    }
    
    focus.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)

    focus.append("g")
        .attr("class", "axis axis--y")
        .call(yAxis);

    let chartElements = [];

    percentiles = Object.keys(percentiles).map(key => {
        return key;
    }
    ).sort((a, b) => a-b);

    // white to steelblue gradient
    let colorScale = d3.scaleLinear()
        .domain([0, percentiles.length/2 + 2])
        .range(["white", "steelblue"]);
    let color = d3.scaleLinear()
        .domain([0, percentiles.length/2 + 2])
        .range([0, 1])
        .interpolate(d3.interpolateHcl);

    for (let i = 0; i < percentiles.length / 2; i++) {
        let percentile = percentiles[i].toString();
        let nextPercentile = percentiles[percentiles.length - 1 - i].toString();
        
        let percentileItem;
        if (percentile === nextPercentile) {
            percentileItem = d3.line()
                .x(d => x(d.Step))
                .y(d => y(d.Percentiles[percentile]));

            focus.append("path")
                .datum(chartData)
                .attr("d", percentileItem)
                .attr("id", `percentile-${percentile}`)
                .style("stroke", "steelblue")
                .style("fill", "none")
                .style("stroke-width", "2px")
                .style("opacity", 1);

            chartElements.push({
                name: `${d3.format(",.0f")(percentile)}th Percentile`,
                color: "steelblue",
                id: `percentile-${percentile}`,
                opactity: 1
            });
        } else {
            percentileItem = d3.area()
                .x(d => x(d.Step))
                .y0(d => y(d.Percentiles[percentile]))
                .y1(d => y(d.Percentiles[nextPercentile]));

            focus.append("path")
                .datum(chartData)
                .attr("d", percentileItem)
                .attr("id", `percentile-${percentile}-${nextPercentile}`)
                .style("fill", colorScale(i+1))
                .style("opacity", 1);

            chartElements.push({
                name: `${d3.format(",.0f")(percentile)}%-${d3.format(",.0f")(nextPercentile)}% CI`,
                color: colorScale(i +1),
                id: `percentile-${percentile}-${nextPercentile}`,
                opactity: 1
            })
        }

    }

    let meanLine = d3.line()
        .x(d => x(d.Step))
        .y(d => y(d.Mean));

    focus.append("path")
        .datum(chartData)
        .attr("id", "mean-line")
        .attr("class", "line")
        .attr("d", meanLine)
        .style("stroke", "black")
        .style("fill", "none")
        .style("stroke-width", "2px");

    chartElements.push({
        name: "Mean",
        color: "black",
        id: "mean-line",
        opactity: 1
    });

    focus.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height - 6)
        .text("Years"); 

    // Add a legend container
    const legendContainer = d3.select("#wealth-chart")
        .append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${margin.left+20}, ${margin.top})`);

    // Create legend items
    chartElements.forEach((element, index) => {
        const legendItem = legendContainer.append("g")
            .attr("class", "legend-item")
            .attr("transform", `translate(0, ${index * 20})`);

        // Add color box
        legendItem.append("rect")
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", element.color);

        // Add text
        legendItem.append("text")
            .attr("x", 20)
            .attr("y", 12)
            .text(element.name)
            .style("font-size", "12px")
            .style("fill", "#333");
    });

    let verticalLine = d3.select("#wealth-chart")
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
            let percentileText = "";

            for (let key in closestData.Percentiles) {
                percentileText += d3.format(",.0f")(key) + "th Percentile: $" + d3.format(",.0f")(closestData.Percentiles[key]) + "<br>";
            }

            verticalLine
                .attr("x1", x(xPos) + margin.left)
                .attr("x2", x(xPos) + margin.left)
                .style("visibility", "visible");

            tooltip.html(
                    "Year" + ": " + d3.format(",.0f")(closestData.Step / simStep) + "<br>" +
                    "Mean" + ": $" + d3.format(",.0f")(closestData.Mean) + "<br>"
                    + percentileText
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


drawWealthGraph(exampleSimulationData, "real", "linear")