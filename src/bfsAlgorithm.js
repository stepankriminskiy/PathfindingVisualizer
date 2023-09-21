export const BFS = (grid, startNode) => {
    const visitedNodesInOrder = [];
    const queue = [startNode];
    const visited = new Set();
     // will need a map to reconstruct the path backwards
  
    while (queue.length) {
      const currentNode = queue.shift();
      if (currentNode.type === 'obstacle') continue; // Skip if it's an obstacle.
  
      visitedNodesInOrder.push(currentNode);
      visited.add(currentNode);
  
      if (currentNode.type === 'end') {
        break; // Stop BFS once endNode is reached.
      }
  
      const neighbors = currentNode.neighbors;
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          queue.push(neighbor);
          visited.add(neighbor);
          
        }
      }
    }
  

  
    return visitedNodesInOrder;
  };