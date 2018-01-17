/**
 * Created by heslicia on 10/19/2017.
 */
$(function() {
    //set up
    var bgc=colorComb[colorCombOrder[0]].b;
    var type = /(canvas|webgl)/.test(url.type) ? url.type : 'webgl';
    var two = new Two({
        type: Two.Types[type],
        fullscreen: true,
        autostart: true
    }).appendTo(document.body);

    //create background
    var background = two.makeRectangle(two.width / 2, two.height / 2, two.width, two.height);
    background.noStroke();
    background.cInRgb = d3.rgb(bgc);
    background.updateColor = function () {
        var c = this.cInRgb.toString();
        this.fill = c;
    }
    background.updateColor();
    background.name = 'background';

    //make circles
    var container = two.makeGroup();
    container.translation.set(two.width / 2, two.height / 2);
    var tweenGroups={};
    var tweenCollections={};

    // Four animation groups. 
    // The display will go through these four stages. 
    var tags =  ["start","middle","end","color"];
    tags.forEach(function(tag){
        tweenGroups[tag]=new TWEEN.Group();
        tweenCollections[tag]={};
    });
    cbInfo=[1];

    function createOneSun(setting) {
        var layerN = setting["layerN"];
        // var radiusIncrement=3*Math.max(two.width,two.height)/Math.pow(layerN,2);
        
        // The thickness of the 
        var radiusIncrement = Math.max(two.width, two.height)/ (3 * layerN);
        var circleN = setting["circleN"];

        var sunStorage = createMultipleCircles_flat(
            circleN,
            layerN,
            radiusIncrement,
            container,
            two,
            colorScale
        );
        //sunStorage={"arcGroups":[],"arcStorage":{"opacity":xx,"arc":twoArc},"lengthStorage":{1:{1:3}}}
        // set up animation
        var midRepeat = setting["midRepeat"];
        createMovements(sunStorage,tweenGroups,tweenCollections,background,setting);
        endIndex=sunStorage["endIndex"];
        var startNode=ringChain(sunStorage["lengthStorage"],tweenCollections,endIndex,midRepeat,cbInfo,setting)
        startNode.start()
        // new TWEEN.Tween(arc,tweenGroup)
        fullTween=new TWEEN.Tween(container)
            .to({"rotation":+2*Math.PI},600000)
            .start()
            .repeat(Infinity)
    }

    createOneSun(setting3)



    //animation binding
    two.bind('update', function(frameCount) {
        // var tags = ["start","middle","end","color"];
        var tags = ["start", "middle","color"];
        tags.forEach(function(tag){
            tweenGroups[tag].update();
        });
        TWEEN.update();

    }).play();
    // svg=d3.select("svg")
    // svg.selectAll("text")
    //     .data([1])
    //     .enter()
    //     .append("text")
    //     .text("abc")
    //     .attr("fill","red")
    //     .attr("font-size", "500px")
    //     .attr("x",two.width/2)
    //     .attr("y",two.height/2)
});

