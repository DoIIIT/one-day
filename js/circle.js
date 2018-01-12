/**
 * Created by heslicia on 10/19/2017.
 * functions for creating and animating circles
 */


function addPieSlices(innerRadius,outerRadius,divideN,colorScale,arcs,indArcs,two) {
    var rand01=d3.randomUniform(0,1);
    var section=2*Math.PI/divideN;
    var indArcG=[]
    for(var i =0;i<divideN;i++){
        var c =colorScale(rand01());
        var arc=two.makeArcSegment(0,0,innerRadius,outerRadius
            ,i*section,(i+1)*section);
        arc.fill=c;
        arc.opacity=d3.randomUniform(0.2,0.8)();
        arc.noStroke();
        // arc.rotation = 30
        arcs.add(arc)
        indArcG.push(arc)
    }
    indArcs.push(indArcG);
    return arc
}

function createOneCircle(layerN,radiusIncrement,two) {
    var arcs=two.makeGroup();
    var indArcs=[];
    var innerRadius=0;
    var outerRadius=radiusIncrement;
    for (var i=0;i<layerN;i++){
        var divideN=Math.round(d3.randomUniform(2,15)());
        var arcG=addPieSlices(innerRadius,outerRadius,divideN,colorScale,arcs,indArcs,two)
        innerRadius+=radiusIncrement;
        outerRadius+=radiusIncrement;
    }
    return [arcs,indArcs]
}

function createMultipleCircles(N,layerN,radiusIncrement,two) {
    var arcCollection=[];
    var inArcCollection=[];
    for (i=0;i<N;i++){
        var arcs, indArcs;
        var circleP=createOneCircle(layerN,radiusIncrement,two)
        arcs=circleP[0];
        indArcs=circleP[1]
        arcCollection.push(arcs)
        inArcCollection.push(indArcs)
        N-=Math.round(d3.randomUniform(N/5,N/2)())
        radiusIncrement-=Math.round(d3.randomUniform(radiusIncrement/5,radiusIncrement/2)())
    }
    return [arcCollection,inArcCollection]
}   

function animateCircles(frameCount,inArcCollection,switchLimit,speedLimit,rand0001) {
    inArcCollection.forEach(function(indArcs) {
        for (var i in indArcs){
            var initSpeed=rand0001()*Math.PI;
            for (var j in indArcs[i]){
                if (indArcs[i][j].rotation>Math.PI*2){
                    indArcs[i][j].rotation=0;
                }
                indArcs[i][j].rotation+=initSpeed;
                initSpeed+=rand0001()*0.1*Math.PI;
            }
        }
        if(frameCount % switchLimit==0){
            // console.log("swap")
            var ph=speedLimit[0];
            speedLimit[0]=-speedLimit[1];
            speedLimit[1]=-ph;
            rand0001=d3.randomUniform(speedLimit[0],speedLimit[1]);
        }
    });

}