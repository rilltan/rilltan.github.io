function preload(){
  sans = loadImage("deltarune_assets/sans.png")
  kris = loadImage("deltarune_assets/kris_upscaled.png")
  queen = loadImage("deltarune_assets/queen.png")
  banana = loadImage("deltarune_assets/banana.png")
  explosion = loadImage("deltarune_assets/explosion.png")
  wallTexture = loadImage("deltarune_assets/wall.png")
  textBoxImage = loadImage("deltarune_assets/text_box.png")
  fontMono = loadFont("deltarune_assets/determination_mono.otf")
  speakQueen = loadSound("deltarune_assets/snd_txtq_2.wav")
  speakSans = loadSound("deltarune_assets/snd_txtsans.wav")
  explodeSound = loadSound("deltarune_assets/snd_badexplosion.wav")
  addObjects()
}
  
function setup() {
  cnv = createCanvas(700, 700);
  cnv.parent("delta_sketch_holder")
}

const ANIM = 15;
const KRIS_SPRITE_X = 19
const KRIS_SPRITE_Y = 36;
const KEYS_REF = [83,65,87,68];
const DIRECTIONS = ["down","left","up","right"];
const WALLW = 32
const WALLH = 30

var time = 0; // universal time
var step = 3; // animation speed
var keys = []; // keys being held down
var isTextBox = false; // draw text box true/false
var prevZ = true; // tracks new z presses
var firstDrawn = 0; // when the text box is first drawn
var textToDraw = []; // text to draw in text box
var textSound; // sound to play during text
var textAmount = 0; // amount of text to display
var textPage = 0; // which page of text to draw
var soundsLoaded = false // whether all sounds have loaded yet
var showGraphics = [true,false] // list of which graphics to show
var graphicTimes = [0,0] // what times each graphic first appeared for animation calculations
var rooms = [] // list of rooms
var room = 0 // current room
var fadeAmount = 0 // the current opacity for the fade effect
var fade = false // whether to start fading or not
var focused = false // whether the canvas is focused or not

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

function textBox (z,s) { // function that makes drawing a text box easier
  isTextBox = true
  textSound = s || null
  textToDraw = z
  firstDrawn = millis()
  textPage = 0
}


function preventScrolling(e) { // Function to stop scrolling when the canvas isn't focused
  if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
    e.preventDefault();
  }
}
document.addEventListener("click", function(event) { // Detecting when the canvas is focused
  if (event.target.closest("#delta_sketch_holder")) {
    focused = true
    loop()
    window.addEventListener("keydown", preventScrolling, false)
  }
  else {
    focused = false
    window.removeEventListener("keydown",preventScrolling, false)
  }
})

const Camera = {
  x: 0, // coordinates of camera is top left of the screen
  y: 0,
  logic: function() {
    this.x = Player.x - 331
    this.y = Player.y - 311
    if (this.x < 0) {this.x = 0}
    else if (this.x > rooms[room].width - 700) {this.x = rooms[room].width - 700}
    if (this.y < 0) {this.y = 0}
    else if (this.y > rooms[room].height - 700) {this.y = rooms[room].height - 700}
  }
}

const Player = {
  x: 70,
  y: 70,
  newx: 50, // variables for calculating new position without having to affect the actual position
  newy: 50,
  direction: 0,
  isMoving: false,
  time: 0, // local time for animation
  anim_step: 1, // which of the 4 frames to display
  colliding: false,
  movement: function() {
    for (let l=0;l<3;l++) { // do the movement three times a frame
      this.isMoving = false
      this.colliding = false
      
      if (isTextBox == false && fadeAmount == 0 ) { // only move if there is not a text box
        if (keys.includes(40)){ // changing y position if w or s are held down
          this.newy = this.newy + step/3
          this.direction = 0
          this.isMoving = true
        }
        if (keys.includes(38)){
          this.newy = this.newy - step/3
          this.direction = 2
          this.isMoving = true
        }

        for (let i=0;i<rooms[room].walls.length && this.colliding==false;i++) { // checking if the new position collides with a wall
          if (this.newx + 38 > rooms[room].walls[i].boundaries[0] && this.newx < rooms[room].walls[i].boundaries[1] && this.newy + 74 > rooms[room].walls[i].boundaries[2] && this.newy + 50 < rooms[room].walls[i].boundaries[3]) {
            this.colliding = true
          }
        }
        
        if (this.colliding != true) { // dont update the y value if there is a collision
          this.y = this.newy
        } else {
          this.newy = this.y
        }

        if (keys.includes(37)){ // same as above but for x
          this.newx = this.newx - step/3
          this.direction = 1
          this.isMoving = true
        }

        if (keys.includes(39)){
          this.newx = this.newx + step/3
          this.direction = 3
          this.isMoving = true
        }
        
        this.colliding = false

        for (let i=0;i<rooms[room].walls.length && this.colliding==false;i++) {
          if (this.newx + 38 > rooms[room].walls[i].boundaries[0] && this.newx < rooms[room].walls[i].boundaries[1] && this.newy + 74 > rooms[room].walls[i].boundaries[2] && this.newy + 50 < rooms[room].walls[i].boundaries[3]) {
            this.colliding = true
          }
        }
        
        if (this.colliding != true) {
          this.x = this.newx
        } else {
          this.newx = this.x
        }
      }
    }
  },
  drawSelf: function () {
    if (this.isMoving == true) { // only animate whilst moving
      this.time ++
      if (this.time >= ANIM) {
        this.time = 0
        this.anim_step ++
        if (this.anim_step > 3) {
          this.anim_step = 0
        }
      }
      image(kris,this.x-Camera.x,this.y-Camera.y,38,74,this.anim_step*38,this.direction*74,38,74)
    } else {
      image(kris,this.x-Camera.x,this.y-Camera.y,38,74,0,this.direction*74,38,74)
    }
  }
}

