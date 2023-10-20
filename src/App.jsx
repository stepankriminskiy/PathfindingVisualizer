import './App.css'
import React, { useState, useEffect, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useDrag, useDrop } from 'react-dnd';
import { Node, Obstacle, Grid } from './DataStructures';
import { Algorithm } from './Algorithms';

const TOTAL_ROWS = 15;  // Adjust as needed
const TOTAL_COLS = 30;

// visualization controls
let paused = true;
let alg = null;

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

function clearGridKeepStartAndEnd(grid) {
  for (let row of grid.nodes) {
    for (let node of row) {
      if (node.type !== "start" && node.type !== "end" && node.type !== "wall") { // Preserve wall nodes
        node.clear();
      }
    }
  }
}

export default function App() {
  let [grid, setGrid] = useState(null);
  const timeoutRef = useRef(null); // for time outs
  const [speed, setSpeed] = useState(100); // for speed control slider
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('Select Algorithm');
  const algorithms = ['Breadth-First Search', 'Depth-First Search', "Dijkstra's Algorithm", "Basic A* (not done)"];
  const [selectedNodeOption, setSelectedNodeOption] = useState('Select Node Option');
  const nodeOptions = ['Add Walls', 'Remove Walls', 'Increase Node Weight', 'Decrease Node Weight'];
  const [addingWalls, setAddingWalls] = useState(false); // Step 1

  const handleSpeedChange = (e) => { // change speed with control slider
    setSpeed(200 - e.target.value);
    if(e > 190){
      setSpeed(0);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      visualize();
    }
  };

  const handleAlgorithmChange = (algorithm) => {
    setSelectedAlgorithm(algorithm);
  };


  const handleNodeOptionChange = (nodeOption) => {
    setSelectedNodeOption(nodeOption);

    if (nodeOption === 'Add Walls') {
      setAddingWalls(!addingWalls);
    } else {
      // Reset "Add Walls" mode when a different option is selected
      setAddingWalls(false);
    }
  };

  function handleDroppableNodeClick(row, col) {
    if (addingWalls) {
      const newGrid = { ...grid };
      newGrid.nodes[row][col].type = 'wall';
      setGrid(newGrid);
    }
  }

  const handleGridClick = (row, col) => {
    if (addingWalls) {
      const newGrid = { ...grid };
      newGrid.nodes[row][col].setAsWall(); // Set the clicked node as a wall
      setGrid(newGrid);
    }
  };

  const handleClearClick = () => {
    grid = new Grid(TOTAL_ROWS, TOTAL_COLS);
    alg = new Algorithm(grid, algorithms);
    setGrid(grid);

    paused = true;
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
  
  const handleVisualizeClick = () => {
    // fixes a weird initialization issue with grid not having any nodes on start
    alg = new Algorithm(grid, algorithms);

    clearGridKeepStartAndEnd(grid);
    alg.run(selectedAlgorithm);

    if(paused) {
      paused = false;
      visualize(20);
    }
  };

  const visualize = () => {
    if(!paused) {
        step();
        timeoutRef.current = setTimeout(visualize, speed);
    }
  };

  const step = () => {
    if(alg.visualQueue.length > 0) {
      const visualNode = alg.visualQueue.shift();
      if(!(["start", "end"].indexOf(visualNode.node.type) + 1)) {
        visualNode.node.updateType(visualNode.type);
      }
      setGrid({...grid});
    }
  };

  const handlePauseButtonClick = () => {
      paused = true;
  };

  const handleContinueButtonClick = () => {
    if(paused) {
      paused = false;
      visualize(20);
    }
  };
  const handleStepButtonClick = () => {
    paused = true;
    step();
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
            <div className="Dropdown">
              <div className="DropdownButton">
                Node Options
                <div className="DropdownContent">
                  {nodeOptions.map((nodeOption, index) => (
                      <div
                          key={index}
                          className={`DropdownItem ${selectedNodeOption === nodeOption && addingWalls ? 'Selected' : ''}`}
                          onClick={() => handleNodeOptionChange(nodeOption)}
                      >
                        {nodeOption}
                      </div>
                  ))}
                </div>
              </div>
            </div>
            {/*<div className="Button">Add or Remove Walls</div>*/}
            <div 
              className="Button Blue" 
              onClick={handleVisualizeClick}
            >
              Visualize!
            </div>
            <div className="Button" onClick={handleClearClick}>Clear Board</div>
            <div className="Button">
              Control
              <div className="ControlButtons">
                <button className="ControlButton" onClick={() => {handlePauseButtonClick();}}>Pause</button>
                <button className="ControlButton" onClick={() => {handleContinueButtonClick();}}>Continue</button>
                <button className="ControlButton" onClick={() => {handleStepButtonClick();}}>Step</button>
                <input 
                type="range" 
                className="Slider"
                min="10" 
                max="200" 
                value={200 - speed} 
                onChange={handleSpeedChange}
                />
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
                        <div
                            key={nodeIndex}
                            className={`node ${node.type}`}
                            onClick={() => handleDroppableNodeClick(node.row, node.col)} // Handle clicks
                        ></div>
                    );
                  })}
                </div>
            ))}
          </div>
        </main>
      </DndProvider>
  );
} 