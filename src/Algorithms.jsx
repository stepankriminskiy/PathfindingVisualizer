export class Algorithm {
    constructor(grid, algorithms) {
        this.grid = grid;
        
        this.startNode = this.getNodes("start")[0];
        this.endNode = this.getNodes("end")[0];

        this.priorityQueue = new PriorityQueue();
        this.priorityQueue.enqueue([this.startNode, 0]);
        
        this.queue = this.getNodes("start");
        this.visited = new Set();
        this.parents = new Map();
        
        this.visualQueue = [];

        this.algorithms = algorithms;
    }

    clearQueue() {
      //allows for multistart by taking all start nodes, not sure how that would look
      this.queue = this.getNodes("start");
      this.visited = new Set();
      this.parents = new Map();
      
      this.visualQueue = [];
  }

    getNodes(type) {
        let output = [];
        for(let row of this.grid.nodes) {
            for(let node of row) {
                if(node.type === type) {
                    output.push(node)
                }
            }
        }
        return output;
    }

    hasBeenVisited(testNode) {
        return this.visited.has(testNode);
    }

    buildPath(start) {
        let currentNode = start;
        let path = []
        while(currentNode !== undefined) {
            path.unshift(currentNode);
            currentNode = this.parents.get(currentNode);
        }
        for(const node of path) {
            this.visualQueue.push(new VisualNode(node, "path"));
        }
    }

    run(algorithm) {
      this.clearQueue();
      const alg = this.algorithms.indexOf(algorithm);

      switch(alg) {
          case 0:
              this.BFS();
              break;
          case 1:
              this.DFS();
          case 2:
              this.DijkstrasAlgorithm();
              break;
          default:
              this.BFS();
      }
    }

    // algs added here
    BFS() {
      while(this.queue.length) {
          const currentNode = this.queue.shift();
          if (currentNode.type === "obstacle") continue;

          this.visualQueue.push(new VisualNode(currentNode, "visited"));
          this.visited.add(currentNode);
      
          if (currentNode.type === 'end') {
              this.buildPath(currentNode);
              break;
          }
      
          const neighbors = currentNode.neighbors;
          for (const neighbor of neighbors) {
              if (!this.visited.has(neighbor)) {
                  this.queue.push(neighbor);
                  this.visited.add(neighbor);
                  this.parents.set(neighbor, currentNode);
              }
          }
      };
    }

    DFS() {
      while(this.queue.length) {
          const currentNode = this.queue.pop();
          if (currentNode.type === "obstacle") continue;

          this.visualQueue.push(new VisualNode(currentNode, "visited"));
          this.visited.add(currentNode);
      
          if (currentNode.type === 'end') {
              this.buildPath(currentNode);
              break;
          }
      
          const neighbors = currentNode.neighbors;
          for (const neighbor of neighbors) {
              if (!this.visited.has(neighbor)) {
                  this.queue.push(neighbor);
                  this.visited.add(neighbor);
                  this.parents.set(neighbor, currentNode);
              }
          }
      };
    }

    DijkstrasAlgorithm() {
        // Initialize the distance from the source node to itself as 0.
        const distances = new Map();
        distances.set(this.startNode, 0);
        
        while (!this.priorityQueue.isEmpty()) {
            // Extract the node with the smallest distance from the priority queue.
            const currentNode = this.priorityQueue.dequeue();
    
            // If this node has already been visited, skip it.
            if (this.visited.has(currentNode)) continue;
    
            // Mark the node as visited.
            this.visualQueue.push(new VisualNode(currentNode, "visited"));
            this.visited.add(currentNode);
            
            if (currentNode.type === 'end') {
                this.buildPath(currentNode); 
                break;
            }
            
            // Visit neighbors and update distances if a shorter path is found.
            for (const neighbor of currentNode.neighbors) {
                // Calculate the new distance from the source to the neighbor through the current node.
                const newDistance = distances.get(currentNode) + neighbor.weight; 
    
                // If the new distance is shorter, update the distance and parent information.
                if (!distances.has(neighbor) || newDistance < distances.get(neighbor)) {
                    distances.set(neighbor, newDistance);
                    this.parents.set(neighbor, currentNode);
    
                      this.priorityQueue.enqueue([neighbor, newDistance]);
                }
            }
        }
    }
    
}

export class PriorityQueue {
    constructor() {
      this.items = [];
    }
  
    enqueue(item) {
      const priority = item[1];
      let added = false;
  
      for (let i = 0; i < this.items.length; i++) {
        if (priority < this.items[i][1]) {
          this.items.splice(i, 0, item);
          added = true;
          break;
        }
      }
  
      if (!added) {
        this.items.push(item);
      }
    }
  
    dequeue() {
      if (this.isEmpty()) {
        return null;
      }
      return this.items.shift()[0];
    }
  
    front() {
      if (this.isEmpty()) {
        return null;
      }
      return this.items[0][0];
    }
  
    isEmpty() {
      return this.items.length === 0;
    }
  
    size() {
      return this.items.length;
    }
  }

  class VisualNode {
    constructor(node, type) {
        this.node = node;
        this.type = type;
    }
}