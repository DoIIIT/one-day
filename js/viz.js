function Viz(options) {
    
    this.type =  /(canvas|webgl)/.test(url.type) ? url.type : 'webgl';

    this.two = new Two({
        type: Two.Types[this.type],
        fullscreen: true, 
        autostart: true
    }).appendTo(document.body);

    this.colorScale = options.colorScale || colorScale || {};
    this.colorComb = options.colorComb;
    this.colorCombOrder = options.colorCombOrder;
    var scale = this.colorComb[this.colorCombOrder[1]].s;
    this.arcColorScale = d3.scaleSequential(scale);

    this.background = {};
    this.bgc = this.colorComb[this.colorCombOrder[0]].b;

    // stores the Tween.Groups
    this.tweenGroups = {};
    // stores the Tweens for all the Tween.Groups
    // key = animStages
    this.tweenCollections = {};
    this.animStages = ["start", "middle", "end", "color"];

    this.cbInfo = [1];

    this.layerN = 1;
    this.radiusIncrement = 1;
    this.circleN = 1;
    
    // a circle container Two.Group
    this.container = {};

    this.endIndex = undefined;
    this.lengthStorage = {}; // the number of arcs in each layer of a circle

    // A set of Two.Groups (`tg`) that represents layers of rings. 
    this.tgCircles = [];
    this.arcStorage = {};

    this.midRepeat = 0;

    this.initBackground();
    this.initCircles();
    this.initAnimStages();
    this.loadSettings(options.settings);
    this.createOneSun();
}

Viz.prototype.initBackground = function() {
    // Init background
    var x = this.two.width / 2;
    var y = this.two.height / 2;
    this.background = this.two.makeRectangle(x, y, 
        this.two.width, this.two.height);
    this.background.noStroke();
    this.background.cInRgb = d3.rgb(this.bgc);
    this.background.updateColor = function() {
        var c = this.cInRgb.toString();
        this.fill = c;
    }  
    this.background.updateColor();
    this.background.name = 'background';
}

Viz.prototype.initCircles = function() {
    this.container = this.two.makeGroup();
    this.container.translation.set(this.two.width / 2, this.two.height / 2);
}

Viz.prototype.initAnimStages = function() {
    this.animStages.forEach(function(stage) {
        this.tweenGroups[stage] = new TWEEN.Group();
        this.tweenCollections[stage] = {};
    }.bind(this));
}

Viz.prototype.loadSettings = function(settings) {
    this.layerN = settings["layerN"];
    var max = Math.max(this.two.width, this.two.height);
    var divider = 2 * this.layerN;
    this.radiusIncrement = max/divider;
    this.circleN = settings["circleN"];
    this.midRepeat = settings["midRepeat"];
    this.bgDuration = settings["bgDuration"];

    this.slowRange = settings["slowDuration"];
    this.fastRange = settings["fastDuration"];
    
    this.randomBgDuration =
        d3.randomUniform(this.bgDuration[0], this.bgDuration[1]);
    this.randomSlowRange =
        d3.randomUniform(this.slowRange[0], this.slowRange[1]);
    this.randomFastRange = 
        d3.randomUniform(this.fastRange[0], this.fastRange[1]);
    this.random01 = d3.randomUniform(0,1);

    // (16, 26)
    this.randomLayerNDec = d3.randomUniform( this.layerN / 5, this.layerN /3 );
    this.randomRadiusDec = d3.randomUniform( this.radiusIncrement / 5, this.radiusIncrement/3);
    this.randomArcOpacity = d3.randomUniform(0.2,0.8);

    // This also controls the number of overlapped arcs generated in 
    // one circle group. 
    this.randomDivideN = d3.randomUniform(2, 5);
}

Viz.prototype.play = function() {
    // This code is called everytime two.update() is called
    // two.updated() is automatically called as we have `autostart` 
    // set to true.
    var self = this;
    self.two.bind('update', function(frameCount) {
        self.animStages.forEach(function(stage){
            self.tweenGroups[stage].update();
        });
        TWEEN.update();
    }).play();
}

Viz.prototype.createOneSun = function() {
    this.createMultipleCircles();

    this.createMovements();

    var endIndex = this.endIndex;
    var startNode = this.ringChain(endIndex);

    startNode.start();
    
    var fullTween = new TWEEN.Tween(this.container)
        .to({"rotation":+2*Math.PI},600000)
        .start()
        .repeat(Infinity);
}

/**
 * Create an array of `Two.Group`s 
 * Each group represents a circle. 
 */
