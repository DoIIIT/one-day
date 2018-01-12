/**
 * Created by heslicia on 10/19/2017.
 */
$(function() {


    var bgc="white";
    var type = /(canvas|webgl)/.test(url.type) ? url.type : 'webgl';
    var two = new Two({
        type: Two.Types[type],
        fullscreen: true,
        autostart: true
    }).appendTo(document.body);

    var background = two.makeRectangle(two.width / 2, two.height / 2, two.width, two.height);
    background.noStroke();
    background.fill = bgc;
    background.name = 'background';
    var bgGroup=two.makeGroup(background);


    var container = two.makeGroup();
    container.translation.set(two.width / 2, two.height / 2);

    var layerN=100;
    var radiusIncrement=Math.max(two.width,two.height)/1.5/layerN;
    // console.log(radiusIncrement)
    aInfo=createMultipleCircles(10,layerN,radiusIncrement,two)
    arcCollection=aInfo[0];
    inArcCollection=aInfo[1];
    arcCollection.forEach(function(circle){
        console.log(circle);
        container.add(circle);
    });

    var speedLimit=[0,0.001];
    var rand0001=d3.randomUniform(speedLimit[0],speedLimit[1]);

    two.bind('update', function(frameCount) {
        animateCircles(frameCount,inArcCollection,240,speedLimit,rand0001);
        // console.log(frameCount)
    }).play();

});


Two.prototype.makeSquiggle = function(width, height, phi) {

    var amt = 64;

    var squiggle = this.makeCurve(
        _.map(_.range(amt), function(i) {
            var pct = i / (amt - 1);
            var theta = pct * Math.PI * 2 * phi + Math.PI / 2;
            var x = width * pct - width / 2;
            var y = height / 2 * Math.sin(theta);
            return new Two.Anchor(x, y);
        }),
        true
    );

    return squiggle;

};

Two.prototype.makeNonagon = function(width, height, sides) {

    width /= 2;
    height /= 2;

    var shape = this.makePath(
        _.map(_.range(sides), function(i) {
            var pct = i / sides;
            var theta = Math.PI * 2 * pct - Math.PI / 2;
            var x = width * Math.cos(theta);
            var y = height * Math.sin(theta);
            return new Two.Anchor(x, y);
        })
    );

    return shape;

};