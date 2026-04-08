let PERLIN_SCALE = 300;
let TILE_SIZE = 15;
let SPRITE_SIZE = 40;

//ONDE
let waveSheet;

let waveCols = 4;
let waveRows = 3;
let waveTotalFrames = 12;

let waveFrameW;
let waveFrameH;

let animatedWaves = [];
let maxAnimatedWaves = 6;

// CLOUDS
let CLOUD_PIXEL = 15;
let CLOUD_COUNT = 9;
let CLOUD_ALPHA = 120;
let CLOUD_SPEED_MIN = 0.2;
let CLOUD_SPEED_MAX = 0.5;
let CLOUD_MIN_W = 14;
let CLOUD_MAX_W = 28;
let CLOUD_MIN_H = 6;
let CLOUD_MAX_H = 12;

let worldSnapshot;
let clouds = [];
let parrots = [];

// PARROT SPRITESHEET
let parrotSheet;
let columns = 3;
let rows = 3;
let parrotFrames = 9;

// dimensione teorica di ogni cella
let frameW, frameH;

// ritaglio interno alla cella per evitare pezzi della riga sopra/sotto
let cropPadTop = 8;
let cropPadBottom = 8;
let cropPadLeft = 0;
let cropPadRight = 0;

// tiles
let grassImage;
let sandImage;
let waterImage;
let mountainImage;
let snowImage;

// sprites
let turtleImage;
let sunflowerImage;
let birdImage;
let treeImage;
let waveImage;

