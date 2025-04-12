function linInterpolateSlavePoints(definedPoints, step) {
    /**
     * Interpolate slave points between defined points.
     * 
     * @param {Array} definedPoints - Array of tuples [x, y] representing defined points.
     * @param {number} step - Step size for interpolation.
     * @returns {Array} - Array of interpolated points as [x, y].
     */
    const slavePoints = [];
    for (let i = 0; i < definedPoints.length - 1; i++) {
        const [x1, y1] = definedPoints[i];
        const [x2, y2] = definedPoints[i + 1];
        if (x2 - x1 > step) {
            for (let x = x1 + 1; x < x2; x += step) {
                const y = y1 + (y2 - y1) * (x - x1) / (x2 - x1);
                slavePoints.push([x, y]);
            }
        }
    }
    return slavePoints;
}


var maxSteps = 60 * 12
var simStep = 12; // months
var magnetStep = 12; // months
var maxInflow = 30000; // max inflow
var maxOutflow = -120000; // max outflow
var percentiles = [5, 25, 50, 75, 95]; // percentiles to show in the chart
var moneyType = "real"; // "real" or "nominal"

var initCashflows = [0, maxSteps].map(function (i) {
    return {
        'Step': i,
        'Value': 0,
    };
});
initCashflows = [
    {
        'Step': 0,
        'Value': 5200,
    },
    { 
        'Step': maxSteps/2,
        'Value': 5200,
    },
    { 
        'Step': maxSteps/2 + 1,
        'Value': -40000,
    },
    {
        'Step': maxSteps,
        'Value': -40000,
    }
]
var assets = ['Cash', 'Bonds', 'Stocks']
var initWeights = [0, maxSteps/2, maxSteps].map(function (i) {
    return {
        'Step': i,
        'Bonds': 0.3,
        'Stocks': 0.7,
    };
});

var currentSimulationData = {
    "timesteps": [],
    "destitution": [],
    "real": {
        "mean": [],
        "percentiles": {},
    },
    "nominal": {
        "mean": [],
        "percentiles": {},
    }
}

function sortDataseries(data) {
    /**
     * Sort the data series by the "Step" property.
     * 
     * @param {Array} data - Array of data points with "Step" property.
     * @returns {Array} - Sorted data.
     */
    return data.sort((a, b) => a.Step - b.Step);
}

function changeDataseriesTimesteps(data, newEndStep) {
    /**
     * Change the number of timesteps in the data.
     * 
     * @param {Array} data - Array of data points with "Step" property.
     * @param {number} newEndStep - New end step for the data.
     * @returns {Array} - Data with updated timesteps.
     */

    data = sortDataseries(data);

    let droppedSteps = data.filter(d => d.Step >= newEndStep);
    data = data.filter(d => d.Step < newEndStep);
    if (droppedSteps.length > 0) {
        data.push(droppedSteps[0]);
    }
    // update the step of the last data point
    data[data.length - 1].Step = newEndStep;
    return data;
}

class Signal {
    constructor() {
        this.subscribers = [];
    }

    // Subscribe a callable (function)
    subscribe(fn) {
        if (typeof fn === 'function') {
            this.subscribers.push(fn);
        } else {
            throw new Error('Subscriber must be a function');
        }
    }

    // Unsubscribe a callable
    unsubscribe(fn) {
        this.subscribers = this.subscribers.filter(sub => sub !== fn);
    }

    // Fire (emit) the signal with arguments
    emit(...args) {
        this.subscribers.forEach(fn => fn(...args));
    }

    // Clear all subscribers
    clear() {
        this.subscribers = [];
    }
}

const runSimulationSignal = new Signal();