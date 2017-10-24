/**
 * Created by heslicia on 10/19/2017.
 */
function createSequentialScale() {
    return d3.scaleSequential(
        function(t) {
            // console.log(t)
            randT=d3.randomUniform(t,-t)
            randG=d3.randomUniform(t-randT(),t+randT())
            h=randG()*d3.randomUniform(10,200)()
            s=d3.randomUniform(20,40)()
            l=d3.randomUniform(90,100)()
            hsl= d3.hsl(h,s,l) + "";
            // console.log(hsl);

            return hsl;
        }
    );
}

function buildSequentialScale(hLim,sLim,lLim){
    // return d3.scaleSequential(
    return function(t) {
            // var randT = d3.randomUniform(t, -t)
            // randG = d3.randomUniform(t - randT(), t + randT()),
                h = d3.randomUniform(hLim[0], hLim[1])(),
                s = d3.randomUniform(sLim[0], sLim[1])(),
                l = d3.randomUniform(lLim[0], lLim[1])();
            var hsl = d3.hsl(h, s, l) + "";
            console.log(d3.hsl(h, s, l).rgb())
            console.log(hsl)
            return hsl
        }
    // )
}