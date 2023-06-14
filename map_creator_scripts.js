let cnv;
function setup() {
  cnv = createCanvas(600, 600);
  cnv.mousePressed(mousePressedOnCanvas)
  cnv.parent("map_sketch_holder")
  for (let element of document.getElementsByClassName("p5Canvas")) {
    element.addEventListener("contextmenu", (e) => e.preventDefault());
    element.addEventListener("wheel", (e) => e.preventDefault())
  }
  cnv.mouseWheel(canvasZoom)
}

var x = 0 // x value of the where the mouse clicked, stored as the grid location
var y = 0 // y value of the where the mouse clicked, stored as the grid location
var isMousePressed = false
var rightMousePressed = false
var outputText = ""
var currentRoom = 0
var grid = 10 // resolution of pixel grid
var mouseHasMoved = [true,0,0] // [has the mouse moved?,mouse clicked x, mouse clicked y]
var selected = -1 // index of selected box, -1 means none selected
var mode = "wall"
var zoomAmount = 1


boxes = [[]] // 2d list of boxes, first list is each room, second is each box
exits = [[]] // 2d list of exits, first list is each room, second is each exit
sizes = [700,700]


const cam = {
  x: 0,
  y: 0,
  logic: function() {
    if (rightMousePressed) {
      this.x +=  (pmouseX/zoomAmount - mouseX/zoomAmount)
      this.y += (pmouseY/zoomAmount - mouseY/zoomAmount)
    }
    if (this.x>sizes[currentRoom*2]-600/zoomAmount) {this.x=sizes[currentRoom*2]-600/zoomAmount}
    if (this.x<0) {this.x=0}
    if (this.y>sizes[currentRoom*2+1]-600/zoomAmount) {this.y=sizes[currentRoom*2+1]-600/zoomAmount}
    if (this.y<0) {this.y=0}
  }
}


class box { // object for boxes
  constructor (x1,y1,x2,y2) {
    let a = unpixelate(x1,y1,x2,y2)
    this.x = a[0]
    this.y = a[1]
    this.w = a[2]
    this.h = a[3]
    this.text = ""
  }
}

class exit {
  constructor (x1,y1,x2,y2) {
    let a = unpixelate(x1,y1,x2,y2)
    this.x = a[0]
    this.y = a[1]
    this.w = a[2]
    this.h = a[3]
    this.dest = 0
    this.destx = 0
    this.desty = 0
  }
}


function unpixelate (x1,y1,x2,y2) { // takes grid locations as input and outputs actual locations in x y width and height
  let x
  let y
  let h
  let w
  if (x2<x1||y2<y1) { // this checks that the x1 and y1 are smaller than x2 and y2, and if not, it corrects for it
    if (y2>=y1) { // these take the grid location and converts it to actual values for x y width and height
      y = y1*grid
      h = y2*grid - y1*grid + grid
      x = x2*grid
      w = x1*grid - x2*grid + grid
    } else if (x2>=x1) {
      x = x1*grid
      w = x2*grid - x1*grid + grid
      y = y2*grid
      h = y1*grid - y2*grid + grid
    } else {
      x = x2*grid
      w = x1*grid - x2*grid + grid
      y = y2*grid
      h = y1*grid - y2*grid + grid
    }
  } else {
    x = x1*grid
    y = y1*grid
    w = x2*grid - x1*grid + grid
    h = y2*grid - y1*grid + grid
  }
  return [x,y,w,h]
}

function updateSelected (a) { // function to update the info for selected box
  let selBox
  if (mode == "wall") {selBox = boxes[currentRoom][selected]}
  else if (mode=="exit") {selBox = exits[currentRoom][selected]}
  
  if (a === undefined) { // if there is no argument then change the values to match the actual state
    if (mode=="wall") {
      document.getElementById("details").innerHTML = `X: ${selBox.x}<br>Y: ${selBox.y}<br>Width: ${selBox.w}<br>Height: ${selBox.h}`
      document.getElementById("textInput").value = selBox.text
    }
    else if (mode=="exit") {
      document.getElementById("details").innerHTML = `X: ${selBox.x}<br>Y: ${selBox.y}<br>Width: ${selBox.w}<br>Height: ${selBox.h}`
      document.getElementById("dest").value = selBox.dest
      document.getElementById("destx").value = selBox.destx
      document.getElementById("desty").value = selBox.desty
    }
  } else { // if there is any argument then disable all tools for the selected box
    document.getElementById("details").innerHTML = `X: N/A<br>Y: N/A<br>Width: N/A<br>Height: N/A`
    selected = -1
    for (let i of document.querySelectorAll(".wallStuff,.exitStuff")) {
      i.disabled = true
    }
    for (let i of document.getElementsByClassName("inputs")) {
      i.value = ""
    }
  }
}

