import './App.css'
import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useDrag, useDrop } from 'react-dnd';
import { Node, Obstacle, Grid } from './DataStructures';

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

  return (
    <DndProvider backend={HTML5Backend}>
      <main>
        <div className="toolbar">
        </div>
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
