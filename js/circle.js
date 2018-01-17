/**
 * Created by heslicia on 10/19/2017.
 * functions for creating and animating circles
 */

function addPieSlice_flat(
    innerRadius, 
    outerRadius,
    divideN,
    colorScale, 
    arcs, 
    arcStorage, 
    circleIndex, 
    layerIndex, 
    two
){
    var rand01= d3.randomUniform(0,1);
    var section= 2*Math.PI/divideN;

    // This is N circles * M layers * K  divideN (avg 8)
    // currently this is 2 * 80 * 8 in each cycle = 1280 
    for(var arcIndex =0; arcIndex<divideN; arcIndex++){
        var key = circleIndex+","+layerIndex+","+arcIndex;
        var c = d3.rgb(colorScale(rand01()));
        // var arc=two.makeArcSegment(0,0,innerRadius,outerRadius,0,section);
        var arc = two.makeArcSegment(
            0,
            0,
            innerRadius,
            outerRadius,
            0,
            section
        );
        // arc.fill=c;
        arc.opacity= 0
        arc.noStroke();
        arc.cInRgb = c
        arc.cInRgb["arc"] = arc

        // TODO: why updateColor instead of just changing `fill`?
        arc.updateColor=function () {
            this.fill=this.cInRgb.toString();
            // console.log("update color",this.fill)
        }
        arc.updateColor();
        arcs.add(arc);
        arcStorage[key]={
            "opacity": d3.randomUniform(0.2,0.8)(),
            "arc":arc
        };
        // arcStorage[key]={"opacity":1,"arc":arc};
    }

}

function createOneCircle_flat(
    layerN,
    radiusIncrement,
    two,
    lengthStorage,
    arcStorage,
    circleIndex,
    colorScale
) {
    var oneCircle = two.makeGroup();
    var innerRadius = 0;
    var outerRadius = radiusIncrement;
    lengthStorage[circleIndex] = {};
    for (var layerIndex = 0; layerIndex < layerN; layerIndex++) {
        //for each layer

        // TODO: why not just using Math.random() ?
        var divideN = Math.round( d3.randomUniform(2, 5)() );
        lengthStorage[circleIndex][layerIndex]=divideN;
        
        addPieSlice_flat(
            innerRadius,
            outerRadius,
            divideN,
            colorScale, 
            oneCircle, 
            arcStorage, 
            circleIndex, 
            layerIndex, 
            two
        );
        innerRadius += radiusIncrement;
        outerRadius += radiusIncrement;
    }

    return oneCircle
}

function createMultipleCircles_flat(
    circleN,
    layerN,
    radiusIncrement,
    container,
    two,
    colorScale
) {
    /*
    container is a two.group
     */
    masterStorage = {
        "circleGroups":[],
        "arcStorage":{},
        "lengthStorage":{}
    }
    for (var circleIdx=0; circleIdx < circleN; circleIdx++){
        var oneCircle = createOneCircle_flat(layerN,radiusIncrement,two,masterStorage["lengthStorage"],masterStorage["arcStorage"],circleIdx,colorScale)
        masterStorage["circleGroups"].push(oneCircle);
        layerN -= Math.round(
            d3.randomUniform(layerN/5,layerN/3)()
        );
        radiusIncrement -= Math.round(
            d3.randomUniform(radiusIncrement/5,radiusIncrement/3)()
        );
        container.add(oneCircle);
    }
    return masterStorage
}
