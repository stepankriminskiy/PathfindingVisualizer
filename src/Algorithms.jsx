export class Algorithm {
    constructor(grid, algorithms) {
        this.grid = grid;
        
        this.startNode = this.getNodes("start")[0];
        this.endNode = this.getNodes("end")[0];

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

        console.log(output);

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
                break;
            case 2:
            case 3:
                this.Astar();
                break;
            case 4:
                throw new Error("Algorithm '" + algorithm + "' not implimented yet.");
                break;
            default:
                this.BFS();
        }
    }

    distance(node1, node2) {
        const distance = Math.sqrt(
          Math.pow(node1.row - node2.row, 2)
          +
          Math.pow(node1.col - node2.col, 2)
        );
        return distance;
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
        }
    }

    DFS() {
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
                    this.queue.unshift(neighbor);
                    this.visited.add(neighbor);
                    this.parents.set(neighbor, currentNode);
                }
            }
        }
    }

    Astar() {
        for(let i = 0; i < this.queue.length; i++) {
            const node = this.queue[i];
            this.queue[i] = [node, this.distance(node, this.endNode)];
        }

        while(this.queue.length) {
            const currentTuple = this.queue.shift();
            const currentNode = currentTuple[0]
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
                    this.queue.push([neighbor, this.distance(neighbor, this.endNode)]);

                    // console.log("================BEFORE===============: ");
                    // for(const a of this.queue) {console.log(a)}

                    this.queue.sort((a, b) => {
                        return a[1] - b[1];
                    });

                    // console.log("================AFTER===============: ");
                    // for(const a of this.queue) {console.log(a)}

                    this.visited.add(neighbor);
                    this.parents.set(neighbor, currentNode);
                }
            }
        }
    }
}

class VisualNode {
    constructor(node, type) {
        this.node = node;
        this.type = type;
    }
}