function preload() {
  grassImage = loadImage("assets/tiles/Grass.png");
  sandImage = loadImage("assets/tiles/Sand.png");
  waterImage = loadImage("assets/tiles/Water.png");
  mountainImage = loadImage("assets/tiles/mountain.png");
  snowImage = loadImage("assets/tiles/Snow.png");

  turtleImage = loadImage("assets/sprites/Turtle.png");
  sunflowerImage = loadImage("assets/sprites/Sunflower.png");
  birdImage = loadImage("assets/sprites/Bird.png");
  treeImage = loadImage("assets/sprites/Tree.png");
  waveImage = loadImage("assets/sprites/Wave.png");

  parrotSheet = loadImage("spritesheets/pappagallo.png");
  waveSheet = loadImage("spritesheets/onde.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();

  frameW = parrotSheet.width / columns;
  frameH = parrotSheet.height / rows;

  waveFrameW = waveSheet.width / waveCols;
  waveFrameH = waveSheet.height / waveRows;

  generateWorld();
  initializeClouds();
  createParrots(8);

  for (let i = 0; i < maxAnimatedWaves; i++) {
  spawnWave();
}
}

function draw() {
  image(worldSnapshot, 0, 0);
  drawWaves();
  drawParrots();
  drawClouds();
}

function generateWorld() {
  let centralX = width / 2;
  let centralY = height / 2;

  background(0);

  // TILES
  for (let x = 0; x < width; x += TILE_SIZE) {
    for (let y = 0; y < height; y += TILE_SIZE) {
      let altitude = computeAltitude(x, y, centralX, centralY);

      let seaLevel = 0.2;
      let weaveLevel = 0.25;
      let beachLevel = 0.33;
      let mountainLevel = 0.5;
      let snowLevel = 0.7;

      let img = null;

      if (altitude < seaLevel) {
        fill(81, 112, 253);
        rect(x, y, TILE_SIZE, TILE_SIZE);
      } else if (altitude < weaveLevel) {
        fill(96, 171, 251);
        rect(x, y, TILE_SIZE, TILE_SIZE);
      } else if (altitude < beachLevel) {
        img = sandImage;
      } else if (altitude < mountainLevel) {
        fill(98, 118, 12);
        rect(x, y, TILE_SIZE, TILE_SIZE);
      } else if (altitude < snowLevel) {
        img = mountainImage;
      } else {
        img = snowImage;
      }

      if (img) image(img, x, y, TILE_SIZE, TILE_SIZE);
    }
  }

  // SPRITES STATICHE
  for (let x = 0; x < width; x += TILE_SIZE) {
    for (let y = 0; y < height; y += TILE_SIZE) {
      let altitude = computeAltitude(x, y, centralX, centralY);

      let seaLevel = 0.2;
      let beachLevel = 0.28;
      let mountainLevel = 0.5;

      if (random() < 0.01 && altitude > beachLevel && altitude < mountainLevel) {
        image(sunflowerImage, x, y, SPRITE_SIZE, SPRITE_SIZE);
      }

      if (random() < 0.001 && altitude < seaLevel) {
        image(turtleImage, x, y, SPRITE_SIZE, SPRITE_SIZE);
      }

      //if (random() < 0.003 && altitude > beachLevel) {
        //image(birdImage, x, y, SPRITE_SIZE, SPRITE_SIZE);
      //}

      if (random() < 0.02 && altitude > mountainLevel) {
        image(treeImage, x, y, SPRITE_SIZE, SPRITE_SIZE);
      }

      //if (random() < 0.001 && altitude < seaLevel) {
        //image(waveImage, x, y, SPRITE_SIZE, SPRITE_SIZE);
      //}
    }
  }

  worldSnapshot = get();
}

function initializeClouds() {
  clouds = [];
  for (let i = 0; i < CLOUD_COUNT; i++) {
    clouds.push(createCloud(random(width), random(height * 0.65)));
  }
}

function createCloud(x, y) {
  let cols = floor(random(CLOUD_MIN_W, CLOUD_MAX_W));
  let rows = floor(random(CLOUD_MIN_H, CLOUD_MAX_H));
  let pixels = [];

  let cx = cols / 2;
  let cy = rows / 2;
  let rx = cols * random(0.35, 0.5);
  let ry = rows * random(0.35, 0.5);

  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      let nx = (gx - cx) / rx;
      let ny = (gy - cy) / ry;

      let insideMain = nx * nx + ny * ny < 1;
      let insideBump1 =
        sq((gx - cols * 0.28) / (cols * 0.22)) +
        sq((gy - rows * 0.42) / (rows * 0.28)) < 1;
      let insideBump2 =
        sq((gx - cols * 0.7) / (cols * 0.22)) +
        sq((gy - rows * 0.38) / (rows * 0.26)) < 1;

      let insideShape = insideMain || insideBump1 || insideBump2;
      if (!insideShape) continue;

      let edgeDist = nx * nx + ny * ny;
      let chance = edgeDist < 0.55 ? 0.92 : 0.55;

      if (random() < chance) {
        pixels.push({
          x: gx * CLOUD_PIXEL,
          y: gy * CLOUD_PIXEL,
          a: random(CLOUD_ALPHA * 0.7, CLOUD_ALPHA)
        });
      }
    }
  }

  return {
    x: x,
    y: y,
    w: cols * CLOUD_PIXEL,
    h: rows * CLOUD_PIXEL,
    speed: random(CLOUD_SPEED_MIN, CLOUD_SPEED_MAX),
    pixels: pixels
  };
}

function drawClouds() {
  noStroke();

  for (let c of clouds) {
    c.x += c.speed;

    if (c.x > width + c.w) {
      let newCloud = createCloud(-random(80, 220), random(height * 0.65));
      c.x = newCloud.x;
      c.y = newCloud.y;
      c.w = newCloud.w;
      c.h = newCloud.h;
      c.speed = newCloud.speed;
      c.pixels = newCloud.pixels;
    }

    for (let p of c.pixels) {
      fill(255, 255, 255, p.a);
      rect(c.x + p.x, c.y + p.y, CLOUD_PIXEL, CLOUD_PIXEL);
    }
  }
}

function isParrotZone(x, y) {
  let altitude = computeAltitude(x, y, width / 2, height / 2);
  return altitude > 0.33 && altitude < 0.7;
}

function randomParrotPosition() {
  for (let i = 0; i < 500; i++) {
    let x = random(width);
    let y = random(height);
    if (isParrotZone(x, y)) return { x, y };
  }

  return { x: width / 2, y: height / 2 };
}

