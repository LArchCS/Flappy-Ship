var speed = 1;
var obstacleSpeed = 3;
var bgSpeed = 0.25;
var gravity = 0.05;
var gravitySpeed = 0;
var frameNo = 0;
var time = 1;
var myObstacles = [];
var key = [];
var myGamePiece;
var myBackground;
var bgMusic;
var lgSound;

function startGame() {
  myGamePiece = new component(50, 10, "./data/spaceShip.png", 0, 0, "image");
  myBackground = new component(656, 270, "./data/space.png", 0, 0, "background");
  bgMusic = new sound("./data/bg.mp3");
  lgSound = new sound("./data/lostgame.mp3");
  bgMusic.play();
  myGameArea.start();
  update = setInterval(updateGameArea, 20);
  setInterval(keyBoardControl(), 20);
}

function updateGameArea() {
  for (var obstacle of myObstacles.slice()) {  // make a copy of array
    if (myGamePiece.crashWith(obstacle)) {
      lostGame();
      return;
    }
  }
  myGameArea.clear();
  frameNo += 1;
  myBackground.x -= bgSpeed;
  myBackground.draw();
  addObstacles();
  moveMyPiece();
  myGamePiece.newPos();
  myGamePiece.draw();
  showScore();
}

// an object for myGameArea
var myGameArea = {
  canvas: document.createElement("canvas"),
  start : function() {
    this.canvas.width = 480;
    this.canvas.height = 270;
    this.context = this.canvas.getContext("2d");
    document.body.insertBefore(this.canvas, document.body.childNodes[0]);
    //document.body.appendChild(this['canvas']);
  },
  clear: function() {  // Frames
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

// constructor for component
function component(width, height, color, x, y, type) {
  this.type = type;
  if (type == "image" || type == "background") {
    this.image = new Image();
    this.image.src = color;
  }
  this.width = width;
  this.height = height;
  this.speedX = 0;
  this.speedY = 0;
  this.x = x;
  this.y = y;
  this.newPos = function() {
    gravitySpeed += gravity;
    this.x += this.speedX;
    this.y += this.speedY + gravitySpeed;
    this.hitBottom();
    this.hitTop();
  }
  this.hitBottom = function() {
    var rockbottom = myGameArea.canvas.height - this.height;
    if (this.y + this.height * 1.5 > rockbottom) {
      this.y = rockbottom - this.height * 1.5;
      gravitySpeed = 0;
    }
  }
  this.hitTop = function() {
    if (this.y <= 0) {
      this.y = 0;
      gravity = 0.05;
    }
  }
  this.draw = function() {
    ctx = myGameArea.context;
    if (type == "image") {
      ctx.drawImage(this.image, this.x, this.y, this.width + 20 , this.height + 20);
    } else if (type == "background") {
      if (this.x <= -(this.width)) {
          this.x = 0;
        }
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
      ctx.drawImage(this.image, this.x + this.width, this.y, this.width, this.height);
    } else {
      ctx.strokeStyle = "white";
      ctx.strokeRect(this.x, this.y, this.width, this.height);
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.fillRect(this.x, this.y, this.width, this.height);
      if (this.x <= 0) {  // delete out of range obstacle
        myObstacles.shift();
      }
    }
  }
  this.crashWith = function(otherobj) {
    var myleft = this.x + this.width*0.4;
    var myright = this.x + this.width;
    var mytop = this.y + this.height;
    var mybottom = this.y + this.height * 2.5;
    var otherleft = otherobj.x;
    var otherright = otherobj.x + otherobj.width;
    var othertop = otherobj.y;
    var otherbottom = otherobj.y + otherobj.height;
    var crash = true;
    if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
      crash = false;
    }
    return crash;
  }
}

function moveMyPiece() {
  var x = false, y = false;
  if (key[37] == true) { // left
    myGamePiece.speedX = -speed;
    key[39] = false;
    x = true;
  }
  if (key[39] == true) { // right
    myGamePiece.speedX = +speed;
    key[37] = false;
    x = true;
  }
  if (key[40] == true) {  // down
    myGamePiece.speedY = +speed/2.0 + gravitySpeed;
    gravity = 0.05;
    gravitySpeed = Math.max(gravitySpeed, 0);
    key[38] = false;
    y = true;
  }
  if (key[38] == true) {  // up
    gravity = -0.1;
    key[40] = false;
    y = true;
  } else {
    gravity = 0.05;
  }
  if (x == false){myGamePiece.speedX = 0 }
  if (y == false){myGamePiece.speedY = 0 }
  if (x || y) {myGamePiece.image.src = "./data/spaceShip_fire.png";}
  else {myGamePiece.image.src = "./data/spaceShip.png";}
}

function keyBoardControl() {
  window.addEventListener('keydown', function (e) {
    key[e.keyCode] = true;
  });
  window.addEventListener('keyup', function (e) {
    key0();
  });
}

function key37() {key[37] = true; }

function key38() {key[38] = true; }

function key39() {key[39] = true; }

function key40() {key[40] = true; }

function key0() {
  for (var i in key) {
    key[i] = false;
  }
}

function lostGame() {
  var canvas = document.body.firstChild;
  var ctx = canvas.getContext("2d");
  ctx.fillStyle = "white";
  ctx.textAlign="center";
  ctx.font = 50 + "px Arial";
  ctx.fillText("Game Over", canvas.width/2, canvas.height/4);
  bgMusic.stop();
  lgSound.play();
  clearInterval(update);
}

function everyinterval(n) {
  return frameNo % n == 0;
}

function addObstacles() {
  var x, height, gap, minHeight, maxHeight, minGap, maxGap;
  var inte = 45 + Math.abs(Math.floor(Math.random() * 20));
  if (frameNo == 1 || everyinterval(inte)) {
    frameNo = 1;
    x = myGameArea.canvas.width;
    minHeight = 20;
    maxHeight = 200;
    height = Math.floor(Math.random()*(maxHeight-minHeight+1)+minHeight);
    minGap = 50;
    maxGap = 200;
    gap = Math.floor(Math.random() * (maxGap - minGap + 1) + minGap);
    myObstacles.push(new component(10, height, "black", x, 0));
    myObstacles.push(new component(10, x - height - gap, "black", x, height + gap));
    console.log(myObstacles.length);
  }
  for (var obstacle of myObstacles.slice()) {  // make a copy of array
    obstacle.x += -obstacleSpeed;
    obstacle.draw();
  }
}

function sound(src) {
  this.sound = document.createElement("audio");
  this.sound.src = src;
  this.sound.setAttribute("preload", "auto");
  this.sound.setAttribute("controls", "none");
  this.sound.style.display = "none";
  document.body.appendChild(this.sound);
  this.play = function(){
    this.sound.play();
  }
  this.stop = function(){
    this.sound.pause();
  }
}

function showScore() {
  time += 1;
  var canvas = document.body.firstChild;
  var ctx = canvas.getContext("2d");
  ctx.fillStyle = "white";
  ctx.textAlign="right";
  ctx.font = 15 + "px Inconsolata";
  ctx.fillText("score " + (Math.round(time/10)), canvas.width*0.98, canvas.height/15);
}
