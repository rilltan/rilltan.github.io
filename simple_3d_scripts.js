function setup() {
  cnv = createCanvas(600, 600);
  cnv.parent("threed_sketch_holder")
}

var x = 200
var y = 200
var prevx = 200
var prevy = 200
var angle = 270
var coords = []
var keys = []
var colliders = []
var rays = []
var mode = "3d"
var resolution = 0.5
var fov = 60
var speed = 2
var colour = 0

// Adds key to list of current keys
function keyPressed() {
  if (keys.includes(keyCode)){
    
  } else {
    keys.push(keyCode)
  }
}

// Checks if input is currently held down
function checkKey(x){
  return x == keyCode
}

// Removes key from list of current keys
function keyReleased(){
  if (keys.includes(keyCode)){
    let position = keys.findIndex(checkKey);
    keys.splice(position,1)
  }
}

function findDistance(x1,y1,x2,y2) {
  return sqrt((x2-x1)**2+(y2-y1)**2)
}

function isColliding (x1,y1,w1,h1,x2,y2,w2,h2) {
  if (x1+w1<x2||x1>x2+w2||y1+h1<y2||y1>y2+h2) {return false}
  else {return true}
}

class Ray {
  constructor (angle) {
    this.x = x
    this.y = y
    this.hit = false
    this.angle = angle
    this.length = 0
  }
  cast () {
    while (this.hit == false) {
      this.x += cos(this.angle)
      this.y += sin(this.angle)
      for (let i of colliders) {
        if (isColliding(this.x,this.y,0,0,i.x,i.y,i.w,i.h)) {
          this.hit = true
        }
        if (this.x>600 || this.x < 0 || this.y>600 || this.y < 0) {
          this.hit = true
        }
      }
    }
    this.length = findDistance(this.x,this.y,x,y)
    this.length = this.length * cos(angle-this.angle)
    if (mode == "2d") {
      line(x,y,this.x,this.y)
    }
  }
}

class Collider {
  constructor (x,y,w,h) {
    this.x = x
    this.y = y
    this.w = w
    this.h = h
  }
  drawSelf () {
    rect(this.x,this.y,this.w,this.h)
  }
}
colliders.push(new Collider(245.5,303.125,44,230))
colliders.push(new Collider(443.5,396.125,20,56))
colliders.push(new Collider(89.5,458.125,11,27))
colliders.push(new Collider(90.5,175.125,100,127))
colliders.push(new Collider(335.5,161.125,229,89))

function draw() {
  background(0)
  angleMode(DEGREES)
  for (let k=-(fov/2);k<=fov/2;k+=resolution) {
    rays.push(new Ray(angle+k))
  }
  
  strokeWeight(4)
  stroke("blue")
  for (let i of rays) {
    i.cast()
  }
  
  if (keys.includes(37)) {angle -= 1.5}
  if (keys.includes(39)) {angle += 1.5}
  if (keys.includes(87)) {
    x += speed * cos(angle)
  }
  if (keys.includes(83)) {
    x -= speed * cos(angle)
  }
  if (keys.includes(68)) {
    x += speed * cos(angle+90)
  }
  if (keys.includes(65)) {
    x -= speed * cos(angle+90)
  }
  
  for (let i of colliders) {
    if (isColliding(x-5,y-5,10,10,i.x,i.y,i.w,i.h)) {
      x = prevx
    }
  }
  
  if (keys.includes(87)) {
    y += speed * sin(angle)
  }
  if (keys.includes(83)) {
    y -= speed * sin(angle)
  }
  if (keys.includes(68)) {
    y += speed * sin(angle+90)
  }
  if (keys.includes(65)) {
    y -= speed * sin(angle+90)
  }
  
  for (let i of colliders) {
    if (isColliding(x-5,y-5,10,10,i.x,i.y,i.w,i.h)) {
      y = prevy
    }
  }
  
  if (mode == "3d") {
    strokeWeight(6)
    for (let i=0;i<rays.length;i++) {
      colour = 255-rays[i].length
      if (colour < 10) {colour=10}
      stroke(colour/2,colour/2,colour)
      line(i*600/(fov/resolution),300-(10000/rays[i].length),i*600/(fov/resolution),300+(10000/rays[i].length))
    }
  }
  
  if (mode == "2d") {
    strokeWeight(1)
    stroke("black")
    for (let i of colliders) {
      i.drawSelf()
    }

    translate(x,y)
    rotate(angle)
    quad(10,0,-10,10,-3,0,-10,-10)
  }
  
  prevx = x
  prevy = y
  rays = []
}