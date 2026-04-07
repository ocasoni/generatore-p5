let PERLIN_SCALE = 300;
let TILE_SIZE = 15;
let SPRITE_SIZE = 40;

let CLOUD_SIZE_MULTIPLIER = 3;
let CLOUD_BASE_COUNT_MIN = 8;
let CLOUD_BASE_COUNT_MAX = 14;
let CLOUD_SEGMENT_W = 6;
let CLOUD_SEGMENT_H = 6;
let CLOUD_NOISE_SPATIAL_SCALE = 0.16;
let CLOUD_NOISE_TIME_SPEED = 0.006;
let CLOUD_THRESHOLD_ON = 0.5;
let CLOUD_THRESHOLD_OFF = 0.43;
let CLOUD_MIN_SPACING = 180;
let CLOUD_BASE_W_MIN = 150;
let CLOUD_BASE_W_MAX = 230;
let CLOUD_BASE_H_MIN = 70;
let CLOUD_BASE_H_MAX = 120;

let worldSnapshot;
let clouds = [];

//tiles
let grassImage;
let sandImage;
let waterImage;
let mountainImage;
let snowImage;

//sprites
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
  turtleImage = loadImage("assets/sprites/Turtle.png");
  sunflowerImage = loadImage("assets/sprites/Sunflower.png");
  birdImage = loadImage("assets/sprites/Bird.png");
  treeImage = loadImage("assets/sprites/Tree.png");
  waveImage = loadImage("assets/sprites/Wave.png");
  snowImage = loadImage("assets/tiles/Snow.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  noStroke();

  let centralX = width / 2;
  let centralY = height / 2;

  //sempre la stessa mappa di rumore perlin
  //noiseSeed (1);

  //TILES
  for (let x = 0; x<width; x = x+TILE_SIZE) {
    for (let y = 0; y<height; y = y+TILE_SIZE) {
      
      let altitude = computeAltitude (x, y, centralX, centralY);
      
      // assegnamo il colore 
      let seaLevel = 0.2;
      let weaveLevel = 0.25;
      let beachLevel = 0.33;
      let mountainLevel = 0.5;
      let snowLevel = 0.7;

      //tiles
      let img;
      if (altitude < seaLevel) {
        // mare colorato direttamente in blu invece di usare la tile acqua
        fill(81, 112, 253);
        rect(x, y, TILE_SIZE, TILE_SIZE);
      } else if (altitude < weaveLevel) {
        fill(96, 171, 251);
        rect(x, y, TILE_SIZE, TILE_SIZE);
      }
      else if (altitude < beachLevel) {
        img = sandImage;
      } else if (altitude < mountainLevel) {
        //img = grassImage;
        fill(98, 118, 12);
        rect(x, y, TILE_SIZE, TILE_SIZE);
      } else if (altitude < snowLevel) {
        img = mountainImage;
      }
        else {
          img = snowImage;
        }

      if (img) {
        image (img, x, y, TILE_SIZE, TILE_SIZE);
      }

    }
    }  

  //SPRITES
  for (let x = 0; x<width; x = x+TILE_SIZE) {
    for (let y = 0; y<height; y = y+TILE_SIZE) {
      let altitude = computeAltitude (x, y, centralX, centralY);
      
      // assegnamo il colore 
      let seaLevel = 0.2;
      let beachLevel = 0.28;
      let mountainLevel = 0.5;

      
      //sunflower
      if (random () < 0.01 && altitude > beachLevel && altitude < mountainLevel) {
        image (sunflowerImage, x, y, SPRITE_SIZE, SPRITE_SIZE);
      }

      //turtle
      if (random () < 0.001 && altitude < seaLevel) {
        image (turtleImage, x, y, SPRITE_SIZE, SPRITE_SIZE);
      }

      //bird
      if (random () < 0.003 && altitude > beachLevel) {
        image (birdImage, x, y, SPRITE_SIZE, SPRITE_SIZE);
      }

      //tree
      if (random () < 0.02 && altitude > mountainLevel) {
        image (treeImage, x, y, SPRITE_SIZE, SPRITE_SIZE);
      }

      //wave
      if (random () < 0.001 && altitude < seaLevel) {
        image (waveImage, x, y, SPRITE_SIZE, SPRITE_SIZE);
      }


    }  

  }

  worldSnapshot = get();
  initializeClouds();
}

function draw() {
  image(worldSnapshot, 0, 0);
  drawCloudOverlay();
}

