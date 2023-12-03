import { PriorityQueue, VisualNode, BetterMap, AStarNode } from "./DataStructures";

export class Algorithm {
    constructor(grid, algorithms) {
        this.grid = grid;

        this.startNode = this.getNodes("start")[0];
        this.endNode = this.getNodes("end")[0];
        this.checkpoints = this.getCheckpoints();

        this.priorityQueue = new PriorityQueue();
        this.priorityQueue.enqueue([this.startNode, 0]);

        this.distances = new Map();
        this.distances.set(this.startNode, 0);

        this.queue = this.getNodes("start");
        this.visited = new Set();
        this.parents = new Map();

        this.visualQueue = [];

        this.algorithms = algorithms;
    }

    isObstacle(node) {
        const obstacles = [
            "wall"
        ];
        return obstacles.indexOf(node.type) >= 0;
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

    getCheckpoints() {
        let output = [];
        for (let row of this.grid.nodes) {
            for (let node of row) {
                if (node.isCheckpoint) {
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
        let checkpointsInOrder = this.getCheckpointOrder();
        let runs = this.getRuns([this.startNode, this.endNode], checkpointsInOrder);

        this.visualQueue = [];
        while (runs.length) {
            const currentRun = runs.shift();
            this.startNode = currentRun[0];
            this.endNode = currentRun[1];

            this.queue = [this.startNode];
            this.visited = new Set();
            this.parents = new Map();

            this.runCase(algorithm);
        }
    }

    getRuns(original, checkpoints) {
        original.splice(1, 0, ...checkpoints);
        let output = [];

        for (let i = 1; i < original.length; i++) {
            output.push([
                original[i - 1],
                original[i]
            ]);
        }

        return output;
    }

    runCase(algorithm) {
        const alg = this.algorithms.indexOf(algorithm);
        switch (alg) {
            default:
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
            case 4:
                this.WeigtedAstar();
                break;
        }
    }

    getCheckpointOrder() {
        let checkpoints = [...this.checkpoints];
        let sorted = [];
        let sorter = new PriorityQueue();

        let current = this.startNode;
        while (checkpoints.length) {
            for (const cp of checkpoints) {
                sorter.enqueue([cp, this.nodeDistance(current, cp)]);
            }

            const closestNodeIndex = checkpoints.indexOf(sorter.dequeue());
            const closestNode = checkpoints[closestNodeIndex];

            current = closestNode;
            sorted.push(closestNode);

            checkpoints.splice(closestNodeIndex, 1);
            sorter = new PriorityQueue()
        }

        return sorted;
    }

    distance(node1, node2) {
        const distance = Math.sqrt(
            Math.pow(node1.row - node2.row, 2)
            +
            Math.pow(node1.col - node2.col, 2)
        );
        return distance;
    }

    nodeDistance(node1, node2) {
        let queue = [[node1, 0]];
        let visited = new Set();
        let parents = new Map();

        let dequeue;
        while (queue.length) {
            dequeue = queue.shift();
            const currentNode = dequeue[0];
            const depth = dequeue[1]

            if (this.isObstacle(currentNode)) continue;

            visited.add(currentNode);

            if (currentNode.equalTo(node2)) break;

            const neighbors = currentNode.neighbors;
            for (const neighbor of neighbors) {
                if (this.isObstacle(neighbor)) continue;
                if (!visited.has(neighbor)) {
                    queue.push([neighbor, depth + 1]);
                    visited.add(neighbor);
                }
            }
        }
        return dequeue[1];
    }

    noPath() {
        this.calculateClassesForGradient();
        this.visualQueue.push(new VisualNode(null, "no_path"))
    }

    calculateClassesForGradient() {
        let stepSize = Math.ceil(this.visualQueue.length / 40);
        let currentStep = 0;
        if (this.checkpoints == 0) {
            for (let i = 0; i < this.visualQueue.length; i++) {
                if (i % stepSize === 0 && currentStep < 40) {
                    currentStep++;
                }

                let className = `node-visited-${currentStep}`;

                this.visualQueue[i].type = className;

            }
        }
    }

    // algs added here
    BFS() {
        while (this.queue.length) {
            const currentNode = this.queue.shift();
            if (this.isObstacle(currentNode)) continue;

            this.visualQueue.push(new VisualNode(currentNode, "visited"));
            this.visited.add(currentNode);

            if (currentNode.equalTo(this.endNode)) {
                this.calculateClassesForGradient();
                this.buildPath(currentNode);
                return;
            }

            const neighbors = currentNode.neighbors;
            for (const neighbor of neighbors) {
                if (this.isObstacle(neighbor)) continue;
                if (!this.hasBeenVisited(neighbor)) {
                    this.queue.push(neighbor);
                    this.visited.add(neighbor);
                    this.parents.set(neighbor, currentNode);
                    this.distances.set(neighbor, this.distances.get(currentNode) + 1);
                }
            }
        };
        this.noPath();
    }

    DFS() {
        while (this.queue.length) {
            const currentNode = this.queue.pop();
            if (this.isObstacle(currentNode)) continue;

            this.visualQueue.push(new VisualNode(currentNode, "visited"));
            this.visited.add(currentNode);

            if (currentNode.equalTo(this.endNode)) {
                this.calculateClassesForGradient();
                this.buildPath(currentNode);
                return;
            }

            const neighbors = currentNode.neighbors;
            for (const neighbor of neighbors) {
                if (this.isObstacle(neighbor)) continue;
                if (!this.hasBeenVisited(neighbor)) {
                    this.queue.push(neighbor);
                    this.visited.add(neighbor);
                    this.parents.set(neighbor, currentNode);
                    this.distances.set(neighbor, this.distances.get(currentNode) + 1);
                }
            }
        };
        this.noPath();
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
            if (this.isObstacle(currentNode)) continue;

            this.visualQueue.push(new VisualNode(currentNode, "visited"));
            this.visited.add(currentNode);

            if (currentNode.equalTo(this.endNode)) {
                this.calculateClassesForGradient();
                this.buildPath(currentNode);
                return;
            }

            const neighbors = currentNode.neighbors
            for (const neighbor of neighbors) {
                if (this.isObstacle(neighbor)) continue;

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

                if (!this.hasBeenVisited(neighbor)) {
                    const an = new AStarNode(neighbor, this.distance(neighbor, this.endNode), newGCost);
                    pqueue.enqueue([an, an.getCost()]);
                    this.visited.add(neighbor);
                    this.parents.set(neighbor, newParent);
                }
            }
        }
        this.noPath()
    }

    DijkstrasAlgorithm() {

        while (!this.priorityQueue.isEmpty()) {
            // Extract the node with the smallest distance from the priority queue.
            const currentNode = this.priorityQueue.dequeue();

            // If this node has already been visited, skip it.
            if (this.hasBeenVisited(currentNode)) continue;

            // Mark the node as visited.
            this.visualQueue.push(new VisualNode(currentNode, "visited"));
            this.visited.add(currentNode);

            if (currentNode.equalTo(this.endNode)) {
                this.calculateClassesForGradient();
                this.buildPath(currentNode);
                return;
            }

            // Visit neighbors and update distances if a shorter path is found.
            for (const neighbor of currentNode.neighbors) {
                if (this.isObstacle(neighbor)) continue;

                // Calculate the new distance from the source to the neighbor through the current node.
                const newDistance = this.distances.get(currentNode) + neighbor.weight;

                // If the new distance is shorter, update the distance and parent information.
                if (!this.distances.has(neighbor) || newDistance < this.distances.get(neighbor)) {
                    this.distances.set(neighbor, newDistance);
                    this.parents.set(neighbor, currentNode);
                    this.priorityQueue.enqueue([neighbor, newDistance]);
                }
            }
        }
        this.noPath();
    }

    WeigtedAstar() {
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
            if (this.isObstacle(currentNode)) continue;

            this.visualQueue.push(new VisualNode(currentNode, "visited"));
            this.visited.add(currentNode);

            if (currentNode.equalTo(this.endNode)) {
                this.calculateClassesForGradient();
                this.buildPath(currentNode);
                return;
            }

            const neighbors = currentNode.neighbors
            for (const neighbor of neighbors) {
                if (this.isObstacle(neighbor)) continue;

                const newNeighbors = neighbor.neighbors;
                let newGCost = currentAStarNode.gcost + neighbor.weight;
                let newParent = currentNode;
                for (const newNeighbor of newNeighbors) {
                    const cost = gcosts.getOrElse(newNeighbor, Infinity);
                    const newCost = Math.min(newGCost, cost + neighbor.weight);
                    if (newCost != newGCost) {
                        newGCost = newCost;
                        newParent = newNeighbor;
                    }
                }

                if (!this.hasBeenVisited(neighbor)) {
                    const an = new AStarNode(neighbor, this.distance(neighbor, this.endNode), newGCost);
                    pqueue.enqueue([an, an.getCost()]);
                    this.visited.add(neighbor);
                    this.parents.set(neighbor, newParent);
                }
            }
        }
        this.noPath()
    }
}