function mousePressedOnCanvas() { // custom function for mouse pressed so that it doesnt register mouse clicks outside of canvas
  if (mouseButton == LEFT) { // drawing objects
    x = floor((mouseX+cam.x*zoomAmount)/grid/zoomAmount) // storing the x and y as grid locations
    y = floor((mouseY+cam.y*zoomAmount)/grid/zoomAmount) // store the x and y as actual location when fist clicked
    mouseHasMoved = [false,mouseX,mouseY]
    isMousePressed = true
    updateSelected(1) // disable all selected tools
  }
  if (mouseButton == RIGHT) { // moving camera
    rightMousePressed = true
  }
}

function mouseReleased () { // function when mouse is released
  if (mouseButton == LEFT && isMousePressed == true) {
    
    if (mouseHasMoved[0] == true) { // only add the new box if the mouse moved. this is to check if the user is adding a new box or selecting an existing box
      if (mode=="wall") {
        boxes[currentRoom].push(new box(x,y,floor((mouseX+cam.x*zoomAmount)/grid/zoomAmount),floor((mouseY+cam.y*zoomAmount)/grid/zoomAmount))) // adding the box to the list
      } else if (mode=="exit") {
        exits[currentRoom].push(new exit(x,y,floor((mouseX+cam.x*zoomAmount)/grid/zoomAmount),floor((mouseY+cam.y*zoomAmount)/grid/zoomAmount)))
      }
    } else {
      
      if (mode=="wall") {
        for (let i of boxes[currentRoom]) { // going through each box and checking if the mouse has clicked on it
          if (mouseX/zoomAmount+cam.x>i.x&&mouseX/zoomAmount+cam.x<i.x+i.w&&mouseY/zoomAmount+cam.y>i.y&&mouseY/zoomAmount+cam.y<i.y+i.h) { // change currently selected and enable selected tools if mouse clicks on a box
            selected = boxes[currentRoom].indexOf(i)
            for (let i of document.getElementsByClassName("wallStuff")) {
              i.disabled = false
            }
            updateSelected()
          }
        }
      } else if (mode=="exit") {
        for (let i of exits[currentRoom]) {
          if (mouseX/zoomAmount+cam.x>i.x&&mouseX/zoomAmount+cam.x<i.x+i.w&&mouseY/zoomAmount+cam.y>i.y&&mouseY/zoomAmount+cam.y<i.y+i.h) {
            selected = exits[currentRoom].indexOf(i)
            for (let i of document.getElementsByClassName("exitStuff")) {
              i.disabled = false
            }
            updateSelected()
          }
        }
      }
      
      
    }
    
  }
  isMousePressed = false
  rightMousePressed = false
}

function canvasZoom(event) {
  let zoom = event.deltaY/100
  if (Math.round(zoom)==-1) {
    zoomAmount *= 1.2
    cam.x+=600/zoomAmount/10
    cam.y+=600/zoomAmount/10
  }
  if (Math.round(zoom)==1) {
    cam.x-=600/zoomAmount/10
    cam.y-=600/zoomAmount/10
    zoomAmount /= 1.2
  }
}

function output () { // function for outputting text
  outputText = ""
  
  for (let room of boxes){ // formatting the values so that it outputs correctly
    outputText += `rooms.push(new Room(${sizes[boxes.indexOf(room)*2]},${sizes[boxes.indexOf(room)*2+1]},[`
    
    for (let i of room) {
      if (i.text=="") {outputText+="new Wall("}
      else {outputText+="new InteractWall("}
      outputText += `${i.x},${i.y},${i.w},${i.h}`
      if (i.text!="") {outputText+=`,["${i.text}"],true`}
      outputText += ")"
      if (room.indexOf(i) == room.length-1) {
        outputText += ""
      } else {
        outputText += ","
      }
    }
    
    outputText += "],[],["
    
    for (let i of exits[boxes.indexOf(room)]) {
      outputText += `[${i.x},${i.y},${i.w},${i.h},${i.dest},${i.destx},${i.desty}]`
      if (exits[boxes.indexOf(room)].indexOf(i) == exits[boxes.indexOf(room)].length-1) {
        outputText+=""
      } else {
        outputText+=","
      }
    }
    outputText += "]))\n"
  }

  document.getElementById("map_output").innerHTML = outputText // updating the output
}

function selectText () { // function for selecting text in the output
  document.getElementById("map_output").select()
}

function changeMode () {
  if (document.getElementById("mode").value != mode) {
    mode = document.getElementById("mode").value
    updateSelected(1)
  }
}

function moveBox (direction,amount) { // function for moving selected box
  if (mode=="wall"){
    if (direction=="y") {
      boxes[currentRoom][selected].y += amount*grid
    } else if (direction=="x") {
      boxes[currentRoom][selected].x += amount*grid
    }
    updateSelected()
  } else if (mode=="exit") {
    if (direction=="y") {
      exits[currentRoom][selected].y += amount*grid
    } else if (direction=="x") {
      exits[currentRoom][selected].x += amount*grid
    }
    updateSelected()
  }
}

