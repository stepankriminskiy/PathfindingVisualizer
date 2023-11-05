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
        for (let row of this.grid.nodes) {
            for (let node of row) {
                if (node.type === type) {
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
        while (currentNode !== undefined) {
            path.unshift(currentNode);
            currentNode = this.parents.get(currentNode);
        }
        for (const node of path) {
            this.visualQueue.push(new VisualNode(node, "path"));
        }
    }

    run(algorithm) {
        this.clearQueue();
        const alg = this.algorithms.indexOf(algorithm);

        switch (alg) {
            case 0:
                this.BFS();
                break;
            case 1:
                this.DFS();
                break;
            case 2:
                this.DijkstrasAlgorithm();
                break;
            case 3:
                this.Astar();
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
        while (this.queue.length) {
            const currentNode = this.queue.shift();
            if (currentNode.type === "wall") continue;

            this.visualQueue.push(new VisualNode(currentNode, "visited"));
            this.visited.add(currentNode);

            if (currentNode.type === 'end') {
                this.buildPath(currentNode);
                break;
            }

            const neighbors = currentNode.neighbors;
            for (const neighbor of neighbors) {
                if (neighbor.type === "wall") {
                    continue;
                }
                if (!this.visited.has(neighbor)) {
                    this.queue.push(neighbor);
                    this.visited.add(neighbor);
                    this.parents.set(neighbor, currentNode);
                }
            }
        };
    }

    DFS() {
        while (this.queue.length) {
            const currentNode = this.queue.pop();
            if (currentNode.type === "wall") continue;

            this.visualQueue.push(new VisualNode(currentNode, "visited"));
            this.visited.add(currentNode);

            if (currentNode.type === 'end') {
                this.buildPath(currentNode);
                break;
            }

            const neighbors = currentNode.neighbors;
            for (const neighbor of neighbors) {
                if (neighbor.type === "wall") {
                    continue;
                }
                if (!this.visited.has(neighbor)) {
                    this.queue.push(neighbor);
                    this.visited.add(neighbor);
                    this.parents.set(neighbor, currentNode);
                }
            }
        };
    }

    Astar() {
        let pqueue = new PriorityQueue()
        let gcosts = new BetterMap()

        while (this.queue.length) {
            const node = this.queue.shift();
            const an = new AStarNode(node, this.distance(node, this.endNode), 0);
            pqueue.enqueue([an, an.getCost()]);
            gcosts.set(node, 0)
        }

        while (pqueue.size()) {
            const currentAStarNode = pqueue.dequeue();
            const currentNode = currentAStarNode.node;
            if (currentNode.type === "wall") continue;

            this.visualQueue.push(new VisualNode(currentNode, "visited"));
            this.visited.add(currentNode);

            if (currentNode.type === 'end') {
                this.buildPath(currentNode);
                break;
            }

            const neighbors = currentNode.neighbors
            for (const neighbor of neighbors) {
                if (neighbor.type === "wall") {
                    continue;
                }

                const newNeighbors = neighbor.neighbors;
                let newGCost = currentAStarNode.gcost + 1;
                let newParent = currentNode;
                for (const newNeighbor of newNeighbors) {
                    const cost = gcosts.getOrElse(newNeighbor, Infinity);
                    const newCost = Math.min(newGCost, cost + 1);
                    if (newCost != newGCost) {
                        newGCost = newCost;
                        newParent = newNeighbor;
                    }
                }

                if (!this.visited.has(neighbor)) {
                    const an = new AStarNode(neighbor, this.distance(neighbor, this.endNode), newGCost);
                    pqueue.enqueue([an, an.getCost()]);
                    this.visited.add(neighbor);
                    this.parents.set(neighbor, currentNode);
                }
            }
        }
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
                if (neighbor.type === "wall") {
                    continue;
                }
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

class VisualNode {
    constructor(node, type) {
        this.node = node;
        this.type = type;
    }
}

class PriorityQueue {
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

class AStarNode {
    constructor(node, f, g) {
        this.node = node;
        this.fcost = f;
        this.gcost = g;
    }

    getCost() {
        return this.fcost + this.gcost;
    }
}

class BetterMap {
    constructor() {
        this.map = new Map()
    }

    set(a, b) {
        this.map.set(a, b)
    }

    getOrElse(a, b) {
        const get = this.map.get(a);
        if (get === undefined) {
            return b;
        }
        return get;
    }
}