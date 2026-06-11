// ============================================================
// Week 3 : Full Fighting Game
// ============================================================


const STATE_START = "start";
const STATE_FIGHT = "fight";
const STATE_WIN   = "win";

let gameState = STATE_START;
let winner = null; 
let bgImage;


let punchSounds = [];
let winSound;
let bgMusic;


class Fighter {
 
  constructor(x, y, colour, controls, label) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.speed = 0.5;
    this.maxSpeed = 4;
    this.friction = 0.78;
    this.r = 28;

    this.colour = colour;
    this.label = label; 
    this.blobT = random(100);

    this.controls = controls;

    this.maxHealth = 3;
    this.health = 3;

    this.isAttacking = false;
    this.attackTimer = 0;
    this.attackDuration = 18;  
    this.attackCooldown = 0;  
    this.punchReach = 55;    
    this.punchDir = 1;        

    this.isBlocking = false;

    this.hitFlash = 0;

    this.hitLanded = false;
  }

  
  update() {
    if (gameState !== STATE_FIGHT) return;

    this.handleInput();
    this.applyPhysics();

    if (this.isAttacking) {
      this.attackTimer--;
      if (this.attackTimer <= 0) {
        this.isAttacking = false;
        this.hitLanded = false;
        this.attackCooldown = 20; 
      }
    }

    if (this.attackCooldown > 0) this.attackCooldown--;

    if (this.hitFlash > 0) this.hitFlash--;
  }

 
  handleInput() {
    if (keyIsDown(this.controls.left))  this.vx -= this.speed;
    if (keyIsDown(this.controls.right)) this.vx += this.speed;

    this.vx = constrain(this.vx, -this.maxSpeed, this.maxSpeed);

    if (!keyIsDown(this.controls.left) && !keyIsDown(this.controls.right)) {
      this.vx *= this.friction;
    }

    this.isBlocking = keyIsDown(this.controls.block);
  }

  
  applyPhysics() {
    this.x += this.vx;
    this.x = constrain(this.x, this.r, width - this.r);
  }

 
  startAttack(targetX) {
    if (this.isAttacking || this.attackCooldown > 0) return;

    this.isAttacking = true;
    this.attackTimer = this.attackDuration;
    this.hitLanded = false;

    this.punchDir = targetX > this.x ? 1 : -1;

    let randomPunch = punchSounds[floor(random(punchSounds.length))];
   
randomPunch.setVolume(0.3);
randomPunch.rate(random(0.9, 1.3));
randomPunch.play();

  }

  
  getPunchX() {
    return this.x + this.punchDir * this.punchReach;
  }

  
  takeHit() {
    if (this.isBlocking) return; 
    this.health--;
    this.hitFlash = 12; 

    if (this.health <= 0) {
      this.health = 0;
      endGame(this.label === "P1" ? "P2" : "P1");
    }
  }

  
  draw() {
    push();

    if (this.isBlocking) {
      noFill();
      stroke(255, 255, 255, 150);
      strokeWeight(3);
      ellipse(this.x, this.y, (this.r + 16) * 2, (this.r + 16) * 2);
    }

    if (this.isAttacking) {
      fill(this.hitFlash > 0 ? color(255) : this.colour);
      noStroke();
      ellipse(this.getPunchX(), this.y, 20, 20);
    }

    fill(this.hitFlash > 0 ? color(255) : this.colour);
    noStroke();

    beginShape();
    let numPoints = 48;
    for (let i = 0; i < numPoints; i++) {
      let angle = (TWO_PI / numPoints) * i;
      let noiseVal = noise(
        cos(angle) * 0.8 + this.blobT,
        sin(angle) * 0.8 + this.blobT,
      );
      let r = this.r + map(noiseVal, 0, 1, -7, 7);
      vertex(this.x + cos(angle) * r, this.y + sin(angle) * r);
    }
    endShape(CLOSE);

    fill(10);
    ellipse(this.x - 9, this.y - 7, 8, 8);
    ellipse(this.x + 9, this.y - 7, 8, 8);

    pop();

    this.blobT += 0.015;
  }
}


let fighter1, fighter2;
let groundY;


function preload() {
 
  for (let i = 1; i <= 4; i++) {
    punchSounds.push(loadSound("assets/sounds/punch_" + i + ".wav"));
  }
  winSound = loadSound("assets/sounds/win.wav");
  bgMusic  = loadSound("assets/sounds/background.mp3");
  bgImage = loadImage("assets/images/background.png");
}


function setup() {
  createCanvas(800, 450);
  groundY = height - 80;
  setupFighters();
}


function setupFighters() {
  fighter1 = new Fighter(
    200,
    groundY - 28,
    color(160, 140, 255), // teal
    { left: 65, right: 68, attack: 70, block: 71 }, // A D F G
    "P1",
  );

  fighter2 = new Fighter(
    600,
    groundY - 28,
   color(255, 190, 140), // orange
    { left: LEFT_ARROW, right: RIGHT_ARROW, attack: 75, block: 76 }, // Arrows K L
    "P2",
  );
}


