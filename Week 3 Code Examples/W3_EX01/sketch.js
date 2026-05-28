// ============================================================
// Week 3 Example 1: Classes and Fighter Objects
// ============================================================

// ------------------------------------------------------------
// THE FIGHTER CLASS
// A class is a blueprint. It defines what a Fighter has
// (properties) and what a Fighter can do (methods).
// We create actual fighters using: new Fighter(...)
// ------------------------------------------------------------
class Fighter {
  // ----------------------------------------------------------
  // constructor()
  // Runs once when we create a new Fighter with "new Fighter()"
  // All the starting values for this fighter go here.
  // The arguments let us customise each instance differently.
  // ----------------------------------------------------------
  constructor(x, y, colour, controls) {
    // Position
    this.x = x;
    this.y = y;

    // Physics
    this.vx = 0;
    this.speed = 0.5;
    this.maxSpeed = 4;
    this.friction = 0.8;

    // Size
    this.r = 28; // blob radius

    // Appearance
    this.colour = colour; // p5 color object passed in from setup()

    // Controls — each fighter has different keys
    // controls is an object: { left, right, block }
    // Attack is introduced in Example 2
    this.controls = controls;

    // Blob animation — random start so blobs wobble differently
    this.blobT = random(100);

    // State
    this.isBlocking = false;
  }

  // ----------------------------------------------------------
  // update()
  // Called every frame from draw().
  // Handles input and physics for this fighter.
  // "this" refers to whichever fighter instance is calling it.
  // ----------------------------------------------------------
  update() {
    this.handleInput();
    this.applyPhysics();
  }

  // ----------------------------------------------------------
  // handleInput()
  // Reads keyboard state for this fighter's specific keys.
  // keyIsDown() returns true every frame the key is held —
  // this gives smooth continuous movement.
  // ----------------------------------------------------------
  handleInput() {
    // Horizontal movement
    if (keyIsDown(this.controls.left)) {
      this.vx -= this.speed;
    }
    if (keyIsDown(this.controls.right)) {
      this.vx += this.speed;
    }

    // Clamp speed — prevents infinite acceleration
    this.vx = constrain(this.vx, -this.maxSpeed, this.maxSpeed);

    // Friction — gradually slows the fighter when no key is pressed
    if (!keyIsDown(this.controls.left) && !keyIsDown(this.controls.right)) {
      this.vx *= this.friction;
    }

    // Block state — held key toggles blocking on/off each frame
    this.isBlocking = keyIsDown(this.controls.block);
  }

  // ----------------------------------------------------------
  // applyPhysics()
  // Moves the fighter and keeps them inside the canvas.
  // No gravity in this example — fighters stay on the ground.
  // ----------------------------------------------------------
  applyPhysics() {
    this.x += this.vx;

    // Keep inside canvas
    this.x = constrain(this.x, this.r, width - this.r);
  }

  // ----------------------------------------------------------
  // draw()
  // Draws the noise blob and a shield ring when blocking.
  // push() and pop() isolate drawing styles to this method.
  // ----------------------------------------------------------
  draw() {
    push();

    // Draw shield ring when blocking
    if (this.isBlocking) {
      noFill();
      stroke(255, 255, 255, 160);
      strokeWeight(3);
      ellipse(this.x, this.y, (this.r + 16) * 2, (this.r + 16) * 2);
    }

    // Draw noise blob body
    fill(this.colour);
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

    // Eyes
    fill(10);
    ellipse(this.x - 9, this.y - 7, 8, 8);
    ellipse(this.x + 9, this.y - 7, 8, 8);

    pop();

    // Advance blob animation each frame
    this.blobT += 0.015;
  }
}

// ============================================================
// CREATE TWO FIGHTERS
// Both use the Fighter class but with different starting
// positions, colours, and control keys.
//
// Key code reference:
// 65=A, 68=D, 71=G (Player 1)
// LEFT_ARROW=37, RIGHT_ARROW=39, 76=L (Player 2)
// ============================================================
let fighter1;
let fighter2;

let groundY; // y position of the ground

// ============================================================
// setup()
// Runs once at the very start of the sketch.
// Creates the canvas and both fighter instances.
// ============================================================
function setup() {
  createCanvas(800, 450);
  groundY = height - 80;

  // Create Player 1 — teal, left side
  fighter1 = new Fighter(
    200,           // starting x
    groundY - 28,  // starting y (sitting on ground)
    color(0, 200, 180), // teal
    {
      left: 65,   // A
      right: 68,  // D
      block: 71,  // G
    },
  );

  // Create Player 2 — orange, right side
  fighter2 = new Fighter(
    600,
    groundY - 28,
    color(255, 150, 30), // orange
    {
      left: LEFT_ARROW,
      right: RIGHT_ARROW,
      block: 76, // L
    },
  );
}

// ============================================================
// draw()
// Runs repeatedly in a loop after setup() finishes.
// Updates and draws the arena and both fighters each frame.
// ============================================================
function draw() {
  background(10);

  drawArena();

  // Update and draw both fighters.
  // Because both are instances of Fighter, we call the
  // same methods on each — the class handles the rest.
  fighter1.update();
  fighter2.update();

  fighter1.draw();
  fighter2.draw();

  drawHUD();
}

// ------------------------------------------------------------
// drawArena()
// Draws the ground plane and dividing line.
// ------------------------------------------------------------
function drawArena() {
  // Ground
  fill(40);
  noStroke();
  rect(0, groundY, width, height - groundY);

  // Ground line
  stroke(80);
  strokeWeight(1);
  line(0, groundY, width, groundY);
}

// ------------------------------------------------------------
// drawHUD()
// HUD = Heads Up Display.
// Shows each player's controls on screen for reference.
// ------------------------------------------------------------
function drawHUD() {
  noStroke();
  fill(160);
  textSize(12);
  textAlign(LEFT);
  text("P1: A/D move   G block", 16, 24);
  textAlign(RIGHT);
  text("P2: Arrows move   L block", width - 16, 24);
}
