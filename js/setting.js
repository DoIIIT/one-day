/**
 * Created by heslicia on 10/19/2017.
 */
var linearRange = d3.scaleLinear().domain([0, 20]).range([0, 1]);
// var colorScale = createSequentialScale();
// var colorScale = d3.scaleSequential();
var colorScale = d3.scaleSequential(d3.interpolateYlGnBu);
var colorComb={
    "dawn":{"b": 'rgb(66, 134, 244)',"s":d3.interpolatePuRd},
    "blueMorning":{"s":d3.interpolateYlGnBu,"b":"rgb(0, 39, 104)"},
    "redOrange":{"s":d3.interpolateRdYlBu,"b":"rgb(255, 127, 0)"},
    "dark":{"s":d3.interpolateBrBG,"b":"rgb(0,0,0)","o":[0.7,1]},
    "totalDark":{"s":buildSequentialScale([59,68],[0.95,1],[0.94,0.98]),"b":"rgb(82, 98, 124)","o":[0.8,1]}
}