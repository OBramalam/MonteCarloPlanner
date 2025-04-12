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

function drawWealthGraph(simData, moneyType="real") {
    
    let chart = d3.select("#wealth-chart"),
        margin = { top: 20, right: 20, bottom: 30, left: 50 },
        width = +chart.attr("width") - margin.left - margin.right,
        height = +chart.attr("height") - margin.top - margin.bottom;

    chart.selectAll("*").remove();

    let x = d3.scaleLinear()
        .rangeRound([0, width]);

    let y = d3.scaleLinear()
        .rangeRound([height, 0]);

    let focus = chart.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let chartData = [];
    let percentiles = simData[moneyType].percentiles;
    let maxY = 0;

    if (moneyType==="real") {
        for (let i = 0; i < simData.timesteps.length; i++) {

            let percentilesData = {}; 
            for (let key in percentiles) {
                percentilesData[key] = percentiles[key][i];
                if (percentiles[key][i] > maxY) {
                    maxY = percentiles[key][i];
                }
            }
            chartData.push({
                "Step": simData.timesteps[i] * simStep,
                "Mean": simData.real.mean[i],
                "Percentiles": percentilesData
            });
        }
    } else {
        for (let i = 0; i < simData.timesteps.length; i++) {
            let percentilesData = {}; 
            for (let key in percentiles) {
                percentilesData[key] = percentiles[key][i];
                if (percentiles[key][i] > maxY) {
                    maxY = percentiles[key][i];
                }
            }
            chartData.push({
                "Step": simData.timesteps[i] * simStep,
                "Mean": simData.nominal.mean[i],
                "Percentiles": percentilesData
            });
        }
    }


    x.domain([0, maxSteps]);
    y.domain([0, maxY * 1.05]);

    let xAxis = d3.axisBottom(x)
        .tickValues(d3.range(0, d3.max(chartData, d => d.Step) + 1, 24))
        .tickFormat(d => d / 12);

    let yAxis = d3.axisLeft(y)
        .tickFormat(d => "$" + d3.format(",.1f")(d/1e6) + "M");
        
    focus.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)

    focus.append("g")
        .attr("class", "axis axis--y")
        .call(yAxis);

    focus.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height - 6)
        .text("Years");

    let meanLine = d3.line()
        .x(d => x(d.Step))
        .y(d => y(d.Mean));

    focus.append("path")
        .datum(chartData)
        .attr("class", "line")
        .attr("d", meanLine)
        .style("stroke", "black")
        .style("fill", "none")
        .style("stroke-width", "2px");

    percentiles = Object.keys(percentiles).map(key => {
        return key;
    }
    ).sort((a, b) => a - b);


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
                .style("stroke", "steelblue")
                .style("fill", "none")
                .style("stroke-width", "2px")
                .style("opacity", 1);
        } else {
            percentileItem = d3.area()
                .x(d => x(d.Step))
                .y0(d => y(d.Percentiles[percentile]))
                .y1(d => y(d.Percentiles[nextPercentile]));
            focus.append("path")
                .datum(chartData)
                .attr("d", percentileItem)
                .style("fill", "steelblue")
                .style("opacity", 0.2);
        }
    

    }


}


drawWealthGraph(exampleSimulationData, "real");