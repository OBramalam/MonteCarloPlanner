function updateTimesteps() {
    // update the timesteps based on timesteps-input value
    maxSteps = getTimesteps();

    initCashflows = changeDataseriesTimesteps(initCashflows, maxSteps);
    initWeights = changeDataseriesTimesteps(initWeights, maxSteps);
    
    drawCashflowPlot(initCashflows);
    drawWeightsPlot(initWeights);
    runSimulationSignal.emit();
};

function getTimesteps() {
    // get the number of timesteps from the input field
    let newEndStep = parseInt(document.getElementById('timesteps-input').value, 10);
    if (isNaN(newEndStep) || newEndStep < 1) {
        alert("Please enter a valid number of timesteps.");
        return;
    }
    return newEndStep * magnetStep;
}

function getIntialWealth() {
    // get the initial wealth from the input field
    let newInitialWealth = parseFloat(document.getElementById('initial-wealth-input').value, 10);
    if (isNaN(newInitialWealth) || newInitialWealth < 0) {
        alert("Please enter a valid initial wealth.");
        return;
    }
    return newInitialWealth;
}

function updateOutputMoneyType() {
    // update the output money type based on the selected option from the output-money-type-input selector
    let selectedOption = document.getElementById('output-money-type-input').value;
    moneyType = selectedOption.toLowerCase() === "real" ? "real" : "nominal";
    drawWealthGraph(currentSimulationData, moneyType);
    drawDestitutionGraph(currentSimulationData);
}

function getOutputYScale() {
    // get the output y scale from the input field
    let newOutputYScale = document.getElementById('wealth-yscale-input').value;
    if (newOutputYScale !== "linear" && newOutputYScale !== "log") {
        alert("Please enter a valid output y scale.");
        return;
    }
    return newOutputYScale;
}

function updateOutputYScale() {
    // update the output y scale based on the selected option from the output-y-scale-input selector
    drawWealthGraph(currentSimulationData, moneyType, getOutputYScale());
}

function updateMaxSavings() {
    // update the max savings based on the input field
    let newMaxSavings = parseFloat(document.getElementById('max-savings-input').value, 10);
    if (isNaN(newMaxSavings) || newMaxSavings < 0) {
        alert("Please enter a valid max savings.");
        return;
    }
    maxInflow = newMaxSavings;
    initCashflows = initCashflows.map(function (i) {
        i.Value = Math.min(i.Value, maxInflow);
        return i;
    });

    drawCashflowPlot(initCashflows);
    runSimulationSignal.emit();
}

function updateMaxSpend() {
    // update the max spend based on the input field
    let newMaxSpend = -1*parseFloat(document.getElementById('max-spending-input').value, 10);
    if (isNaN(newMaxSpend) || newMaxSpend > 0) {
        alert("Please enter a valid max spend.");
        return;
    }
    maxOutflow = newMaxSpend;
    initCashflows = initCashflows.map(function (i) {
        i.Value = Math.max(i.Value, maxOutflow);
        return i;
    });
    drawCashflowPlot(initCashflows);
    runSimulationSignal.emit();
}


function getAssetCosts() {
    // get the asset costs from the input fields
    let newAssetCosts = {
        'Bonds': parseFloat(document.getElementById('bond-costs-input').value, 10) / 100,
        'Stocks': parseFloat(document.getElementById('stock-costs-input').value, 10) / 100,
        'Cash': parseFloat(document.getElementById('cash-costs-input').value, 10) / 100,
    };
    if (isNaN(newAssetCosts.Bonds) || newAssetCosts.Bonds > 1) {
        alert("Please enter a valid bond cost.");
        return;
    }
    if (isNaN(newAssetCosts.Stocks) || newAssetCosts.Stocks > 1) {
        alert("Please enter a valid stock cost.");
        return;
    }
    if (isNaN(newAssetCosts.Cash) || newAssetCosts.Cash > 1) {
        alert("Please enter a valid cash cost.");
        return;
    }
    return newAssetCosts;
}

function getAssetReturns() {
    // get the asset returns from the input fields

    let bonds = parseFloat(document.getElementById('bond-returns-input').value, 10) / 100,
        Stocks = parseFloat(document.getElementById('stock-returns-input').value, 10) / 100,
        Cash = parseFloat(document.getElementById('cash-returns-input').value, 10) / 100
    let newAssetReturns = {};
    if (!isNaN(bonds)) {
        newAssetReturns.Bonds = bonds;
    }
    if (!isNaN(Stocks)) {
        newAssetReturns.Stocks = Stocks;
    }
    if (!isNaN(Cash)) {
        newAssetReturns.Cash = Cash;
    }
    return newAssetReturns;
}