function draw() {

image(bgImage, 0, 0, width, height);

  if (gameState === STATE_START) {
    drawStartScreen();
  } else if (gameState === STATE_FIGHT) {
    drawArena();
    updateAndDrawFighters();
    checkHits();
    drawHealthBars();
    drawFightHUD();
  } else if (gameState === STATE_WIN) {
    drawArena();
    fighter1.draw();
    fighter2.draw();
    drawWinScreen();
  }
}


function startGame() {
  gameState = STATE_FIGHT;
  winner = null;
  setupFighters();
 
bgMusic.setVolume(0);   
bgMusic.loop();        
bgMusic.fade(0.25, 3);  
}


function endGame(winnerLabel) {
  gameState = STATE_WIN;
  winner = winnerLabel;
 
bgMusic.fade(0, 2); 

setTimeout(() => {
  winSound.setVolume(0.5);
  winSound.play();
}, 2000);

}


function drawStartScreen() {

drawingContext.shadowBlur = 20;
drawingContext.shadowColor = "rgba(255, 200, 255, 0.5)";

  fill(255);
  textAlign(CENTER);
  textSize(52);
  text(" DREAM DUEL", width / 2, height / 2 - 60);
  textFont("Georgia");
  fill(255, 230, 255);
  drawingContext.shadowBlur = 0;

  drawingContext.shadowBlur = 20;
drawingContext.shadowColor = "rgba(255, 200, 255, 0.5)";
  fill(255);
  textSize(18);
  text("two dreamers meet beneath the same sky", width / 2, height / 2 - 20);
  textFont("Georgia");
  fill(220, 200, 255);
    drawingContext.shadowBlur = 0;

  textSize(14);
  fill(160, 140, 255);
  text("P1: A/D move   F attack   G block", width / 2, height / 2 + 30);
  fill(255, 190, 140);
  text("P2: Arrows move   K attack   L block", width / 2, height / 2 + 55);
textFont("Georgia");
  fill(255);
  textSize(16);
  text("Press ENTER to begin the story", width / 2, height / 2 + 110);
  textFont("Georgia");
}


function drawWinScreen() {
 fill(30, 10, 60, 180);
  rect(0, 0, width, height);

fill(winner === "P1" ? color(160, 140, 255) : color(255, 190, 140));
  textAlign(CENTER);
  textSize(56);
  text(winner + " WINS!", width / 2, height / 2 - 30);

  fill(255);
  textSize(18);
  text("Press ENTER to dream again", width / 2, height / 2 + 40);
}


function drawArena() {
  fill(80, 60, 120)
  noStroke();
  rect(0, groundY, width, height - groundY);

  stroke(80);
  strokeWeight(1);
  line(0, groundY, width, groundY);
}


function updateAndDrawFighters() {
  fighter1.update();
  fighter2.update();
  fighter1.draw();
  fighter2.draw();
}


function checkHits() {
  if (fighter1.isAttacking && !fighter1.hitLanded) {
    let fistX = fighter1.getPunchX();
    let dist = abs(fistX - fighter2.x);
    if (dist < fighter2.r + 10) {
      fighter2.takeHit();
      fighter1.hitLanded = true;
    }
  }

  if (fighter2.isAttacking && !fighter2.hitLanded) {
    let fistX = fighter2.getPunchX();
    let dist = abs(fistX - fighter1.x);
    if (dist < fighter1.r + 10) {
      fighter1.takeHit();
      fighter2.hitLanded = true;
    }
  }
}


function drawHealthBars() {
  let barW    = 200;
  let barH    = 18;
  let barY    = 45;
  let padding = 30;

  let p1W = map(fighter1.health, 0, fighter1.maxHealth, 0, barW);
  
fill(80, 60, 120);

  rect(padding, barY, barW, barH, 4);
  fill(160, 140, 255);
  rect(padding, barY, p1W, barH, 4);

  let p2W = map(fighter2.health, 0, fighter2.maxHealth, 0, barW);
 
fill(80, 60, 120);

  rect(width - padding - barW, barY, barW, barH, 4);
  fill(255, 190, 140);
  rect(width - padding - p2W, barY, p2W, barH, 4);

  fill(255);
  textSize(13);
  noStroke();
  textAlign(LEFT);
  text("P1", padding, barY - 5);
  textAlign(RIGHT);
  text("P2", width - padding, barY - 5);
}


function drawFightHUD() {
  noStroke();
  fill(120);
  textSize(12);
  textAlign(LEFT);
  text("A/D move   F attack   G block", 16, height - 12);
  textAlign(RIGHT);
  text("Arrows move   K attack   L block", width - 16, height - 12);
}


function keyPressed() {
  if (keyCode === ENTER) {
    if (gameState === STATE_START || gameState === STATE_WIN) {
      startGame();
    }
  }

  if (keyCode === 70 && gameState === STATE_FIGHT) {
    fighter1.startAttack(fighter2.x);
  }

  if (keyCode === 75 && gameState === STATE_FIGHT) {
    fighter2.startAttack(fighter1.x);
  }
}
