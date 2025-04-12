
// var initWeights = [1, maxSteps].map(function(i) {
//     return {
//         'Step': i,
//         'Bonds': 0.45,
//         'Stocks': 0.5,
//     };
// });

async function drawWeightsPlot(weights) {

    let chart = d3.select("#weights-chart"),
        margin = { top: 20, right: 20, bottom: 30, left: 50 },
        width = +chart.attr("width") - margin.left - margin.right,
        height = +chart.attr("height") - margin.top - margin.bottom;

    chart.selectAll("*").remove();

    let dragXMax;
    let dragXMin;
    let dragYMax;
    let dragYMin;
    let dragPoints = [];

    let drag = d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);

    let tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("background", "lightgray")
        .style("padding", "5px")
        .style("border-radius", "5px")
        .style("pointer-events", "none")
        .style("visibility", "hidden")
        .style("font-size", "12px");

    function dragstarted(d) {
        d3.select(this).raise().classed('active', true);
        console.log('drag started', d.subject);

        let currentXpos = weights.map(function (d) { return d.Step; });

        currentXpos = currentXpos.filter(function (x) {
            return x !== d.subject.Step;
        });
        let nextXpos = currentXpos.filter(function (x) {
            return x > d.subject.Step;
        });
        nextXpos = Math.min.apply(null, nextXpos);
        if (nextXpos === Infinity) {
            nextXpos = maxSteps;
        }
        let prevXpos = currentXpos.filter(function (x) {
            return x < d.subject.Step;
        });
        prevXpos = Math.max.apply(null, prevXpos);
        if (prevXpos === -Infinity) {
            prevXpos = 0;
        }

        if (d.subject.Step === 0) {
            dragXMax = 0;
            dragXMin = 0;
        }
        else if (d.subject.Step === maxSteps) {
            dragXMax = maxSteps;
            dragXMin = maxSteps;
        }
        else {
            dragXMax = nextXpos - 1;
            dragXMin = prevXpos + 1;
        }

        if (this.id === 'stockpoint') {
            dragYMax = 1;
            dragYMin = d.subject.Bonds;
        }
        else if (this.id === 'bondpoint') {
            dragYMax = d.subject.Stocks + d.subject.Bonds;
            dragYMin = 0;
        }
        else {
            dragYMax = 1;
            dragYMin = 0;
        }
        dragPoints = [];
        let allPoints = focus.selectAll("circle")._groups[0]
        for (let i = 0; i < allPoints.length; i++) {
            let point = allPoints[i];
            if (point.__data__.Step === d.subject.Step) {
                dragPoints.push(point);
            }
        }
    }

    function dragged(d) {
        let new_x = x.invert(d3.pointer(d, this)[0]);
        let new_y = y.invert(d3.pointer(d, this)[1]);

        new_x = Math.round(new_x / magnetStep) * magnetStep;
        new_x = Math.max(dragXMin, Math.min(dragXMax, new_x));
        d.subject.Step = new_x;

        new_y = Math.max(dragYMin, Math.min(dragYMax, new_y));
        if (this.id === 'stockpoint') {
            d.subject.Stocks = new_y - d.subject.Bonds;
        }
        else if (this.id === 'bondpoint') {
            d.subject.Stocks = d.subject.Stocks - (new_y - d.subject.Bonds);
            d.subject.Bonds = new_y;
        }
        else {
            throw new Error("Invalid point id: " + this.id);
        }
        focus.selectAll("#stockarea")
            .attr("d", stockarea(weights));
        focus.selectAll("#bondarea")
            .attr("d", bondarea(weights));
        focus.selectAll("#stockline")
            .attr("d", stockline(weights));
        focus.selectAll("#bondline")
            .attr("d", bondline(weights));
        focus.selectAll("#stockpoint")
            .attr("d", stockline(weights));

        for (let i = 0; i < dragPoints.length; i++) {
            let point = dragPoints[i];
            switch (point.id) {
                case 'stockpoint':
                    d3.select(point).attr('cx', x(new_x)).attr('cy', y(d.subject.Stocks + d.subject.Bonds));
                    break;
                case 'bondpoint':
                    d3.select(point).attr('cx', x(new_x)).attr('cy', y(d.subject.Bonds));
                    break;
                default:
                    throw new Error("Invalid point id: " + point.id);
            }
        }

        tooltip.html("Bonds: " + (d.subject.Bonds*100).toFixed(2)+"%<br>Stocks: "+(d.subject.Stocks*100).toFixed(2)+"%<br>Cash: "+((1-d.subject.Stocks-d.subject.Bonds)*100).toFixed(2)+"%<br>"+(new_x / 12).toFixed(2)+" years")
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px")
            .style("visibility", "visible");
    }

    function dragended(d) {
        d3.select(this).classed('active', false);
        dragPoints = [];
        runSimulationSignal.emit();
        tooltip.style("visibility", "hidden");
        
    }

    function addBreakpoint(d) {
        xpos = d3.pointer(d, this)[0];
        ypos = d3.pointer(d, this)[1];
        
        xpos = Math.round(x.invert(xpos));
        let currentXpos = weights.map(function (d) { return d.Step; });
        let prevXpos = currentXpos.filter(function (x) {
            return x < xpos;
        }
        );

        if (currentXpos.indexOf(xpos) !== -1) {
            console.log('point already exists', xpos, ypos);
            return;
        }

        prevXpos = Math.max.apply(null, prevXpos);
        if (prevXpos === -Infinity) {
            prevXpos = 0;
        }
        let nextXpos = currentXpos.filter(function (x) {
            return x > xpos;
        });
        nextXpos = Math.min.apply(null, nextXpos);
        if (nextXpos === Infinity) {
            nextXpos = maxSteps;
        }
        if (xpos === prevXpos + magnetStep || xpos === nextXpos - magnetStep) {
            console.log('point too close', xpos, ypos);
            return;
        }

        prevStep = weights.filter(function (d) {
            return d.Step === prevXpos;
        }
        )[0];
        nextStep = weights.filter(function (d) {
            return d.Step === nextXpos;
        }
        )[0];
        if (prevStep === undefined) {
            return;
        }
        if (nextStep === undefined) {
            return;
        }

        function interpolateWeights(prevStep, nextStep, xpos) {
            let prevStepBonds = prevStep.Bonds;
            let prevStepStocks = prevStep.Stocks;
            let nextStepBonds = nextStep.Bonds;
            let nextStepStocks = nextStep.Stocks;

            let newBonds = prevStepBonds + (nextStepBonds - prevStepBonds) * (xpos - prevXpos) / (nextXpos - prevXpos);
            let newStocks = prevStepStocks + (nextStepStocks - prevStepStocks) * (xpos - prevXpos) / (nextXpos - prevXpos);

            return {
                "Step": xpos,
                'Bonds': newBonds,
                'Stocks': newStocks,
            };
        }

        let newWeight = interpolateWeights(prevStep, nextStep, xpos);

        weights.push(newWeight);
        weights.sort(function (a, b) {
            return a.Step - b.Step;
        });

        drawWeightsPlot(weights);
        runSimulationSignal.emit();

    }

    function removeBreakpoint(d) {
        let currentXpos = weights.map(function (d) { return d.Step; });
        let idx = currentXpos.indexOf(d.target.__data__.Step);
        if (idx === 0) {
            return; // do not remove the first point
        }
        if (idx === currentXpos.length - 1) {
            return; // do not remove the last point
        }   
        if (idx === -1) {
            console.log('point not found', d.target.__data__.Step);
            return;
        }
        weights.splice(idx, 1);
        drawWeightsPlot(weights);
        runSimulationSignal.emit();
    }


    let x = d3.scaleLinear()
        .rangeRound([0, width]);

    let y = d3.scaleLinear()
        .rangeRound([height, 0]);

    let focus = chart.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.domain([0, maxSteps]);
    y.domain([0, 1]);

    let xAxis = d3.axisBottom(x)
        .tickValues(d3.range(0, d3.max(weights, d => d.Step) + 1, Math.ceil(maxSteps/simStep/30)*simStep))
        .tickFormat(d => d / 12);
        
    focus.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)

    focus.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y).ticks(10).tickFormat(function (d) { return d * 100 + "%"; }));

    let stockarea = d3.area()
        .x(function (d) { return x(d.Step); })
        .y0(function (d) { return y(d.Bonds); })
        .y1(function (d) { return y(d.Stocks + d.Bonds); });

    let bondarea = d3.area()
        .x(function (d) { return x(d.Step); })
        .y0(function (d) { return y(0); })
        .y1(function (d) { return y(d.Bonds); });

    let stockline = d3.line()
        .x(function (d) { return x(d.Step); })
        .y(function (d) { return y(d.Stocks + d.Bonds); });

    let bondline = d3.line()
        .x(function (d) { return x(d.Step); })
        .y(function (d) { return y(d.Bonds); });

    focus.append("path")
        .datum(weights)
        .attr("class", "area")
        .attr("id", "stockarea")
        .attr("d", stockarea)
        .style("fill", "steelblue")
        .style("opacity", 0.6);

    focus.append("path")
        .datum(weights)
        .attr("class", "area")
        .attr("id", "bondarea")
        .attr("d", bondarea)
        .style("fill", "black")
        .style("opacity", .6);


    // Lines for interaction
    focus.append("path")
        .datum(weights)
        .attr("class", "line")
        .attr("id", "stockline")
        .attr("d", stockline)
        .style("stroke", "transparent")
        .style("stroke-width", 10)
        .style("fill", "none")
        .on('click', addBreakpoint);

    focus.append("path")
        .datum(weights)
        .attr("class", "line")
        .attr("id", "bondline")
        .attr("d", bondline)
        .style("stroke", "transparent")
        .style("stroke-width", 10)
        .style("fill", "none")
        .on('click', addBreakpoint);

    let dataEnter = focus.selectAll("circle")
        .data(weights)
        .enter();

    dataEnter.append("circle")
        .attr("class", "point")
        .attr("r", 5)
        .attr("fill", "steelblue")
        .attr("id", "stockpoint")
        .attr("cx", function (d) { return x(d.Step); })
        .attr("cy", function (d) { return y(d.Stocks + d.Bonds); })
        .attr("d", stockline)
        .on('dblclick', removeBreakpoint)
        .on("mouseover", function() {
            d3.select(this).attr("r", 7); // Highlight point on hover
        })
        .on("mouseout", function() {
            d3.select(this).attr("r", 5); // Reset point size
        })
        .style('cursor', 'pointer')
        .call(drag);

    dataEnter.append("circle")
        .attr("class", "point")
        .attr("r", 5)
        .attr("fill", "black")
        .attr("id", "bondpoint")
        .attr("cx", function (d) { return x(d.Step); })
        .attr("cy", function (d) { return y(d.Bonds); })
        .attr("d", bondline)
        .on('dblclick', removeBreakpoint)
        .on("mouseover", function() {
            d3.select(this).attr("r", 7); // Highlight point on hover
        })
        .on("mouseout", function() {
            d3.select(this).attr("r", 5); // Reset point size
        })
        .style('cursor', 'pointer')
        .call(drag);

    focus.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height - 6)
        .text("Years");
}

function logAllWeightsPoints() {
    let allPoints = initWeights
    allPoints.sort(function (a, b) {
        return a.Step - b.Step;
    });
    console.log(allPoints);
}