Viz.prototype.createMultipleCircles = function() {
    var layerN = this.layerN;
    var radiusIncrement = this.radiusIncrement;

    for (var circleIdx=0; circleIdx < this.circleN; circleIdx++){
        var tgCircle = this.createOneCircle(layerN, radiusIncrement, circleIdx);
        this.tgCircles.push(tgCircle);

        // The outer circle has smaller layerN
        // If circleN = 2, layerN = 80
        // layerN_1 = ~60
        // layerN_2 = ~40
        layerN -= Math.round(this.randomLayerNDec());
        
        // Make the outer arc thinner?
        radiusIncrement -= Math.round(
            // d3.randomUniform(radiusIncrement/5,radiusIncrement/3)()
            this.randomRadiusDec()
        );

        // Add three objects to the container.
        this.container.add(layerN, radiusIncrement, tgCircle);
    }
}

Viz.prototype.createOneCircle = function(layerN, radiusIncrement, circleIndex) {
    // An layer of ring region that houses a set of arcs. 
    var tgCircle = this.two.makeGroup();
    var innerRadius = 0;
    var outerRadius = radiusIncrement;
    
    this.lengthStorage[circleIndex] = {};

    for (var layerIndex = 0; layerIndex < layerN; layerIndex++) {
        
        var divideN = Math.round( this.randomDivideN() );
        
        this.lengthStorage[circleIndex][layerIndex] = divideN;
        
        this.addPieSliceFlat(
            innerRadius,
            outerRadius,
            divideN,
            tgCircle,  
            circleIndex, 
            layerIndex
        );
        innerRadius += radiusIncrement;
        outerRadius += radiusIncrement;
    }

    return tgCircle
} 

/**
 * Create a Two.Group that contains a set of arc (e.g., 3 to 8 arcs)
 * This represents a set of arcs in a layer of ring. 
 * 
 * @param {*} innerRadius 
 * @param {*} outerRadius 
 * @param {*} divideN 
 * @param {*} twoGroup 
 * @param {*} circleIndex 
 * @param {*} layerIndex 
 */
Viz.prototype.addPieSliceFlat = function(
    innerRadius, 
    outerRadius,
    divideN, 
    tgCircle, 
    circleIndex, 
    layerIndex
) {
    // The length of the arc?
    var section = 2 * Math.PI / divideN;

    for(var arcIndex = 0; arcIndex < divideN; arcIndex++){
        var key = circleIndex+","+layerIndex+","+arcIndex;
        var c = d3.rgb(this.colorScale(this.random01()));
        // var arc=two.makeArcSegment(0,0,innerRadius,outerRadius,0,section);
        var arc = this.two.makeArcSegment(
            0,
            0,
            innerRadius,
            outerRadius,
            0,
            section
        );

        // arc.fill=c;
        arc.opacity= 0;
        arc.noStroke();
        arc.cInRgb = c;
        
        // Why this?
        arc.cInRgb["arc"] = arc

        // TODO: why updateColor instead of just changing `fill`?
        arc.updateColor = function () {
            this.fill=this.cInRgb.toString();
        }
        arc.updateColor();
        
        tgCircle.add(arc);

        this.arcStorage[key]={
            "opacity": this.randomArcOpacity(),
            "arc": arc
        };
        // arcStorage[key]={"opacity":1,"arc":arc};
    }
}

Viz.prototype.createMovements = function() {
    // background
    var bgc = this.colorComb[this.colorCombOrder[1]].b;

    this.createBGTween(bgc);
    var lengthStorage = this.lengthStorage;
    var arcStorage = this.arcStorage;

    for (var circleIndex in lengthStorage) {
        var duration = this.randomSlowRange();
        var fastDuration = this.randomFastRange();

        for (var layerIndex in lengthStorage[circleIndex]){
            var totalArc = lengthStorage[circleIndex][layerIndex];

            for (var arcIdx = 0; arcIdx < totalArc; arcIdx++){
                var key = circleIndex+","+layerIndex+","+arcIdx;
                var arc = arcStorage[key]["arc"];
                var opacity = arcStorage[key]["opacity"];
                
                this.createSME(
                    key,
                    arc,
                    opacity,
                    duration,
                    fastDuration,
                    arcIdx,
                    layerIndex,
                    circleIndex
                );

                var nc = d3.rgb( this.arcColorScale( this.random01() ));
                
                // duration of change of the color Tween. 
                var drc = duration/(layerIndex+1);
                this.tweenCollections["color"][key]
                    = new TWEEN.Tween(arc.cInRgb, this.tweenGroups["color"])
                        .to(d3.rgb(nc), drc)
                        .onUpdate(function (object){
                            object["arc"].updateColor()
                        })
            }
        }
    }
    if(this.endIndex == undefined){
        this.endIndex = key;
    }
}

/**
 * Create a background Tween
 * @param {*} bgc 
 */
Viz.prototype.createBGTween = function(bgc) {
    var duration = this.randomBgDuration();
    this.tweenCollections["bg"] = new TWEEN.Tween(this.background.cInRgb)
        .to(d3.rgb(bgc), duration)
        .onUpdate(function (object) {
            this.background.updateColor();
        }.bind(this))
}

