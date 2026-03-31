let PERLIN_SCALE = 200;
let TILE_SIZE = 5;

let grassImage;
let sandImage;
let waterImage;

function preload() {
  grassImage = loadImage("tiles/Grass.png");
  sandImage = loadImage("tiles/Sand.png");
  waterImage = loadImage("tiles/Water.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  noStroke();

  let centralX = width / 2;
  let centralY = height / 2;

  //sempre la stessa mappa di rumore perlin
  //noiseSeed (1);


  for (let x = 0; x<width; x = x+TILE_SIZE) {
    for (let y = 0; y<height; y = y+TILE_SIZE) {
      console.log(x, y);
      
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
      altitude -= 0.5
      
      // assegnamo il colore 
      let seaLevel = 0.2;
      let beachLevel = 0.28;

      let img;
      if (altitude < seaLevel) {
        img = waterImage;
      } else if (altitude < beachLevel) {
        img = sandImage;
      } else {
        img = grassImage;
      }
      
      
      image (img, x, y, TILE_SIZE, TILE_SIZE);
    }  

  }
}