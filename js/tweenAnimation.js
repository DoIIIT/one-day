/**
 * Created by heslicia on 10/24/2017.
 */

//helper
function createTween(key,arc,toObj,duration,tweenGroup,tweenCollection) {
    tweenCollection[key]=new TWEEN.Tween(arc,tweenGroup)
        .to(toObj,duration)
        // .easing(TWEEN.Easing.Circular.InOut)
}

function createSME(key,arc,opacity,duration,fastDuration,arcIdx,layerIndex,circleIndex,tweenGroups,tweenCollections) {
    /*
    helper function to set up s m e
     */
    eToObj={"opacity": 0, "rotation": 0}
    createTween(
        key,
        arc,
        eToObj,
        duration/(layerIndex+1)/(arcIdx+1)/(circleIndex+1),
        tweenGroups["end"],
        tweenCollections["end"]
    );

    mToObj={"rotation":+2*Math.PI}
    createTween(key,arc,mToObj,duration*(arcIdx+1)/(layerIndex+1)/(circleIndex+1)* 15,tweenGroups["middle"],tweenCollections["middle"]);

    sToObj={"opacity": opacity}//, "rotation": +Math.PI * (arcIdx+1)
    createTween(key,arc,sToObj,fastDuration/2/(layerIndex+1),tweenGroups["start"],tweenCollections["start"])
}

function createBGtween(background,backgroundC,tweenCollections,durationRange) {

    // c=parseInt(rgb2hex(backgroundC).slice(1),16)
    // console.log(c)
    // o=parseInt(rgb2hex(d3.rgb(background.fill).toString()).slice(1),16)
    // colorProxy={"o":o,"b":background,"c":c}
    // colorToObj={"o":c}
    duration=d3.randomUniform(durationRange[0],durationRange[1])()
    // duration=200;
    tweenCollections["bg"]=new TWEEN.Tween(background.cInRgb)
        .to(d3.rgb(backgroundC),duration)
        // .easing(TWEEN.Easing.Circular.InOut)
        .onUpdate(function (object) {
            background.updateColor()
            // console.log("bgTo",background.fill)
        })
//         .onComplete(function (object) {
//             // console.log("bgC",background.fill)
//         })
}

function createMovements(sunStorage,tweenGroups,tweenCollections,background,setting) {
    /*
    generate Initial Tweens
     */
    arcColorScale=d3.scaleSequential(colorComb[colorCombOrder[1]].s)
    backgroundC=colorComb[colorCombOrder[1]].b
    createBGtween(background,backgroundC,tweenCollections,setting["bgDuration"]);

    lengthStorage=sunStorage["lengthStorage"]
    arcStorage=sunStorage["arcStorage"]
    //create background tween

    slowRange=setting["slowDuration"]
    fastRange=setting["fastDuration"]

    for(var circleIndex in lengthStorage) {
        var duration = d3.randomUniform(slowRange[0],slowRange[1])()
        var fastDuration = d3.randomUniform(fastRange[0],fastRange[1])()//saved
        // var duration = d3.randomUniform(300, 500)()
        // var fastDuration = d3.randomUniform(40,80)()
        for (var layerIndex in lengthStorage[circleIndex]){
            totalArc=lengthStorage[circleIndex][layerIndex]
            for (arcIdx =0;arcIdx<totalArc; arcIdx++){
                key=circleIndex+","+layerIndex+","+arcIdx
                arc=arcStorage[key]["arc"]
                opacity=arcStorage[key]["opacity"]
                createSME(key,arc,opacity,duration,fastDuration,arcIdx,layerIndex,circleIndex,tweenGroups,tweenCollections)
                // createTween(key,arc.cInRgb,d3.rgb(colorScale(d3.randomUniform(0,1)())),duration/(layerIndex+1),tweenGroups["color"],tweenCollections["color"])
                var nc=d3.rgb(arcColorScale(d3.randomUniform(0,1)()))
                var drc=duration/(layerIndex+1)
                // var drc=100
                // console.log(arc.cInRgb,nc,74)
                tweenCollections["color"][key]=new TWEEN.Tween(arc.cInRgb,tweenGroups["color"])
                    .to(d3.rgb(nc),drc)
                    // .easing(TWEEN.Easing.Circular.InOut)
                    .onUpdate(function (object){
                        object["arc"].updateColor()
                        // console.log("arc",arc.fill)
                    })
            }
        }
    }
    if(sunStorage["endIndex"]==undefined){
        sunStorage["endIndex"]=key
    }
    // colorScale
}
function updateColorScale(newScale,lengthStorage,tweenCollections){
    for(var circleIndex in lengthStorage) {
        for (var layerIndex in lengthStorage[circleIndex]){
            totalArc=lengthStorage[circleIndex][layerIndex]
            for (arcIdx =0;arcIdx<totalArc; arcIdx++){
                key=circleIndex+","+layerIndex+","+arcIdx
                arc=arcStorage[key]["arc"]
                originalDuration=tweenCollections["color"][key]._duration
                // originalDuration=10
                newColor=d3.rgb(newScale(d3.randomUniform(0,1)()))
                tweenCollections["color"][key].to(newColor,originalDuration)
            }
        }
    }

}
function ringChain(lengthStorage,tweenCollections,endIndex,midRepeat,cbInfo) {
    /*
    chain start with end
     */
    sChain={"s":undefined,"p":undefined}
    cChain={"s":undefined,"p":undefined}

    for(var circleIndex in lengthStorage) {
        for (var layerIndex in lengthStorage[circleIndex]) {
            totalArc = lengthStorage[circleIndex][layerIndex]
            for (arcIdx = 0; arcIdx < totalArc; arcIdx++) {
                key = circleIndex + "," + layerIndex + "," + arcIdx
                st=tweenCollections["start"][key]
                et=tweenCollections["end"][key]
                mt=tweenCollections["middle"][key]
                ct=tweenCollections["color"][key]
                if (sChain["s"]==undefined){
                    sChain["s"]=st
                    sChain["p"]=st
                    // mt.repeat(Math.max(1,Math.round(midRepeat/(layerIndex+1))))
                    cChain["s"]=ct
                    cChain["p"]=ct
                }else{
                    sChain['p'].chain(st,mt)
                    // mt.repeat(midRepeat)
                    sChain["p"]=st

                    cChain['p'].chain(ct)
                    cChain["p"]=ct
                }
                mt.chain(et)
            }
        }
    }
    // console.log(endIndex)
    lastEt=tweenCollections["end"][endIndex]

    lastEt.chain(sChain["s"],cChain["s"],tweenCollections["bg"])
        .onComplete(function (object) {
            //update background color
            cbInfo[0]+=1;
            cbIdx=cbInfo[0]%colorCombOrder.length
            // console.log(cbIdx,cbInfo[0])
            // console.log(tweenCollections["bg"])
            newBGC=d3.rgb(colorComb[colorCombOrder[cbIdx]].b)
            bgDuration=tweenCollections["bg"]._duration
            tweenCollections["bg"].to(newBGC,bgDuration)
            //update front colors
            newScale=d3.scaleSequential(colorComb[colorCombOrder[cbIdx]].s)
            updateColorScale(newScale,lengthStorage,tweenCollections)
            // var time = new Date();
            // console.log(time)
        });
    sChain["e"]=lastEt

    return sChain["s"]
}