// Create Tweens for start middle and end stages?
Viz.prototype.createSME = function(
    key, 
    arc, 
    opacity,
    duration, 
    fastDuration,
    arcIdx,
    layerIndex,
    circleIndex,
) {
    /*
    helper function to set up s m e
     */

    // exit/end, set opacity and rotation to 0 
    //  so the arc becomes not visible
    var eToObj = {"opacity": 0, "rotation": 0};
    this.createTween(
        key,
        arc,
        eToObj,
        duration/(layerIndex+1)/(arcIdx+1)/(circleIndex+1),
        this.tweenGroups["end"],
        this.tweenCollections["end"]
    );

    // The arc starts to rotate. 
    var mToObj = {"rotation": +2 * Math.PI };
    this.createTween(
        key,
        arc,
        mToObj,
        duration*(arcIdx+1)/(layerIndex+1)/(circleIndex+1)* 15,
        this.tweenGroups["middle"],
        this.tweenCollections["middle"]
    );

    // The arc changes to certain opacity
    var sToObj = {"opacity": opacity};
    this.createTween(
        key,
        arc,
        sToObj,
        fastDuration/2/(layerIndex+1),
        this.tweenGroups["start"],
        this.tweenCollections["start"]
    );
}

/**
 * 
 * Move an arc of different animStages (start, middle end) 
 * from a position to another position using Tween. 
 */
Viz.prototype.createTween = function(
    key, 
    arc, 
    toObj, 
    duration, 
    tweenGroup,
    tweenCollections
) {
    // Create a new tween that modifies arc?
    // Controlling a group of tween from `arc` to `toObj`
    tweenCollections[key] = new TWEEN.Tween(arc, tweenGroup)
        .to(toObj, duration); // move to `toObj` in `duration` seconds
}

Viz.prototype.ringChain = function(endIndex) {
    var self = this;
    var sChain = {"s":undefined, "p":undefined};
    var cChain = {"s":undefined, "p":undefined};

    for(var circleIndex in this.lengthStorage) {
        for (var layerIndex in this.lengthStorage[circleIndex]) {
            
            var totalArc = this.lengthStorage[circleIndex][layerIndex];

            for (arcIdx = 0; arcIdx < totalArc; arcIdx++) {
                var key = circleIndex + "," + layerIndex + "," + arcIdx;
                // start, end, middle, color.
                var st = this.tweenCollections["start"][key];
                var et = this.tweenCollections["end"][key];
                var mt = this.tweenCollections["middle"][key];
                var ct = this.tweenCollections["color"][key];

                if (sChain["s"]==undefined){
                    sChain["s"]=st;
                    sChain["p"]=st;
                    cChain["s"]=ct;
                    cChain["p"]=ct;
                } else {
                    sChain['p'].chain(st,mt);
                    // mt.repeat(midRepeat)
                    sChain["p"]=st;
                    cChain['p'].chain(ct);
                    cChain["p"]=ct;
                }
                mt.chain(et);
            }
        }
    }
    // console.log(endIndex)
    var lastEt = this.tweenCollections["end"][endIndex];

    lastEt.chain(sChain["s"], cChain["s"], this.tweenCollections["bg"])
        .onComplete(function (object) {
            //update background color
            this.cbInfo[0]+=1;
            cbIdx = this.cbInfo[0] % colorCombOrder.length;

            var newBGC = d3.rgb(this.colorComb[this.colorCombOrder[cbIdx]].b);
            var bgDuration = this.tweenCollections["bg"]._duration;
            this.tweenCollections["bg"].to(newBGC,bgDuration)

            //update front colors
            var newScale=d3.scaleSequential(
                this.colorComb[this.colorCombOrder[cbIdx]].s
            );

            this.updateColorScale(newScale, this.lengthStorage, this.tweenCollections)
            // var time = new Date();
            // console.log(time)
        }.bind(this));
    sChain["e"]=lastEt

    return sChain["s"]
}

Viz.prototype.updateColorScale = function(newScale) {
    for(var circleIndex in this.lengthStorage) {
        for (var layerIndex in this.lengthStorage[circleIndex]){
            var totalArc = this.lengthStorage[circleIndex][layerIndex];
            for (arcIdx =0 ;arcIdx<totalArc; arcIdx++){
                var key = circleIndex+","+layerIndex+","+arcIdx;
                var arc = this.arcStorage[key]["arc"];
                var originalDuration = this.tweenCollections["color"][key]._duration;
                // originalDuration=10
                var newColor = d3.rgb(newScale(this.random01()));
                this.tweenCollections["color"][key].to(newColor, originalDuration);
            }
        }
    }
}