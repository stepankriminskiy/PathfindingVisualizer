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
            case 2:
                throw new Error("Algorithm '" + algorithm + "' not implimented yet.");
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
}

class VisualNode {
    constructor(node, type) {
        this.node = node;
        this.type = type;
    }
}