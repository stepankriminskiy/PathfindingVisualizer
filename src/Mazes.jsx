export class Maze {
    constructor(grid, mazes) {
        this.grid = grid;

        this.startNode = this.getNodes("start")[0];
        this.endNode = this.getNodes("end")[0];

        this.queue = this.getNodes("start");
        this.visited = new Set();

        this.mazes = mazes;
    }

    isObstacle(node) {
        const obstacles = [
            "start",
            "end"
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

    hasBeenVisited(testNode) {
        return this.visited.has(testNode);
    }

    run(algorithm) {
        const alg = this.mazes.indexOf(algorithm);
        switch (alg) {
            default:
            case 0:
                this.Random();
                break;
            case 1:
                this.Maze();
                break;
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

    // algs added here
    Random() {
        for (const row of this.grid) {
            for (let node of row) {
                if(!this.isObstacle(node)) {
                    if (Math.random() < 0.25) {
                        node.setAsWall()
                    }
                }
            }
        }
    }
}