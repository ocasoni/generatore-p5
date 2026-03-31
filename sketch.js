let PERLIN_SCALE = 50;

function setup() {
  createCanvas(200, 200);

  background(0);
  noStroke();

  let centralX = width / 2;
  let centralY = height / 2;

  //sempre la stessa mappa di rumore perlin
  //noiseSeed (1);


  for (let x = 0; x<width; x++) {
    for (let y = 0; y<height; y++) {
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
      
      // assegnamo il colore 
      let seaLevel = 0.2;
      let beachLevel = 0.25;
      if (altitude < seaLevel) {
        fill (0, 0, 255);
      } else if (altitude < beachLevel) {
        fill (255, 255, 0);
      } else {
        fill (0, 255, 0);
      }
      
      
      rect(x, y, 1, 1);
    }  

  }
}