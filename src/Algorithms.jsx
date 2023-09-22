export class Algorithm {
    constructor(grid) {
        this.grid = grid;
        
        this.startNode = this.getNodes("start")[0];
        this.endNode = this.getNodes("end")[0];

        // allows for multi-start, but not sure how that would work ;-;
        this.queue = this.getNodes("start");
        
        this.visited = new Set();
        this.visitedInOrder = [];
        
        this.parents = new Map();
        this.path = [];
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
        while(currentNode !== undefined) {
            this.path.unshift(currentNode);
            currentNode = this.parents.get(currentNode);
        }
    }

    // algs added here
    BFS() {
        while(this.queue.length) {
            const currentNode = this.queue.shift();
            if (currentNode.type === "obstacle") continue;

            this.visitedInOrder.push(currentNode);
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