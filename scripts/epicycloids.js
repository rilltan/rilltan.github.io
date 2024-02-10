function setup() {
    var cnv = createCanvas(center * 2, center * 2);
    cnv.parent("sketch-holder");
    rSlider = new p5.Element(document.getElementById("slider-outer-circle"));
    RSlider = new p5.Element(document.getElementById("slider-inner-circle"));
}

let center = 200;
let t = 0.0; // 0 to 2pi
let x, y, pointx, pointy, r, R;
let pointsx = [];
let pointsy = [];

function calcAngle(t1, r1, R1) {
    let n = (R1 / r1) + 1;
    return t1 * n + PI;
}

function draw() {
    if (r != rSlider.value() || R != RSlider.value()) {
        t = 0;
    }
    t += PI / 150;
    if (t > TWO_PI * 8 || t == PI / 150) {
        t = PI / 150;
        pointsx = [];
        pointsy = [];
    }
    r = rSlider.value();
    R = RSlider.value();
    x = (R + r) * cos(t);
    y = -(R + r) * sin(t);
    pointx = x + r * cos(calcAngle(t, r, R));
    pointy = y - r * sin(calcAngle(t, r, R));

    pointsx.push(pointx + center);
    pointsy.push(pointy + center);

    background(220);
    strokeWeight(1);
    fill("rgb(255,255,255)");
    circle(center, center, 2 * R);
    circle(x + center, y + center, 2 * r);
    strokeWeight(5);
    point(center + pointx, center + pointy);

    curveTightness(1);
    strokeWeight(1);
    noFill();
    beginShape();
    curveVertex(pointsx[0], pointsy[0]);
    for (let i = 0; i < pointsx.length; i++) {
        curveVertex(pointsx[i], pointsy[i]);
    }
    curveVertex(pointsx[pointsx.length - 1], pointsy[pointsy.length - 1]);
    endShape();

    fill("rgb(0,0,0)");
    text("Outer circle: "+r+"        Inner circle: "+R, 20, center*1.9);
}