class Room {
  constructor (width,height,walls,stuff,exits) {
    this.width = width
    this.height = height
    this.walls = walls
    this.stuff = stuff
    this.exits = exits
  }
  changeRoom () {
    for (let i of this.exits) {
      if (Player.x + 38 < i[0] || Player.x > i[0]+i[2] || Player.y+74 < i[1] || Player.y > i[1]+i[3]) {
      } else {
        fade = true
        if (fadeAmount > 1) {
          room = i[4]
          Player.x = i[5]
          Player.newx = i[5]
          Player.y = i[6]
          Player.newy = i[6]
        }
      }
    }
  }
}

class Interactable { // class for detecting if the player is within a certain area
  constructor (x,y,width,height,result,sound) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.result = result
    this.interacted = false
    this.sound = sound || null
  }
  drawSelf() {
    if (this.interacted == false) { // only allows the change to happen once
      if (Player.x + 38 < this.x || Player.x > this.x+this.width || Player.y+74 < this.y || Player.y > this.y+this.height) {
      } else { // if player is inside the area
        showGraphics[this.result] = true // changes an item in the list of graphics to display
        graphicTimes[this.result] = time // sets the start time for that graphic
        if (this.sound != null) { // plays a sound, if one is given
          this.sound.play()
        }
        this.interacted = true // stops the area from being interacted with again
      }
    }
  }
}

class Wall { // class for basic walls with collision
  constructor (x,y,width,height) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.drawWidth = width // the width and height for each repeating tile so that it cuts off at the right point
    this.drawHeight = height
    this.boundaries = [x,x+width,y,y+height] // the coordinates of each side so that the calculations are easier
  }
  drawSelf() {
    for (let j=0;j<this.width;j=j+WALLW) { // repeat the wall texture until the end of the area (x axis)
      for (let k=0;k<this.height;k=k+WALLH) { // same for y axis
        if (j+WALLW+1 > this.width) {
          this.drawWidth = WALLW - (j+WALLW - this.width) // if it is at the end of the wall, cut off the end of the texture so that it is the right size
        } else {
          this.drawWidth = WALLW
        }
        
        if (k+WALLH+1 > this.height) {
          this.drawHeight = WALLH - (k+WALLH - this.height) // same for y axis
        } else {
          this.drawHeight = WALLH
        }
        image(wallTexture,this.x+j-Camera.x,this.y+k-Camera.y,this.drawWidth,this.drawHeight,0,0,this.drawWidth,this.drawHeight)
      }
    }
  }
}

class InteractWall extends Wall { // class for interactable walls with collision, including characters
  constructor (x,y,width,height,text,visible,sound) {
    super(x,y,width,height)
    this.text = text // text to display
    this.canInteract = false // changes when the player enters the interactable area
    this.visible = visible // whether to display a texture. false for characters, true for walls
    this.sound = sound || null // what sound to play during the text box
  }
  drawSelf() {
    if (this.visible) { // only draw the texture if needed
      for (let j=0;j<this.width;j=j+WALLW) { // same code as for normal walls
        for (let k=0;k<this.height;k=k+WALLH) {
          if (j+WALLW+1 > this.width) {
            this.drawWidth = WALLW - (j+WALLW - this.width)
          } else {
            this.drawWidth = WALLW
          }

          if (k+WALLH+1 > this.height) {
            this.drawHeight = WALLH - (k+WALLH - this.height)
          } else {
            this.drawHeight = WALLH
          }
          image(wallTexture,this.x+j-Camera.x,this.y+k-Camera.y,this.drawWidth,this.drawHeight,0,0,this.drawWidth,this.drawHeight)
        }
      }
    }
    
    this.canInteract = false
    
    // detecting whether the player is within the interactable area and is facing the right direction
    if (Player.x > this.boundaries[0]-60 && Player.x < this.boundaries[0]-37 && Player.y > this.boundaries[2]-72 && Player.y < this.boundaries[3] && Player.direction == 3) {
      this.canInteract = true
    }
    
    if (Player.x > this.boundaries[0]-38 && Player.x < this.boundaries[1] && Player.y > this.boundaries[3]-72 && Player.y < this.boundaries[3] && Player.direction == 2) {
      this.canInteract = true
    }
    
    if (Player.x > this.boundaries[1]-1 && Player.x < this.boundaries[1]+22 && Player.y > this.boundaries[2]-72 && Player.y < this.boundaries[3] && Player.direction == 1) {
      this.canInteract = true
    }
    
    if (Player.x > this.boundaries[0]-38 && Player.x < this.boundaries[1] && Player.y < this.boundaries[2] && Player.y > this.boundaries[2]-90 && Player.direction == 0) {
      this.canInteract = true
    }
    
    // if the player can interact, then show a text box when z is pressed
    if (this.canInteract && keys.includes(90) && prevZ == false && isTextBox == false) {
      textBox(this.text,this.sound)
    }
  }
}

