import './App.css'
import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useDrag, useDrop } from 'react-dnd';
import { Node, Obstacle, Grid } from './DataStructures';
import { Algorithm } from './Algorithms';

const TOTAL_ROWS = 15;  // Adjust as needed
const TOTAL_COLS = 30;

function DraggableNode({ node, onDragEnd }) {
  const [, ref] = useDrag({
    type: 'NODE',
    item: { id: node.type, row: node.row, col: node.col },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if(item && dropResult){
        onDragEnd(item, dropResult);
      }
    }
  });

  return (
      <div ref={ref} className={`node ${node.type}`}></div>
  );
}



// Droppable Node
function DroppableNode({ node, onDrop }) {
  const [, ref] = useDrop({
    accept: 'NODE',
    drop: () => ({ row: node.row, col: node.col }),
  });

  return (
      <div ref={ref} className={`node ${node.type}`}></div>
  );
}


export default function App() {
  const [grid, setGrid] = useState(null);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('Select Algorithm');
  const algorithms = ['Breadth-First Search', 'Depth-First Search', "Dijkstra's Algorithm"];

  const handleAlgorithmChange = (algorithm) => {
    setSelectedAlgorithm(algorithm);
  };

  const handleClearClick = () => {
    const newGrid = new Grid(TOTAL_ROWS, TOTAL_COLS);
    setGrid(newGrid);
  };

  useEffect(() => {
    const initialGrid = new Grid(TOTAL_ROWS, TOTAL_COLS);
    setGrid(initialGrid);
  }, []);

  const handleDragEnd = (draggedItem, dropResult) => {
    // Logic to swap the start and end nodes
    if (draggedItem.id !== 'start' && draggedItem.id !== 'end') return;

    const newGrid = { ...grid }; // Copy the grid to ensure immutability

    // Set the dragged node type to '' (empty)
    newGrid.nodes[draggedItem.row][draggedItem.col].type = '';

    // Set the drop result node type to the dragged node's type
    newGrid.nodes[dropResult.row][dropResult.col].type = draggedItem.id;

    setGrid(newGrid);
  };
  
  const visualizeAlgorithm = (visited, path, ms) => {
    visualizeTimeout(visited, 0, ms, "visited");
    visualizeTimeout(path, visited.length * ms, ms, "path");
  };

  const visualizeTimeout = (set, delay, ms, type) => {
    for (let i = 0; i < set.length; i++) {
      setTimeout(() => {
        const node = set[i];
        if(node.type !== "start" && node.type !== "end") {
          node.type = type;
        }
        const newGrid = [...grid.nodes];
        setGrid({ nodes: newGrid });
      }, 
      ms * i + delay);
    }
  }
  
  const handleVisualizeClick = () => {
    const alg = new Algorithm(grid);
    alg.BFS();
    visualizeAlgorithm(alg.visitedInOrder, alg.path, 50);
  };

  return (
      <DndProvider backend={HTML5Backend}>
        <main>
          <header className="toolbar">
            <div className="Dropdown">
              <div className="DropdownButton">
                Algorithms
                <div className="DropdownContent">
                  {algorithms.map((algorithm, index) => (
                      <div
                          key={index}
                          className={`DropdownItem ${selectedAlgorithm === algorithm ? 'Selected' : ''}`}
                          onClick={() => handleAlgorithmChange(algorithm)}
                      >
                        {algorithm}
                      </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="Button">Add or Remove Walls</div>
            <div className="Button" onClick={handleClearClick}>Clear Board</div>
            <div 
              className="Button Blue" 
              onClick={handleVisualizeClick}
            >
              Visualize!
            </div>
            <div className="Button">
              Control
              <div className="ControlButtons">
                <button className="ControlButton">Pause</button>
                <button className="ControlButton">Continue</button>
                <input type="range" className="Slider" />
              </div>
            </div>
          </header>
          <div className="grid-container">
            {grid && grid.nodes.map((row, rowIndex) => (
                <div key={rowIndex} className="row">
                  {row.map((node, nodeIndex) => {
                    if (node.type === 'start' || node.type === 'end') {
                      return (
                          <DraggableNode key={nodeIndex} node={node} onDragEnd={handleDragEnd} />
                      );
                    }
                    return (
                        <DroppableNode key={nodeIndex} node={node} />
                    );
                  })}
                </div>
            ))}
          </div>
        </main>
      </DndProvider>
  );
}