import { Algorithm, VisualNode } from '../src/Algorithms.jsx'; // Import Algorithm and VisualNode class 
import { Grid } from '../src/DataStructures.jsx'; // Import Grid class 

describe('Algorithm', () => {
  let algorithm;
  let grid; // Mock grid
  const mockAlgorithms = ['Breadth-First Search', 'Depth-First Search', "Dijkstra's Algorithm", "Basic A* (not done)"];

  // Before each test, create a new Algorithm instance with a mock grid
  beforeEach(() => {
    // Create a mock grid using the Grid class
    grid = new Grid(5, 5); 
    algorithm = new Algorithm(grid, mockAlgorithms);
  });

  describe('constructor', () => {
    it('should initialize Algorithm with grid and algorithms', () => {
      expect(algorithm.grid).toEqual(grid);
      expect(algorithm.algorithms).toEqual(mockAlgorithms);
      expect(algorithm.visited).toEqual(new Set());
      expect(algorithm.parents).toEqual(new Map());
      expect(algorithm.visualQueue).toEqual([]);
      // Add more assertions for other properties as needed
    });
  });

  describe('clearQueue', () => {
    it('should reset the queue, visited, parents, and visualQueue', () => {
      // Set some initial data
      algorithm.queue = [grid.nodes[0][0], grid.nodes[0][1], grid.nodes[0][2]]; 
      algorithm.visited = new Set([grid.nodes[1][1], grid.nodes[1][2]]); 
      algorithm.parents.set(grid.nodes[0][1], grid.nodes[0][0]); 
      algorithm.visualQueue = [new VisualNode(grid.nodes[0][0], 'visited'), new VisualNode(grid.nodes[0][1], 'visited')];

      // Call clearQueue
      algorithm.clearQueue();

      // Check if properties are reset
      expect(algorithm.queue).toEqual([]);
      expect(algorithm.visited.size).toBe(0);
      expect(algorithm.parents.size).toBe(0);
      expect(algorithm.visualQueue).toEqual([]);
    });
  });

  describe('getNodes', () => {
    it('should return an array of nodes of the specified type', () => {
      const startNodes = algorithm.getNodes('start');
      const endNodes = algorithm.getNodes('end');
      const obstacleNodes = algorithm.getNodes('obstacle');
      const wallNodes = algorithm.getNodes('wall');

      expect(startNodes).toHaveLength(1); // There should be only one start node in the grid
      expect(endNodes).toHaveLength(1); // There should be only one end node in the grid
      expect(obstacleNodes).toHaveLength(0); // Initially, there should be no obstacles
      expect(wallNodes).toHaveLength(0); // Initially, there should be no walls
    });
  });

  describe('hasBeenVisited', () => {
    it('should return true for nodes in the visited set', () => {
      const node = grid.nodes[1][1]; // A node in the grid

      // Add the node to the visited set
      algorithm.visited.add(node);

      // Check if the node has been visited
      const visited = algorithm.hasBeenVisited(node);

      expect(visited).toBe(true);
    });

    it('should return false for nodes not in the visited set', () => {
      const node = grid.nodes[2][2]; // A different node in the grid

      // Ensure the node is not in the visited set
      algorithm.visited.clear();

      // Check if the node has been visited
      const visited = algorithm.hasBeenVisited(node);

      expect(visited).toBe(false);
    });
  });

  describe('buildPath', () => {
    it('should build a path of nodes starting from the given node', () => {
      // Create a simple path of nodes
      const startNode = grid.nodes[0][0];
      const node1 = grid.nodes[0][1];
      const node2 = grid.nodes[0][2];
      const endNode = grid.nodes[0][3];

      algorithm.buildPath(endNode);

      expect(algorithm.visualQueue).toEqual([
        new VisualNode(endNode, 'path'),
        new VisualNode(node2, 'path'),
        new VisualNode(node1, 'path'),
        new VisualNode(startNode, 'path'),
      ]);
    });
  });

  describe('distance', () => {
    it('should calculate the distance between two nodes', () => {
      const node1 = grid.nodes[0][0];
      const node2 = grid.nodes[0][2];

      const calculatedDistance = algorithm.distance(node1, node2);

      expect(calculatedDistance).toBe(2);
    });
  });

  describe('run', () => {
    it('should call the correct algorithm based on the provided index', () => {
      const mockBFS = jest.spyOn(algorithm, 'BFS');
      const mockDFS = jest.spyOn(algorithm, 'DFS');
      const mockDijkstra = jest.spyOn(algorithm, 'DijkstrasAlgorithm');
      const mockAstar = jest.spyOn(algorithm, 'Astar');

      // Test calling each algorithm by providing the algorithm
      algorithm.run('Breadth-First Search');
      expect(mockBFS).toHaveBeenCalled();

      algorithm.run('Depth-First Search');
      expect(mockDFS).toHaveBeenCalled();

      algorithm.run("Dijkstra's Algorithm");
      expect(mockDijkstra).toHaveBeenCalled();

      algorithm.run("Basic A* (not done)");
      expect(mockAstar).toHaveBeenCalled();
    });

    it('should default to BFS if an invalid index is provided', () => {
      const mockBFS = jest.spyOn(algorithm, 'BFS');

      algorithm.run("Breadth-First Algorithm"); // Invalid algorithm

      expect(mockBFS).toHaveBeenCalled();
    });
  });

  describe('BFS', () => {
    it('should execute the BFS algorithm correctly', () => {
      // Create a grid with a simple BFS path
      const grid = new Grid(5, 5);
      grid.nodes[0][0].type = 'start';
      grid.nodes[4][4].type = 'end';
      const algorithms = ['Breadth-First Search', 'Depth-First Search', "Dijkstra's Algorithm", "Basic A* (not done)"];

      const algorithm = new Algorithm(grid, algorithms);
      algorithm.BFS();

      // Check that it found the shortest path
      expect(algorithm.path.length).toEqual(9);
    });
  });

  describe('DFS', () => {
    it('should execute the DFS algorithm correctly', () => {
      // Create a grid with a simple BFS path
      const grid = new Grid(5, 5);
      grid.nodes[0][0].type = 'start';
      grid.nodes[2][0].type = 'end';
      const algorithms = ['Breadth-First Search', 'Depth-First Search', "Dijkstra's Algorithm", "Basic A* (not done)"];

      const algorithm = new Algorithm(grid, algorithms);
      algorithm.DFS();

      // Check that it traversed the graph according to the DFS algorithm instead of finding the shortest path
      expect(algorithm.path.length).toEqual(11);
    });
  });

  describe('Dijjkstras Algorithm', () => {
    it('should execute Dijkstras Algorithm correctly', () => {
      // Create a grid with a simple BFS path
      const grid = new Grid(5, 5);
      grid.nodes[0][0].type = 'start';
      grid.nodes[0][4].type = 'end';
      grid.nodes[0][2].setAsObstacle(5);
      const algorithms = ['Breadth-First Search', 'Depth-First Search', "Dijkstra's Algorithm", "Basic A* (not done)"];

      const algorithm = new Algorithm(grid, algorithms);
      algorithm.DijkstrasAlgorithm();

      // Check that it found the shortest path taking the weight of the nodes into account
      expect(algorithm.path.length).toEqual(7);
    });
  });

});
