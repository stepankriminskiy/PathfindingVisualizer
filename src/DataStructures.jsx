export class Node {
  constructor(row, col) {
    this.row = row;
    this.col = col;
    this.type = '';
    this.neighbors = []; // Neighbors of the node
    this.weight = 1;
    this.isCheckpoint = false;

    // Default type is an empty string
    // Other properties like isStart, isEnd, isVisited, etc.
  }

  // Update the type of the node
  updateType(newType) {
    this.type = newType;
  }

  // Set this node as the start node
  setAsStart() {
    this.type = 'start';
  }

  // Set this node as the end node
  setAsEnd() {
    this.type = 'end';
  }

  setAsObstacle(weight) {
    this.type = 'obstacle';
    this.weight = weight;
  }

  setAsWall() {
    this.type = 'wall';
  }

  // Other methods for node operations, e.g., clearType, etc.
  clear() {
    this.updateType("");
  }

  setCheckpoint(bool) {
    this.isCheckpoint = bool;
  }

  equalTo(node) {
    return this.row == node.row && this.col == node.col;
  }
}

export class Obstacle {
  constructor(row, col) {
    this.row = row;
    this.col = col;
    this.type = 'obstacle'; // Obstacles have a specific type
  }

  // Remove the obstacle by resetting its type
  removeObstacle() {
    this.type = '';
  }

  // Add an obstacle by setting its type
  addObstacle() {
    this.type = 'obstacle';
  }

  // Other methods for obstacle operations, if needed
}

export class Grid {
  constructor(rows, columns) {
    this.rows = rows;
    this.columns = columns;
    this.nodes = []; // 2D array to store nodes
    
    // Initialize the grid with nodes
    for (let i = 0; i < rows; i++) {
      this.nodes[i] = [];
      for (let j = 0; j < columns; j++) {
        // Create a new node object with properties like type, isStart, isEnd, etc.
        this.nodes[i][j] = new Node(i, j);
      }
    }
    // After initializing all nodes, set their neighbors
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        this.setNeighbors(this.nodes[i][j]);
      }
    }
    
    this.nodes[0][0].setAsStart(); // Top-left corner for start
    this.nodes[rows - 1][columns - 1].setAsEnd(); // Bottom-right corner for end
  }
  
  setNeighbors(node) {
    const { row, col } = node;

    // Above
    if (row > 0) node.neighbors.push(this.nodes[row - 1][col]);
    // Below
    if (row < this.rows - 1) node.neighbors.push(this.nodes[row + 1][col]);
    // Left
    if (col > 0) node.neighbors.push(this.nodes[row][col - 1]);
    // Right
    if (col < this.columns - 1) node.neighbors.push(this.nodes[row][col + 1]);
  }

  // Clear the entire grid
  clearGrid() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.nodes[i][j].type = ''; // Reset the type of each node
      }
    }
  }

  // Clear the obstacles
  clearObstacles() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        if (this.nodes[i][j].type === "obstacle") {
          this.nodes[i][j].type = ''; // Reset the type of the node
          this.weight = 1; // Reset the weight of the node
        }
      }
    }
  }

  // Clear the walls
  clearWalls() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        if (this.nodes[i][j].type === "wall") {
          this.nodes[i][j].type = ''; // Reset the type of the node
        }
      }
    }
  }

  // Clear the obstacles and walls
  clearObstaclesAndWalls() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        if (this.nodes[i][j].type === "obstacle" || this.nodes[i][j].type === "wall") {
          this.nodes[i][j].type = ''; // Reset the type of the node
        }
      }
    }
  }

  generateMaze() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        if (Math.random() > 0.75) {
          this.nodes[i][j].type = 'wall'; 
        }
      }
    }
  }

  // Other methods for grid operations, e.g., updateNode, addObstacle, removeObstacle, setAsStart, setAsEnd, etc.
}