function drawCloudOverlay() {
  noStroke();
  fill(255, 255, 255, 127);

  for (let i = 0; i < clouds.length; i++) {
    let c = clouds[i];

    // attraversamento continuo da sinistra a destra
    c.x += c.speed;
    if (c.x > width + c.w * 0.5) {
      c.x = -c.w * 0.5;
      c.yBase = random(0, height);
    }

    // leggera oscillazione verticale per naturalezza
    let y = c.yBase + sin(frameCount * c.wobbleSpeed + c.seed * 100) * c.wobbleAmp;
    let cx = (c.cols - 1) * 0.30;
    let cy = (c.rows - 1) * 0.59;

    c.noiseTime += CLOUD_NOISE_TIME_SPEED;

    // Perlin 3D nel tempo + isteresi: comparsa/scomparsa graduale senza flicker duro
    for (let gy = 0; gy < c.rows; gy++) {
      for (let gx = 0; gx < c.cols; gx++) {
        // involucro irregolare per evitare nuvole a rettangolo
        let nx = (gx - cx) / max(1, c.cols * 0.5);
        let ny = (gy - cy) / max(1, c.rows * 0.5);
        ny *= 1.15;
        let r = sqrt(nx * nx + ny * ny);

        let edgeNoise = noise(
          (gx + c.shapeOffsetX) * 0.22,
          (gy + c.shapeOffsetY) * 0.22,
          c.shapeSeed
        );
        let localRadius = map(edgeNoise, 0, 1, 0.52, 1.08);
        if (r > localRadius) {
          c.state[gy][gx] = false;
          continue;
        }

        let n = noise(
          (gx + c.noiseOffsetX) * CLOUD_NOISE_SPATIAL_SCALE,
          (gy + c.noiseOffsetY) * CLOUD_NOISE_SPATIAL_SCALE,
          c.noiseTime
        );

        let edgeBoost = map(r, 0, localRadius, -0.05, 0.02);
        let onThreshold = CLOUD_THRESHOLD_ON + edgeBoost;
        let offThreshold = CLOUD_THRESHOLD_OFF + edgeBoost;

        if (c.state[gy][gx]) {
          c.state[gy][gx] = n > offThreshold;
        } else {
          c.state[gy][gx] = n > onThreshold;
        }

        if (c.state[gy][gx]) {
          let rx = c.x - c.w * 0.5 + gx * CLOUD_SEGMENT_W;
          let ry = y - c.h * 0.5 + gy * CLOUD_SEGMENT_H;
          rect(rx, ry, CLOUD_SEGMENT_W, CLOUD_SEGMENT_H);
        }
      }
    }
  }
}

function initializeClouds() {
  clouds = [];
  let countScale = max(0.2, 1 / CLOUD_SIZE_MULTIPLIER);
  let cloudCountMin = max(1, floor(CLOUD_BASE_COUNT_MIN * countScale));
  let cloudCountMax = max(cloudCountMin, floor(CLOUD_BASE_COUNT_MAX * countScale));
  let cloudCount = floor(random(cloudCountMin, cloudCountMax + 1));
  let spacing = CLOUD_MIN_SPACING * sqrt(CLOUD_SIZE_MULTIPLIER);

  for (let i = 0; i < cloudCount; i++) {
    let w = random(CLOUD_BASE_W_MIN, CLOUD_BASE_W_MAX) * CLOUD_SIZE_MULTIPLIER;
    let h = random(CLOUD_BASE_H_MIN, CLOUD_BASE_H_MAX) * CLOUD_SIZE_MULTIPLIER;
    let cols = floor(w / CLOUD_SEGMENT_W);
    let rows = floor(h / CLOUD_SEGMENT_H);
    let seed = random(1000);
    let threshold = random(0.5, 0.6);
    let pos = findSparseCloudPosition(clouds, spacing);

    clouds.push({
      x: pos.x,
      yBase: pos.y,
      w: w,
      h: h,
      cols: cols,
      rows: rows,
      speed: random(0.25, 0.45),
      wobbleAmp: random(6, 16),
      wobbleSpeed: random(0.01, 0.02),
      seed: seed,
      threshold: threshold,
      noiseOffsetX: random(1000),
      noiseOffsetY: random(1000),
      noiseTime: random(1000),
      shapeOffsetX: random(1000),
      shapeOffsetY: random(1000),
      shapeSeed: random(1000),
      state: createCloudState(rows, cols)
    });
  }
}

function findSparseCloudPosition(existingClouds, minSpacing) {
  let minY = 0;
  let maxY = height;
  let bestX = random(0, width);
  let bestY = random(minY, maxY);
  let bestDistance = -1;

  for (let attempt = 0; attempt < 40; attempt++) {
    let candidateX = random(0, width);
    let candidateY = random(minY, maxY);

    let nearest = Infinity;
    for (let i = 0; i < existingClouds.length; i++) {
      let c = existingClouds[i];
      let d = dist(candidateX, candidateY, c.x, c.yBase);
      if (d < nearest) nearest = d;
    }

    if (existingClouds.length === 0 || nearest >= minSpacing) {
      return { x: candidateX, y: candidateY };
    }

    if (nearest > bestDistance) {
      bestDistance = nearest;
      bestX = candidateX;
      bestY = candidateY;
    }
  }

  return { x: bestX, y: bestY };
}

function createCloudState(rows, cols) {
  let state = [];
  for (let gy = 0; gy < rows; gy++) {
    let row = [];
    for (let gx = 0; gx < cols; gx++) {
      row.push(false);
    }
    state.push(row);
  }
  return state;
}

function computeAltitude (x, y, centralX, centralY) {
  //calcolo distanza dal centro
      let distanceFromCenter = dist(x, y, centralX, centralY);
      let normDistanceFromCenter = distanceFromCenter / (width / 2);

      //calcolo altitudine
      let altitude = 1 - normDistanceFromCenter;

      //rumore perlin
      noiseDetail(6); //coste frastagliate
      let perlin = noise (x / PERLIN_SCALE, y / PERLIN_SCALE);
      altitude *= perlin;
      altitude += perlin;
      altitude -= 0.45; //abbassiamo il livello del mare

      return altitude;

}