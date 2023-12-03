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
        const not_obstacles = [
            "",
            "wall",
            "path",
            "visited"
        ]
        return not_obstacles.indexOf(node.type) == -1;
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

    getNeighboringPaths(node) {
        const x = node.col;
        const y = node.row;
        const nodes = this.grid.nodes

        const paths = [
            (y + 2 < this.grid.rows) ? [
                nodes[y + 2][x],
                nodes[y + 1][x]
            ] : undefined,
            (y - 2 >= 0) ? [
                nodes[y - 2][x],
                nodes[y - 1][x]    
            ] : undefined,
            (x + 2 < this.grid.columns) ? [
                nodes[y][x + 2],
                nodes[y][x + 1]
            ] : undefined,
            (x - 2 >= 0) ? [
                nodes[y][x - 2],
                nodes[y][x - 1]  
            ] : undefined
        ];
        let output = [];
        for (const path of paths) {
            if (path != undefined) {
                output.push(path)
            }
        }
        return output;
    }

    setAllWall() {
        for (let row of this.grid.nodes) {
            for (let node of row) {
                if(!this.isObstacle(node)) {
                    node.setAsWall()
                }
            }
        }
    }

    // algs added here
    Random() {
        for (let row of this.grid.nodes) {
            for (let node of row) {
                if(!this.isObstacle(node)) {
                    if (Math.random() < 0.25) {
                        node.setAsWall()
                    }
                }
            }
        }
    }

    Maze() {
        this.setAllWall();
        this.queue = [[this.endNode, null]];

        while (this.queue.length) {
            const index = Math.floor(Math.random() * this.queue.length);
            const currentPath = this.queue[index]
            this.queue.splice(index, 1);

            const currentNode = currentPath[0];
            const currentPathSegment = currentPath[1];            
            
            this.visited.add(currentNode);

            const neighboringPaths = this.getNeighboringPaths(currentNode);
            for (const pathSegment of neighboringPaths) {
                if(!this.hasBeenVisited(pathSegment[0])) {
                    for(let node of pathSegment) {
                        if(node != undefined) {
                            if (!this.isObstacle(node)) node.updateType("");
                        }
                    }
                    this.queue.push(pathSegment);
                    this.visited.add(pathSegment[0]);
                }
            }
        }

        for(let node of this.startNode.neighbors) {
            if(!this.isObstacle(node)) {
                node.updateType("")
            }
        }
    }
}