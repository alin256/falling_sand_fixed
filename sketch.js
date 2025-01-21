// Create a 2D array
// Sorry if you are used to matrix math!
// How would you do this with a
// higher order function????

function make2DArray(cols, rows) {
  let arr = new Array(cols);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = new Array(rows);
    // Fill the array with 0s
    for (let j = 0; j < arr[i].length; j++) {
      arr[i][j] = 0;
    }
  }
  return arr;
}

// The grid
let grid;
// How big is each square?
let w = 5;
let cols, rows;
let hueValue = 200;
let dragged = false;
let letItSnow = false;
let counterTextDiv;
let graphicsHeight = 600;
let graphicsWidth = 1000;


// Check if a row is within the bounds
function withinCols(i) {
  return i >= 0 && i <= cols - 1;
}

// Check if a column is within the bounds
function withinRows(j) {
  return j >= 0 && j <= rows - 1;
}

function setup() {
  createCanvas(graphicsWidth, graphicsHeight);
  colorMode(HSB, 360, 255, 255);
  cols = width / w;
  rows = height / w;
  grid = make2DArray(cols, rows);
  
  // Create a DOM element to display text
  counterTextDiv = createDiv('Counter'); // Empty initially
  counterTextDiv.position(10, graphicsHeight); // Position the text below the input field
}

function mouseDragged() {
  dragged = true;
  let mouseCol = floor(mouseX / w);
  let mouseRow = floor(mouseY / w);
  
  // Randomly add an area of sand particles
  let matrix = 5;
  let extent = floor(matrix / 2);
  for (let i = -extent; i <= extent; i++) {
    for (let j = -extent; j <= extent; j++) {
      if (random(1) < 0.75) {
        let col = mouseCol + i;
        let row = mouseRow + j;
        if (withinCols(col) && withinRows(row)) {
          grid[col][row] = hueValue;
        }
      }
    }
  }
  // Change the color of the sand over time
  hueValue += 1;
  if (hueValue > 360) {
    hueValue = 1;
  }
}

function getNextGridCodingTrain(grid){
  // Create a 2D array for the next frame of animation
  let nextGrid = make2DArray(cols, rows);

  // Check every cell
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows ; j++) {
      // What is the state?
      let state = grid[i][j];
      
      // If it's a piece of sand!
      if (state > 0) {
        // What is below?
        let below = grid[i][j + 1];
        
        // Randomly fall left or right
        let dir = 1;
        if (random(1) < 0.5) {
          dir *= -1;
        }
        
        // Check below left or right
        let belowA = -1;
        let belowB = -1;
        if (withinCols(i + dir)) {
          belowA = grid[i + dir][j + 1];
        }
        if (withinCols(i - dir)) {
          belowB = grid[i - dir][j + 1];
        }
        
        
        // Can it fall below or left or right?
        if (below === 0) {
          nextGrid[i][j + 1] = state;
        } else if (belowA === 0) {
          nextGrid[i + dir][j + 1] = state;
        } else if (belowB === 0) {
          nextGrid[i - dir][j + 1] = state;
        // Stay put!
        } else {
          nextGrid[i][j] = state;
        }
      }
    }
  }
  return nextGrid;
}


function getNextGridConservative(grid){
  // Create a 2D array for the next frame of animation
  let nextGrid = make2DArray(cols, rows);
  let sh_inds = Array.from({ length: cols }, (_, i) => i);
  
  // Check every cell
  for (let j = rows-1; j >= 0; j--) {
    let i;
    shuffle(sh_inds, true);
    for (let iC = 0; iC < cols; iC++) {
      i = sh_inds[iC];
      // What is the state?
      let state = grid[i][j];
      
      // If it's a piece of sand!
      if (state > 0) {
        // What is below?
        let below = nextGrid[i][j + 1];
        
        // Randomly fall left or right
        let dir = 1;
        if (random(1) < 0.5) {
          dir *= -1;
        }
        
        // Check below left or right
        let belowA = -1;
        let belowB = -1;
        if (withinCols(i + dir)) {
          belowA = nextGrid[i + dir][j + 1];
        }
        if (withinCols(i - dir)) {
          belowB = nextGrid[i - dir][j + 1];
        }
        
        
        // Can it fall below or left or right?
        if (below === 0) {
          if (nextGrid[i][j + 1] != 0){
            console.log("Rewriting occupied cell below");
          }
          nextGrid[i][j + 1] = state;
        } else if (belowA === 0) {
          if (nextGrid[i + dir][j + 1] != 0){
            console.log("Rewriting occupied cell in direction " + dir);
          }
          nextGrid[i + dir][j + 1] = state;
        } else if (belowB === 0) {
          if (nextGrid[i - dir][j + 1] != 0){
            console.log("Rewriting occupied cell in direction " + (-dir));
          }
          nextGrid[i - dir][j + 1] = state;
        // Stay put!
        } else {
          if (nextGrid[i][j] != 0){
            console.log("Rewriting occupied cell under me");
          }          
          nextGrid[i][j] = state;
        }
      }
    }
  }
  return nextGrid;

}

function draw() {
  background(0);

  let particlesCount = 0;
  // Draw the sand
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      noStroke();
      if (grid[i][j] > 0) {
        fill(grid[i][j], 255, 255);
        let x = i * w;
        let y = j * w;
        square(x, y, w);
        particlesCount++;
      }
    }
  }
  counterTextDiv.html(`${particlesCount} particles (${Math.round(particlesCount*100.0*w*w/graphicsHeight/graphicsWidth)}%)`);
  
  nextGrid = getNextGridConservative(grid);
  
  if (!dragged && letItSnow){
    let i = floor(random(0, cols));
    nextGrid[i][0] = hueValue;
    // Change the color of the sand over time
    hueValue += 0.05;
    if (hueValue > 360) {
      hueValue = 1;
    }
  }

  grid = nextGrid;
  dragged = false;
}
