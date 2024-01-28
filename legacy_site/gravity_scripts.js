function setup() {
  var cnv = createCanvas(600, 600);
  cnv.mousePressed(addBody)
  cnv.parent("grav_sketch_holder")
}

var bodies = [];
var mode = "adding"

class Body {
  constructor (x,y,vx,vy,mass,colour,lines) {
    this.x=x
    this.y=y
    this.vx=vx
    this.vy=vy
    this.mass=mass
    this.colour=String(colour)
    this.lines=lines
    if (this.lines == true) {
      this.marks = []
      this.draw = 0
    }
  }
  physics () {
    for (let i of bodies) {
      if (i!=this) {
        let disx = i.x - this.x
        let disy = i.y - this.y
        let norm = sqrt(disy*disy + disx*disx)
        this.vx  += (disx/(norm*norm)*i.mass)/this.mass
        this.vy  += (disy/(norm*norm)*i.mass)/this.mass
      }
    }
  }
  drawSelf () {
    this.x += this.vx
    this.y += this.vy
    fill(this.colour)
    stroke("black")
    strokeWeight(1)
    circle(this.x,this.y,sqrt(this.mass)*10)
    
    if (this.lines == true) {
      this.draw += 1
      if (this.draw==10) {
        this.marks.push({x:this.x,y:this.y})
        this.draw=0
      }
      if (this.marks.length > 1) {
        stroke(this.colour)
        for (let i = 1; i < this.marks.length; i++) {
          line(this.marks[i].x, this.marks[i].y, this.marks[i - 1].x, this.marks[i - 1].y);
        }
      }
    }
  }
}

function addBody() {
  if (mouseButton == LEFT && mode=="adding") {
    bodies.push(new Body(mouseX,mouseY,Number(document.getElementById("grav_velx").value),-1*Number(document.getElementById("grav_vely").value),document.getElementById("grav_mass").value,document.getElementById("grav_colour").value,document.getElementById("grav_lines").checked))
  }
}

function updateSlider(x) {
  if (document.getElementById("grav_velx").value==0) {
    document.getElementById("grav_velx").style.setProperty("--xthumbcolor","grey")
  } else {
    document.getElementById("grav_velx").style.setProperty("--xthumbcolor","green")
  }
  
  if (document.getElementById("grav_vely").value==0) {
    document.getElementById("grav_vely").style.setProperty("--ythumbcolor","grey")
  } else {
    document.getElementById("grav_vely").style.setProperty("--ythumbcolor","green")
  }
}

function start() {
  mode="simulating"
  document.getElementById("grav_start").disabled = true
  document.getElementById("grav_end").disabled = false
}

function end() {
  mode="adding"
  bodies=[]
  document.getElementById("grav_start").disabled = false
  document.getElementById("grav_end").disabled = true
}

function draw() {
  background(255);
  
  if (mode=="adding") {
    for (let i of bodies) {
      fill(i.colour)
      circle(i.x,i.y,sqrt(i.mass)*10)
    }
  }
  
  if (mode=="simulating") {
    for (let j of bodies) {
      j.physics()
    }
    for (let j of bodies) {
      j.drawSelf()
    }
  }
}