function createParrots(num) {
  parrots = [];

  for (let i = 0; i < num; i++) {
    let pos = randomParrotPosition();

    parrots.push({
      x: pos.x,
      y: pos.y,
      baseY: pos.y,
      frame: floor(random(parrotFrames)),
      speed: random(0.5, 1.2),
      dir: random() < 0.5 ? 1 : -1,
      amp: random(8, 20),
      freq: random(0.02, 0.05),
      phase: random(TWO_PI)
    });
  }
}

function respawnParrot(p) {
  let pos = randomParrotPosition();

  p.x = pos.x;
  p.y = pos.y;
  p.baseY = pos.y;
  p.frame = floor(random(parrotFrames));
  p.speed = random(0.5, 1.2);
  p.dir = random() < 0.5 ? 1 : -1;
  p.amp = random(8, 20);
  p.freq = random(0.02, 0.05);
  p.phase = random(TWO_PI);
}

function drawParrots() {
  for (let p of parrots) {
    let nextX = p.x + p.speed * p.dir;
    let nextY = p.baseY + sin(frameCount * p.freq + p.phase) * p.amp;

    if (!isParrotZone(constrain(nextX, 0, width - 1), constrain(nextY, 0, height - 1))) {
      p.dir *= -1;
      nextX = p.x + p.speed * p.dir;
    }

    p.x = nextX;
    p.y = p.baseY + sin(frameCount * p.freq + p.phase) * p.amp;

    if (!isParrotZone(constrain(p.x, 0, width - 1), constrain(p.y, 0, height - 1))) {
      respawnParrot(p);
      continue;
    }

    if (frameCount % 6 === 0) {
      p.frame = (p.frame + 1) % parrotFrames;
    }

    if (p.x > width + 80 || p.x < -80) {
      respawnParrot(p);
      continue;
    }

    let col = p.frame % columns;
    let row = floor(p.frame / columns);

    let sx = col * frameW + cropPadLeft;
    let sy = row * frameH + cropPadTop;
    let sw = frameW - cropPadLeft - cropPadRight;
    let sh = frameH - cropPadTop - cropPadBottom;

    push();
    translate(p.x + 30, p.y + 30);
    scale(p.dir, 1);

    image(
      parrotSheet,
      -30, -30,
      60, 60,
      sx, sy,
      sw, sh
    );

    pop();
  }
}

function isSea(x, y) {
  let altitude = computeAltitude(x, y, width / 2, height / 2);
  return altitude < 0.2;
}

function randomSeaPosition() {
  for (let i = 0; i < 500; i++) {
    let x = random(width);
    let y = random(height);
    if (isSea(x, y)) return { x, y };
  }

  return { x: 0, y: height / 2 };
}

function spawnWave() {
  let pos = randomSeaPosition();

  animatedWaves.push({
    x: pos.x,
    y: pos.y,
    frame: 0,
    speed: random(0.3, 0.8),
    alive: true
  });
}

function drawWaves() {
  for (let i = animatedWaves.length - 1; i >= 0; i--) {
    let w = animatedWaves[i];

    // movimento verso destra
    w.x += w.speed;

    // avanzamento frame
    if (frameCount % 8 === 0) {
      w.frame++;
    }

    // se finisce animazione → sparisce
    if (w.frame >= waveTotalFrames) {
      animatedWaves.splice(i, 1);
      continue;
    }

    // calcolo frame da spritesheet
    let col = w.frame % waveCols;
    let row = floor(w.frame / waveCols);

    let sx = col * waveFrameW;
    let sy = row * waveFrameH;

    image(
      waveSheet,
      w.x, w.y,
      80, 80,
      sx, sy,
      waveFrameW, waveFrameH
    );
  }

  // respawn random (non tutte insieme)
  if (random() < 0.05 && animatedWaves.length < maxAnimatedWaves) {
    spawnWave();
  }
}


function computeAltitude(x, y, centralX, centralY) {
  let distanceFromCenter = dist(x, y, centralX, centralY);
  let normDistanceFromCenter = distanceFromCenter / (width / 2);

  let altitude = 1 - normDistanceFromCenter;

  noiseDetail(6);
  let perlin = noise(x / PERLIN_SCALE, y / PERLIN_SCALE);

  altitude *= perlin;
  altitude += perlin;
  altitude -= 0.45;

  return altitude;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  generateWorld();
  initializeClouds();
  createParrots(8);
}