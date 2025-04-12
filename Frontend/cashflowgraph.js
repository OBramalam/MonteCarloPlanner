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

    let lineDrag = d3.drag()
        .filter(function(d) {
            // Shift + drag
            return d.shiftKey;
        })
        .on('start', lineDragStart)
        .on('drag', lineDragged)
        .on('end', lineDragEnd);

    let lineDragLeftStepIndex;
    let lineDragRightStepIndex;
    let lineDragLeftInitYpos;
    let lineDragRightInitYpos;
    let lineDrayInitYpos;

    function lineDragStart(d) {
        d3.select(this).raise().classed('active', true);
        xpos = x.invert(d3.pointer(d, this)[0]);
        lineDrayInitYpos = y.invert(d3.pointer(d, this)[1]);
    
        prevStep = points.filter(function(x) {
            return x.Step < xpos;
        }
        );
        prevStep = Math.max.apply(null, prevStep.map(function(x) {
            return x.Step;
        }));
        nextStep = points.filter(function(x) {
            return x.Step > xpos;
        }
        );
        nextStep = Math.min.apply(null, nextStep.map(function(x) {
            return x.Step;
        }));
        if (prevStep === -Infinity) {
            prevStep = 0;
        }
        if (nextStep === Infinity) {
            nextStep = maxSteps;
        }

        lineDragLeftStepIndex = points.findIndex(function(x) {
            return x.Step === prevStep;
        });
        lineDragRightStepIndex = points.findIndex(function(x) {
            return x.Step === nextStep;
        });
        lineDragLeftInitYpos = points[lineDragLeftStepIndex].Value;
        lineDragRightInitYpos = points[lineDragRightStepIndex].Value;
        tooltip.style("visibility", "visible");
    }

    function lineDragged(d) {
        let new_y = y.invert(d3.pointer(d, this)[1]);
        new_y = Math.max(maxOutflow, Math.min(maxInflow, new_y));
        

        let leftPoint = points[lineDragLeftStepIndex];
        let rightPoint = points[lineDragRightStepIndex];

        console.log('line drag', new_y-lineDrayInitYpos);

        points[lineDragLeftStepIndex].Value = Math.max(maxOutflow, Math.min(maxInflow, lineDragLeftInitYpos + (new_y - lineDrayInitYpos)));
        points[lineDragRightStepIndex].Value = Math.max(maxOutflow, Math.min(maxInflow, lineDragRightInitYpos + (new_y - lineDrayInitYpos)));

        if (points && points.length > 0) {
            focus.selectAll('#plotline').attr('d', line(points));
        }

        d3.select("#point-" + leftPoint.Step)
            .attr('cx', x(leftPoint.Step))
            .attr('cy', y(leftPoint.Value));
        d3.select("#point-" + rightPoint.Step)
            .attr('cx', x(rightPoint.Step))
            .attr('cy', y(rightPoint.Value));

        tooltip.html(
            "$" + points[lineDragLeftStepIndex].Value.toFixed(2) + " to $" + points[lineDragRightStepIndex].Value.toFixed(2) 
            + "<br/>" + leftPoint.Step / 12 + " to " + rightPoint.Step / 12 + " years")
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px")
            .style("visibility", "visible");
            
    }

    function lineDragEnd(d) {
        d3.select(this).classed('active', false);
        tooltip.style("visibility", "hidden");
        runSimulationSignal.emit();
        drawCashflowPlot(points); // redraw to reset the svg order (idk why this is needed)
    }



    let yAxis = d3.axisLeft(y);

    let xAxis = d3.axisBottom(x)
        .tickValues(d3.range(0, d3.max(points, d => d.Step) + 1, Math.ceil(maxSteps/simStep/30)*simStep))
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
    y.domain([maxOutflow, maxInflow]);

    focus.append("rect")
        .attr("class", "plot-background")
        .attr("x", 0)
        .attr("y", y(0))
        .attr("width", width)   
        .attr("height", y(maxOutflow) - y(0)) 
        .attr("fill", "red")
        .attr("opacity", 0.1);

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
        .call(lineDrag)
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
        .attr("id", function(d) { return "point-" + d.Step; })
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
        .on("mouseover", function() {
            d3.select(this).attr("r", 7); // Highlight point on hover
        })
        .on("mouseout", function() {
            d3.select(this).attr("r", 5); // Reset point size
        })
        .on("contextmenu", function (event, d) {
            // Prevent the default context menu from appearing
            event.preventDefault();
    
            // Create a dialog box for setting the value
            const dialog = d3.select("body")
                .append("div")
                .attr("class", "dialog")
                .style("position", "absolute")
                .style("left", `${event.pageX}px`)
                .style("top", `${event.pageY}px`)
                .style("background", "white")
                .style("border", "1px solid #ccc")
                .style("padding", "10px")
                .style("border-radius", "5px")
                .style("box-shadow", "0px 2px 5px rgba(0, 0, 0, 0.2)");
    
            dialog.append("label")
                .text("Set Value: ")
                .style("margin-right", "5px");
    
            const input = dialog.append("input")
                .attr("type", "number")
                .attr("value", d.Value)
                .style("width", "80px");
    
            dialog.append("button")
                .text("Set")
                .style("margin-left", "5px")
                .on("click", function () {
                    const newValue = parseFloat(input.node().value);
                    if (!isNaN(newValue)) {
                        d.Value = Math.max(maxOutflow, Math.min(maxInflow, newValue)); // Clamp value within bounds
    
                        // Update the point and line
                        d3.select(`#point-${d.Step}`)
                            .attr("cy", y(d.Value));
                        focus.selectAll("#plotline").attr("d", line(points));
                    }
    
                    // Remove the dialog
                    dialog.remove();
                    runSimulationSignal.emit();
                });
    
            dialog.append("button")
                .text("Cancel")
                .style("margin-left", "5px")
                .on("click", function () {
                    dialog.remove(); // Remove the dialog without making changes
                });
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