function drawTextBox () {
  if (isTextBox == true) {
    image(textBoxImage,53,500) // background for text
    textFont(fontMono)
    textSize(30)
    fill("white")
    textAmount = Math.floor((millis()-firstDrawn)/30) // how much of the text to draw
    // play a sound during the text
    if (textSound != null && time%5 == 2 && textAmount<textToDraw[textPage].length) {textSound.play()}
    text(textToDraw[textPage].slice(0,textAmount),90,560,500) // draw the text each frame
    if (keys.includes(90) && prevZ == false && firstDrawn+textToDraw[textPage].length*30<millis()) { // when z is pressed go to next page or stop
      if (textPage < textToDraw.length-1) {
        textPage++
        firstDrawn = millis()
      } else {
        isTextBox = false
      }
    }
  }
}

function addObjects () { // adding all the objects to the scene
  rooms.push(new Room(1000,1000,[ // walls
    new Wall(20,300,200,200),
    new InteractWall(100,100,75,75,["The wall fills you with determination","page 2","page 3"],true),
    new InteractWall(500,200,66,128,["Kris Get The Banana","(It Definitely Won't Explode)"],false,speakQueen),
    new InteractWall(300,100,46,60,["papyrus? he's not here today"],false,speakSans),
    new Wall(900,0,100,450),
    new Wall(900,550,100,450)
  ],[ // stuff
    new Interactable(350,500,52,52,1,explodeSound)
  ],[ // exits: x, y, width, height, room destination, destination x, destination y
    [980,450,50,100,1,30,311]
  ]))
  
  rooms.push(new Room(700,700,[
    new Wall(300,200,200,200),
    new Wall(0,0,100,300),
    new Wall(0,400,100,300)
  ],[],[[0,300,20,100,0,931,461]]))
}

function graphics() { // drawing all graphics
  if (room==0){
    //rect(980-Camera.x,450-Camera.y,50,100) // display for exit
    image(sans,300-Camera.x,100-Camera.y)
    image(queen,500-Camera.x,200-Camera.y)
    if (showGraphics[0] && showGraphics[1]!=true){
      image(banana,350-Camera.x,500-Camera.y,52,52,Math.floor((millis()/125)%8)*54+2,2,52,52)
    }
    if (showGraphics[1] && Math.floor(time-graphicTimes[1])/4 < 19) {
      let frame
      frame = Math.floor((time-graphicTimes[1])/4)
      image(explosion,350-Camera.x,470-Camera.y,71,100,frame*71,0,71,100)
    }
  }
  if (room==1) {
    //rect(0-Camera.x,300-Camera.x,20,100) // display for exit
  }
}

function transition () { // fade effect when moving rooms
  if (fade == true) {
    fadeAmount += 0.05
    if (fadeAmount >= 1.5) {
      fade = false
    }
    fill(0,0,0,fadeAmount)
    rect(-1,-1,702,702)
  }
  else if (fade == false && fadeAmount > 0) {
    fadeAmount -= 0.05
    fill(0,0,0,fadeAmount)
    rect(-1,-1,702,702)
  }
  else {fadeAmount = 0}
}

function draw() { // draw function run every frame
  background(220);
  fill(255);
  colorMode(RGB,255,255,255,1);
  time++
  Player.movement();
  Camera.logic();
  for (let i of rooms[room].walls) {
    i.drawSelf()
  }
  for (let i of rooms[room].stuff) {
    i.drawSelf()
  }
  graphics();
  Player.drawSelf();
  drawTextBox();
  rooms[room].changeRoom();
  transition();
  if (keys.includes(90)) { // changing the variable so that it can detect whether z is newly pressed or just being held down
    prevZ = true
  } else {
    prevZ = false
  }
  if (focused==false) {
    fill("rgba(0,0,0,0.5)")
    rect(0,0,700,700)
    fill("black")
    textSize(30)
    text("Click to play",20,40)
    noLoop()
  }
}