function addText () { // function for adding text to the selected box
  boxes[currentRoom][selected].text = document.getElementById("textInput").value
}

function changeDest () {
  exits[currentRoom][selected].dest = int(document.getElementById("dest").value)
  exits[currentRoom][selected].destx = int(document.getElementById("destx").value)
  exits[currentRoom][selected].desty = int(document.getElementById("desty").value)
}

function deleteSelected () { // function for deleting the selected box
  if (mode=="wall") {boxes[currentRoom].splice(selected,1)}
  else if (mode=="exit") {exits[currentRoom].splice(selected,1)}
  updateSelected(1)
}

function clearMap () { // function for clearing the entire map
  outputText = ""
  currentRoom = 0
  boxes = [[]]
  exits = [[]]
  sizes = [700,700]
  cam.x = 0
  cam.y = 0
  document.getElementById("sizex").value = 0
  document.getElementById("sizey").value = 0
  document.getElementById("size-display").innerHTML = `X: 700&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Y: 700`
  document.getElementById("map_output").innerHTML = ""
  document.getElementById("roomText").innerHTML = `Current Room: ${currentRoom}`
  updateSelected(1)
}

function clearRoom () { // function for clearing the current room
  boxes[currentRoom] = []
  exits[currentRoom] = []
  cam.x = 0
  cam.y = 0
  sizes[currentRoom*2] = 700
  sizes[currentRoom*2+1] = 700
  document.getElementById("sizex").value = 0
  document.getElementById("sizey").value = 0
  document.getElementById("size-display").innerHTML = `X: 700&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Y: 700`
  updateSelected(1)
}

function changeRoom (x) { // function for changing the room you are editing
  currentRoom += x
  if (currentRoom < 0) {currentRoom = 0} // making sure you cant go lower than room 0
  if (currentRoom>=boxes.length) {boxes.push([]); exits.push([]); sizes.push(700);sizes.push(700)} // adding a new room if there are not enough
  document.getElementById("roomText").innerHTML = `Current Room: ${currentRoom}`
  document.getElementById("sizex").value = (sizes[currentRoom*2]-700) / 10
  document.getElementById("sizey").value = (sizes[currentRoom*2+1]-700) / 10
  document.getElementById("size-display").innerHTML = `X: ${sizes[currentRoom*2]}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Y: ${sizes[currentRoom*2+1]}`
  
  if (selected!=-1) {
    updateSelected(1)
  }
}

function changeSize () {
  sizes[currentRoom*2] = document.getElementById("sizex").value * 10 + 700
  sizes[currentRoom*2+1] = document.getElementById("sizey").value * 10 + 700
  document.getElementById("size-display").innerHTML = `X: ${sizes[currentRoom*2]}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Y: ${sizes[currentRoom*2+1]}`
}

function draw() {
  background(255)
  
  stroke(20)
  
  scale(zoomAmount)
  cam.logic()
  
  fill("rgba(0,0,0,0)")
  strokeWeight(5)
  rect(2-cam.x,2-cam.y,sizes[currentRoom*2]-4,sizes[currentRoom*2+1]-4) // rectangle showing the borders of the room
  fill(220)
  strokeWeight(1)
  
  for (let i of boxes[currentRoom]) { // drawing the boxes
    rect(i.x-cam.x,i.y-cam.y,i.w,i.h)
  }
  fill("red")
  for (let i of exits[currentRoom]) {
    rect(i.x-cam.x,i.y-cam.y,i.w,i.h)
  }
  
  if (mode=="wall") {fill(220)}
  if (mouseHasMoved[0]==true) { // drawing the box currently being created if the mouse has moved
    if (isMousePressed) {
      let a = unpixelate(x,y,floor((mouseX+cam.x*zoomAmount)/grid/zoomAmount),floor((mouseY+cam.y*zoomAmount)/grid/zoomAmount))
      a[0] -= cam.x
      a[1] -= cam.y
      rect(a[0],a[1],a[2],a[3])
    }
  } else { // not drawing the box until the mouse moves from its original position
    if (mouseX!=mouseHasMoved[1] || mouseY!=mouseHasMoved[2]) {
      mouseHasMoved[0] = true
    }
  }
  
  if (selected != -1) { // highlighting the currently selected box
    noFill()
    stroke("rgba(0,0,255,0.5)")
    strokeWeight(3)
    if (mode=="wall") {
      rect(boxes[currentRoom][selected].x-2-cam.x,boxes[currentRoom][selected].y-2-cam.y,boxes[currentRoom][selected].w+4,boxes[currentRoom][selected].h+4)
    } else if (mode=="exit") {
      rect(exits[currentRoom][selected].x-2-cam.x,exits[currentRoom][selected].y-2-cam.y,exits[currentRoom][selected].w+4,exits[currentRoom][selected].h+4)
    }
  }
}