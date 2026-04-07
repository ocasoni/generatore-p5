let PERLIN_SCALE = 300;
let TILE_SIZE = 15;
let SPRITE_SIZE = 40;

//tiles
let grassImage;
let sandImage;
let waterImage;
let mountainImage;

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
      console.log(x, y);
      
      let altitude = computeAltitude (x, y, centralX, centralY);
      
      // assegnamo il colore 
      let seaLevel = 0.2;
      let weaveLevel = 0.25;
      let beachLevel = 0.28;
      let mountainLevel = 0.5;

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
      } else {
        img = mountainImage;

      }
      if (img) {
        image (img, x, y, TILE_SIZE, TILE_SIZE);
      }

      }
    }  

  //SPRITES
  for (let x = 0; x<width; x = x+TILE_SIZE) {
    for (let y = 0; y<height; y = y+TILE_SIZE) {
      console.log(x, y);
      
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