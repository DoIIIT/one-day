/**
 * Created by heslicia on 10/19/2017.
 */

var linearRange = d3.scaleLinear().domain([0, 20]).range([0, 1]);
// var colorScale = createSequentialScale();
// var colorScale = d3.scaleSequential();

var colorComb = {
    "dawn": {
        "b": 'rgb(66, 134, 244)',
        "sb": buildSequentialScale([230,320],[0.22,0.66],[0.72,0.91]),
        "s": d3.interpolatePuRd
    },
    "blueMorning": {
        "s": d3.interpolateYlGnBu,
        "sb": buildSequentialScale([45,230],[0.53,0.8],[0.29,0.7]),
        "b": "rgb(0, 39, 104)"
    },
    "redOrange": {
        "sb": buildSequentialScale([0,57],[0.65,1],[0.94,0.98]),
        "s": d3.interpolateRdYlBu,
        "b":"rgb(255, 127, 0)"
    },
    "totalDark": {
        "s": buildSequentialScale([45,72],[0.95,1],[0.6,0.1]),
        "b": "rgb(0,0,0)",
        "o": [0.7,1]
    },
    "dark": {
        "s": buildSequentialScale([44,63],[0.95,1],[0.80,0.99]), 
        "b": "rgb(82, 98, 124)",
        "o": [0.8,1]
    }
}

// colorCombOrder=["totalDark","dark","blueMorning","redOrange","dawn"]
var colorCombOrder = ["blueMorning","redOrange","dawn","totalDark","dark"]
var colorScale = d3.scaleSequential(colorComb[colorCombOrder[0]].s);

var setting1 = {
    //quick change, less complicated, debug version
    "layerN": 10,
    "circleN": 3,
    "midRepeat": 1,
    "bgDuration": [10000,20000],
    "slowDuration": [20000,22000],
    "fastDuration": [400,600]
}

var setting2 = {
    "layerN": 80,
    "circleN": 2,//`1
    "midRepeat": 1,
    "bgDuration": [10000,20000],
    "slowDuration": [240000,250000],//[120000,150000],
    "fastDuration": [6000,7000]
}

var setting3 = {
    //quick change, less complicated, debug version
    "layerN": 40,
    "circleN": 2,//`1
    "midRepeat": 1,
    "bgDuration": [10000,20000],
    "slowDuration": [340000,350000],//[120000,150000],
    "fastDuration": [6000,7000]
}
