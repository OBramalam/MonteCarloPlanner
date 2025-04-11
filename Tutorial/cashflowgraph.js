async function drawCashflowPlot(points) {
    // Create a random set of points

    let chart = d3.select("#cashflow-chart"),
        margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = +chart.attr("width") - margin.left - margin.right,
        height = +chart.attr("height") - margin.top - margin.bottom;
    // clear the SVG before drawing
    chart.selectAll("*").remove();

    let x = d3.scaleLinear()
        .rangeRound([0, width]);

    let y = d3.scalePow().exponent(0.5)
        .rangeRound([height, 0]);
        
    let tooltip = d3.select("body") 
        .append("div")
        .style("position", "absolute")
        .style("background", "lightgray")
        .style("padding", "5px")
        .style("border-radius", "5px")
        .style("pointer-events", "none")
        .style("visibility", "hidden")
        .style("font-size", "12px");

    let dragXMax;
    let dragXMin;

    let drag = d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
        
    function dragstarted(d) {
        d3.select(this).raise().classed('active', true);
        console.log('drag started', d.subject.Step, d.subject.Value);

        let currentXpos = points.map(function(d) { return d.Step; });
        currentXpos = currentXpos.filter(function(x) {
            return x !== d.subject.Step;
        });
        let nextXpos = currentXpos.filter(function(x) {
            return x > d.subject.Step;
        });
        nextXpos = Math.min.apply(null, nextXpos);
        if (nextXpos === Infinity) {
            nextXpos = maxSteps;
        }
        let prevXpos = currentXpos.filter(function(x) {
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
        console.log('dragXMin', dragXMin, 'dragXMax', dragXMax);
    }

    function dragged(d) {
        let new_x = x.invert(d3.pointer(d, this)[0]);
        let new_y = y.invert(d3.pointer(d, this)[1]);

        new_x = Math.round(new_x / magnetStep) * magnetStep;
        new_x = Math.max(dragXMin, Math.min(dragXMax, new_x));
        d.subject.Step = new_x;

        new_y = Math.max(maxOutflow, Math.min(maxInflow, new_y));
        d.subject.Value = new_y;

        d3.select(this)
            .attr('cx', x(new_x))
            .attr('cy', y(new_y));
        if (points && points.length > 0) {
            focus.selectAll('#plotline').attr('d', line(points));
        }
        tooltip.html("$" + new_y.toFixed(2) + "<br/>" + new_x / 12 + " years")
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px")
            .style("visibility", "visible");
    }

    function dragended(d) {
        d = d.subject;
        d3.select(this).classed('active', false);
        tooltip.style("visibility", "hidden");
        runSimulationSignal.emit();
    }

    let yAxis = d3.axisLeft(y);

    let xAxis = d3.axisBottom(x)
        .tickValues(d3.range(0, d3.max(points, d => d.Step) + 1, 24))
        .tickFormat(d => d / 12);
        
    let line = d3.line()
        .x(function(d) { return x(d.Step); })
        .y(function(d) { return y(d.Value); });

    chart.append('rect')
        .attr('class', 'zoom')
        .attr('cursor', 'move')
        .attr('fill', 'none')
        .attr('pointer-events', 'none')
        .attr('width', width)
        .attr('height', height)
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    let focus = chart.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.domain(d3.extent(points, function(d) { return d.Step; }));
    y.domain([maxOutflow, maxInflow]); // Set Y-axis range between -10,000 and +10,000

    focus.append("path")
        .datum(points)
        .attr("id", "plotline")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("d", line);

    focus.append("path")
        .datum(points)
        .attr("class", "buffer-line")
        .attr("id", "plotline")
        .attr("fill", "none")
        .attr("stroke", "transparent") // Make the buffer path invisible
        .attr("stroke-width", 10) // Increase the stroke width for a larger mouseover region
        .attr("d", line)
        .on('click', function(d) {
            xpos = x.invert(d3.pointer(d, this)[0]);
            ypos = y.invert(d3.pointer(d, this)[1]);
            xpos = Math.round(xpos);

            varCurrentXpos = points.map(function(d) { return d.Step; });

            if (varCurrentXpos.indexOf(xpos) !== -1) {
                console.log('point already exists', xpos, ypos);
                return;
            }

            let prevXpos = varCurrentXpos.filter(function(x) {
                return x < xpos;
            });
            prevXpos = Math.max.apply(null, prevXpos);
            if (prevXpos === -Infinity) {
                prevXpos = 0;
            }
            let nextXpos = varCurrentXpos.filter(function(x) {
                return x > xpos;
            });
            nextXpos = Math.min.apply(null, nextXpos);
            if (nextXpos === Infinity) {
                nextXpos = maxSteps;
            }
            if (nextXpos - prevXpos < magnetStep) {
                console.log('point too close', xpos, ypos);
                return;
            }

            points.push({ Step: xpos, Value: ypos });
            points.sort(function(a, b) {
                return a.Step - b.Step;
            });

            drawCashflowPlot(points);
            runSimulationSignal.emit();
        });

    focus.selectAll('circle')
        .data(points)
        .enter()
        .append('circle')
        .attr('class', 'point')
        .attr('r', 5.0)
        .attr('cx', function(d) { return x(d.Step); })
        .attr('cy', function(d) { return y(d.Value); })
        .style('cursor', 'pointer')
        .style('fill', 'steelblue')
        .on('dblclick', function(d) {
            cx = d3.select(this).attr('cx');
            cy = d3.select(this).attr('cy');

            xpos = x.invert(cx);
            xpos = Math.round(xpos);
            ypos = y.invert(cy);
            let currentXpos = points.map(function(p) { return p.Step; });
            idx = currentXpos.indexOf(xpos);
            if (idx === 0 || idx === currentXpos.length - 1) {
                console.log('cannot remove first or last point', xpos, ypos);
                return;
            }
            console.log('removing point', xpos, ypos, idx);
            points = points.filter(function(x) {
                return x.Step !== xpos;
            });

            points.sort(function(a, b) {
                return a.Step - b.Step;
            });

            drawCashflowPlot(points);
            runSimulationSignal.emit();
        })
        .call(drag);

    focus.append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);
        
    focus.append('g')
        .attr('class', 'axis axis--y')
        .call(yAxis);

    // Add Y-axis grid lines 
    focus.append("g")
        .attr("class", "grid")
        .attr("strocke", "#ccc")
        .attr("stroke-width", 0.5)
        .attr("opacity", 0.5)
        .call(d3.axisLeft(y)
            .ticks(10)
            .tickSize(-width)
            .tickFormat("")
        );
    focus.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height - 6)
        .text("Years");
}

function getCashflowPoints() {
    return initCashflows.map(function(d) {
        return { Step: d.Step, Value: d.Value };
    });
}

function logAllCashflowPoints() {
    let all_points = initCashflows;
    all_points.sort(function(a, b) {
        return a.Step - b.Step;
    });
    console.log('all points', all_points);
}