function getInflationRate() {
    // get the inflation rate from the input field
    let newInflationRate = parseFloat(document.getElementById('inflation-input').value, 10) / 100;
    if (isNaN(newInflationRate) || newInflationRate < 0) {
        alert("Please enter a valid inflation rate.");
        return;
    }
    return newInflationRate;
}

function getIterations() {
    let iterations = parseInt(document.getElementById('iterations-input').value, 10);
    if (isNaN(iterations) || iterations < 1) {
        alert("Please enter a valid number of iterations.");
        return;
    }
    return iterations;
}


function getRequestJson() {
    let requestJson = {
        "number_of_simulations": getIterations(),
        "end_step": maxSteps / simStep,
        "initial_wealth": getIntialWealth(),
        "inflation": getInflationRate(),
        "asset_costs": getAssetCosts(),
        "asset_returns": getAssetReturns(),
        "savings_rates": initCashflows.map(function (i) {
            return {
                'Step': i.Step / simStep,
                'Value': i.Value
            };
        }
        ),
        "weights": initWeights.map(function (i) {
            return {
                'Step': i.Step / simStep,
                'Bonds': i.Bonds,
                'Stocks': i.Stocks
            };
        }
        ),
        "step_size": "annual",
        "simulation_type": "cholesky",
        "weights_interpolation": "linear",
        "savings_rates_interpolation": "linear",
        "percentiles": percentiles,
    }
    return requestJson;
}


function logRequest() {
    console.log(JSON.stringify(getRequestJson(), null, 2));
}


class BackendHandler {
    constructor() {
        this.nextRequest = null;
        this.processing = false;
    }

    async process() {
        if (this.processing) return; // Already processing
        this.processing = true;

        while (this.nextRequest) {
            const { url, options, callback } = this.nextRequest;
            this.nextRequest = null; // Clear the next request
            try {
                const response = await fetch(url, options);
                const data = await response.json();
                callback(null, data);
            } catch (error) {
                callback(error, null);
            }
        }

        this.processing = false;
    }

    addRequest(url, options = {}, callback = () => { }) {
        this.nextRequest = { url, options, callback };
        this.process();
    }
}

function updateSimulationMetadata(simData) {
    document.getElementById('simulation-time-output').innerText = d3.format(",.0f")(simData.simulation_time * 1000) + "ms";
    document.getElementById('simulation-time-per-step-output').innerText = d3.format(",.0f")(simData.simulation_time_per_timestep* 1e6)+ "μs";
    document.getElementById('simulation-param-output').innerText = d3.format(",.0f")(simData.total_parameters);
    document.getElementById('simulation-time-per-path-output').innerText = d3.format(",.0f")(simData.simulation_time_per_path * 1e6) + "μs";
    let data = simData.nominal;
    if (moneyType === "real") {
        data = simData.real;
    }

    document.getElementById("final-mean-wealth-output").innerText = d3.format(",.0f")(data.final_mean);
    document.getElementById("destitution-probability-output").innerText = d3.format(",.2f")(simData.destitution[simData.destitution.length - 1] * 100);
    // document.getElementById("final-wealth-std-output").innerText = d3.format(",.0f")(data.final_std);
    document.getElementById("final-median-wealth-output").innerText = d3.format(",.0f")(data.final_median);
    // document.getElementById("final-wealth-min-output").innerText = d3.format(",.0f")(data.final_min);
    // document.getElementById("final-wealth-max-output").innerText = d3.format(",.0f")(data.final_max);
    document.getElementById("total-destitution-proportion-output").innerText = d3.format(",.2f")(simData.destitution_area * 100);
}

// Example usage:
const apiQueue = new BackendHandler();

// localhost endpoint for testing
// const simulationsEndpoint = "http://127.0.0.1:5000/"

// Digital Ocean endpoint for production
const simulationsEndpoint = "https://monte-carlo-backend-wo8lc.ondigitalocean.app/"

// Adding a request
apiQueue.addRequest(simulationsEndpoint, {}, (err, data) => {
    if (err) {
        console.error('Request 1 failed:', err);
    } else {
        console.log('Request 1 data:', data);
        // Update UI or do something with `data`
    }
});

function runSimulation() {
    let endpoint = simulationsEndpoint + "/api/simulation"
    let requestJson = getRequestJson();
    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestJson)
    };
    apiQueue.addRequest(endpoint, options, (err, data) => {
        if (err) {
            console.error('Simulation request failed:', err);
        } else {
            console.log('Simulation data:', data);
            // Update UI or do something with `data`
            currentSimulationData = data;
            drawDestitutionGraph(currentSimulationData);
            drawWealthGraph(currentSimulationData, moneyType, getOutputYScale());
            updateSimulationMetadata(currentSimulationData);
        }
    });
}

runSimulationSignal.subscribe(runSimulation);