import './App.css'
import React, { useState, useEffect, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useDrag, useDrop } from 'react-dnd';
import { Grid } from './DataStructures';
import { Algorithm } from './Algorithms';
import { Maze } from './Mazes'

const TOTAL_ROWS = 15;  // Adjust as needed
const TOTAL_COLS = 30;

// visualization controls
let paused = true;
let alg = null;
let maze = null;

let stats = [0, 0]
let stats_names = ["Steps: ", "Path Length: "]
let selected_stat = 0;

function DraggableNode({ node, onDragEnd, nodeStyles }) {
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
  const style = nodeStyles[node.type];

  return (
      <div ref={ref} style={style} className={`node ${node.type}` }></div>
  );
}

// Assuming nodeStyles is passed as a prop to DroppableNode
function DroppableNode({ node, onDrop, onMouseDown, onMouseUp, onMouseEnter, onClick, nodeStyles }) {
  const [, ref] = useDrop({
    accept: 'NODE',
    drop: () => ({ row: node.row, col: node.col }),
  });

  // Determine the style based on node type
  const style = nodeStyles[node.type] || (node.isCheckpoint ? nodeStyles.checkpoint : null);

  return (
      <div
          ref={ref}
          className={`node ${node.isCheckpoint ? 'checkpoint' : node.type}`}
          onMouseDown={() => onMouseDown(node.row, node.col)}
          onMouseUp={onMouseUp}
          onMouseEnter={() => onMouseEnter(node.row, node.col)}
          onClick={onClick}
          style={style} // Apply the style based on node type
      >
        {node.weight > 1 ? node.weight : ""}
      </div>
  );
}


function clearGridKeepStartAndEnd(grid) {
  const keepTypes = [
    "start",
    "end",
    "wall"
  ];
  for (let row of grid.nodes) {
    for (let node of row) {
      if (keepTypes.indexOf(node.type) < 0) { // Preserve wall nodes
        node.clear();
      }
    }
  }
}

export default function App() {
  const [showCustomization, setShowCustomization] = useState(false);
  let [grid, setGrid] = useState(null);
  const timeoutRef = useRef(null); // for time outs
  const [speed, setSpeed] = useState(100); // for speed control slider
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('Select Algorithm');
  const algorithms = ['Breadth-First Search', 'Depth-First Search', "Dijkstra's Algorithm", "Basic A*", "Weighted A*"];
  const mazes = ["Random", "Basic", "Weighted"];
  const [selectedNodeOption, setSelectedNodeOption] = useState('Select Node Option');
  const visibilityOptions = ['Toggle Node Visibility On', 'Toggle Node Visibility Off', 'Toggle Wall Visibility On', 'Toggle Wall Visibility Off', 'Toggle Checkpoint Visibility On', 'Toggle Checkpoint Visibility Off'];
  const nodeOptions = ['Add Walls', 'Add Checkpoint', 'Increase Node Weight', 'Decrease Node Weight', 'Select Obstacle Remover', 'Remove ALL Walls', 'Reset All Weights'];
  const [addingWalls, setAddingWalls] = useState(false); // Step 1
  const [actionMode, setActionMode] = useState('');
  const [dragging, setDragging] = useState(false);
  const [currentWallColor, setCurrentWallColor] = useState('#000000'); // Default color is black
  const [currentCheckpointColor, setCurrentCheckpointColor] = useState('#ffd700'); // Default color is Gold
  const [currentStartColor, setCurrentStartColor] = useState('#90ee90'); // Default color is Green
  const [currentEndColor, setCurrentEndColor] = useState('#ff6347');

  const [showGridSizeMenu, setShowGridSizeMenu] = useState(false);
  const [rows, setRows] = useState(TOTAL_ROWS);
  const [columns, setColumns] = useState(TOTAL_COLS);
  
  const [nodeStyles, setNodeStyles] = useState({
    start: { backgroundColor: '#90ee90' }, // Green
    wall: { backgroundColor: '#000000' },  // Black
    end: { backgroundColor: '#ff6347' },  // Red
    checkpoint: { backgroundColor: '#ffd700' } // Gold
  });

  const [activeDropdown, setActiveDropdown] = useState('');

  const toggleGridSizeMenu = () => {
    setShowGridSizeMenu(prevShow => !prevShow);
  };

  const handleColorChange = (nodeType, color) => {
    if(nodeType === 'wall')
    {
      setCurrentWallColor(color); // Update currentWallColor state
    }
    if(nodeType === 'checkpoint')
    {
      setCurrentCheckpointColor(color);
    }
    if(nodeType === 'start')
    {
      setCurrentStartColor(color);
    }
    if(nodeType === 'end')
    {
      setCurrentEndColor(color);
    }
    setNodeStyles(prevStyles => ({
      ...prevStyles,
      [nodeType]: { backgroundColor: color }
    }));
    setGrid(grid => ({ ...grid }));
  };

  const handleWallVisibility = (color) => {
    setNodeStyles(prevStyles => ({
      ...prevStyles,
      wall: { backgroundColor: color }
    }));
  };

  const handleCheckpointVisibility = (color) => {
    setNodeStyles(prevStyles => ({
      ...prevStyles,
      checkpoint: { backgroundColor: color }
    }));
  };

  const handleStartVisibility = (color) => {
    setNodeStyles(prevStyles => ({
      ...prevStyles,
      start: { backgroundColor: color }
    }));
  };

  const handleEndVisibility = (color) => {
    setNodeStyles(prevStyles => ({
      ...prevStyles,
      end: { backgroundColor: color }
    }));
  };


    // Function to toggle the customization toolbar
    const toggleCustomizationToolbar = () => {
      setShowCustomization(prevShow => !prevShow);
    };

  const handleMouseDown = (row, col) => {
    if (selectedNodeOption === 'Add Walls') {
      setAddingWalls(true);
      handleDroppableNodeClick(row, col); // Place initial wall
    }
  };

  const handleMouseUp = () => {
    if (selectedNodeOption === 'Add Walls') {
      setAddingWalls(false);
    }
  };

  const handleMouseEnter = (row, col) => {
    if (addingWalls && selectedNodeOption === 'Add Walls') {
      handleDroppableNodeClick(row, col);
    }
  };

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

  const handleMazeClick = (maze) => {
    RunMaze(maze)
  }

  const getCursorClassName = () => {
    if(actionMode === 'clearNode'){
      return 'obstacle-remover-cursor';
    }
    if(actionMode === 'addCheckpoint'){
      return 'checkpoint-cursor';
    }
    if(actionMode === 'increaseWeight'){
      return 'plus-cursor';
    }    
    if(actionMode === 'addWalls'){
      return 'obstacle-adder-cursor';
    }
    if(actionMode === 'decreaseWeight'){
      return 'minus-cursor';
    }

    return '';
  };

  const handleNodeOptionChange = (nodeOption) => {
    setSelectedNodeOption(nodeOption);
    switch(nodeOption) {
      default:
      case 'Add Walls':
        setActionMode('addWalls');
        break;
      case 'Select Obstacle Remover':
        setActionMode('clearNode');
        break;
      case 'Increase Node Weight':
        setActionMode('increaseWeight');
        break;
      case 'Decrease Node Weight':
        setActionMode('decreaseWeight');
        break;
      case 'Reset All Weights':
        handleClearWeightsClick();
        break;
      case 'Remove ALL Walls':
        handleClearWallsClick();
        break;
      case 'Add Checkpoint':
        setActionMode('addCheckpoint');
        break;
    }
  };

  function handleToggleVisibilityClick (buttonClicked) {
    switch(buttonClicked) {
      case 'Toggle Wall Visibility On':
        handleWallVisibility(currentWallColor);
        break;
      case 'Toggle Wall Visibility Off':
        handleWallVisibility('#ffffff');
        break;
      case 'Toggle Checkpoint Visibility On':
        handleCheckpointVisibility(currentCheckpointColor);
        break;
      case 'Toggle Checkpoint Visibility Off':
        handleCheckpointVisibility('#ffffff');
        break;
      case 'Toggle Node Visibility On':
        handleWallVisibility(currentWallColor);
        handleCheckpointVisibility(currentCheckpointColor);
        handleStartVisibility(currentStartColor);
        handleEndVisibility(currentEndColor);
        break;
      case 'Toggle Node Visibility Off':
        handleWallVisibility('#ffffff');
        handleCheckpointVisibility('#ffffff');
        handleStartVisibility('#ffffff');
        handleEndVisibility('#ffffff');
        break;
    }
  }

  function handleDroppableNodeClick(row, col) {
    const newGrid = { ...grid };
    const node = newGrid.nodes[row][col];
      // Check if the clicked node is 'start' or 'end'

    const StartOrEnd = (node.type !== 'start' && node.type !== 'end')

    switch (actionMode) {
      case 'addWalls':
          if (StartOrEnd) {
            node.type = 'wall';
          }
          break;
      case 'removeWalls':
          if (node.type === 'wall') {
              node.type = '';
          }
          break;
      case 'clearNode':
          if (StartOrEnd) {
              node.type = '';
          }
          break;
      case 'increaseWeight':
          if (StartOrEnd) {
              node.weight += 1;
          }
          break;
      case 'decreaseWeight':
          if (StartOrEnd && node.weight > 1) {
              node.weight -= 1;
          }
          break;
      case 'addCheckpoint':
        if (StartOrEnd && node.type !== 'wall') {
          node.setCheckpoint(true);
        }
      default:
          break;
    }
    setGrid(newGrid);
  }
  function CustomizationToolbar({ nodeStyles, onColorChange, activeDropdown, setActiveDropdown }) {
    const [tempColor, setTempColor] = useState(nodeStyles[activeDropdown]?.backgroundColor || '#ffffff');
    const handleTempColorChange = (e) => {
      setTempColor(e.target.value);
    };
  
    const applyColorChange = () => {
      onColorChange(activeDropdown, tempColor);
    };
    return (
      <div className="customization-toolbar">
        <button onClick={() => setActiveDropdown('start')}>Change Start Node Color</button>
        <button onClick={() => setActiveDropdown('wall')}>Change Obstacle Wall Color</button>
        <button onClick={() => setActiveDropdown('end')}>Change End Node Color</button>
        <button onClick={() => setActiveDropdown('checkpoint')}>Change Checkpoint Color</button>
        {activeDropdown && (
        <>
          <input 
            type="color" 
            value={tempColor}
            onChange={handleTempColorChange} 
          />
          <button onClick={applyColorChange}>Apply Color</button>
        </>
      )}
      </div>
    );
  }

  const reset_stats = () => {
    for(let i = 0; i < stats_names.length; i++) {
      stats[i] = 0;
    }
  }

  const handleClearClick = () => {
    grid = new Grid(rows, columns);
    setGrid(grid);
    
    alg = new Algorithm(grid, algorithms);
    reset_stats()

    paused = true;
  };
  const handleClearWeightsClick = () => {
    const newGrid = {...grid};
    for(let i = 0; i < newGrid.nodes.length; i++) {
        for(let j = 0; j < newGrid.nodes[i].length; j++) {
                newGrid.nodes[i][j].weight = 1;
            
        }
    }
    setGrid(newGrid);
};
  const handleClearWallsClick = () => {
    const newGrid = {...grid};
    for(let i = 0; i < newGrid.nodes.length; i++) {
        for(let j = 0; j < newGrid.nodes[i].length; j++) {
            if(newGrid.nodes[i][j].type === 'wall') {
                newGrid.nodes[i][j].type = '';
            }
        }
    }
    setGrid(newGrid);
};

  useEffect(() => {
    const initialGrid = new Grid(rows, columns);
    setGrid(initialGrid);
  }, [rows, columns]);

  const handleDragEnd = (draggedItem, dropResult) => {
    // Logic to swap the start and end nodes
    if (draggedItem.id !== 'start' && draggedItem.id !== 'end') return;

    const newGrid = { ...grid }; // Copy the grid to ensure immutability

    // Set the dragged node type to '' (empty)
    newGrid.nodes[draggedItem.row][draggedItem.col].type = '';

    // Set the drop result node type to the dragged node's type
    newGrid.nodes[dropResult.row][dropResult.col].type = draggedItem.id;

    setGrid(newGrid);
    setDragging(false);
  };
  
  const handleVisualizeClick = () => {
    // fixes a weird initialization issue with grid not having any nodes on start
    alg = new Algorithm(grid, algorithms);
    reset_stats()

    clearGridKeepStartAndEnd(grid);
    alg.run(selectedAlgorithm);

    if(paused) {
      paused = false;
      visualize();
    }
  };

  const RunMaze = (maze_type) => {
    maze = new Maze(grid, mazes);
    
    handleClearWallsClick();
    maze.run(maze_type);
  }

  const visualize = () => {
    if(!paused) {
        step();
        timeoutRef.current = setTimeout(visualize, speed);
    }
  };

  const step = () => {
    const cantReplace = [
      "start",
      "end",
      "path"
    ];
    if(alg.visualQueue.length > 0) {
      const visualNode = alg.visualQueue.shift();

      switch(visualNode.type) {
        case "path":
          removeVisitedNodes();
          stats[1] ++;
          break;
        case "no_path":
          alert("No path found for the current grid layout!")
          return;
        default:
          stats[0] ++;
          break;
      }
      
      if(cantReplace.indexOf(visualNode.node.type) == -1) {
        visualNode.node.updateType(visualNode.type);
      }
      setGrid({...grid});
    }
  };

  const removeVisitedNodes = () => {
    for(let row of grid.nodes) {
      for(let node of row) {
        node.updateType(((node.type == 'visited')? "": node.type));
      }
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

  const handleStatsClick = (stat) => {
    selected_stat = stats_names.indexOf(stat);
  }

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
                Mazes
                <div className="DropdownContent">
                  {mazes.map((maze, index) => (
                      <div
                          key={index}
                          className={`DropdownItem`}
                          onClick={() => handleMazeClick(maze)}
                      >
                        {maze}
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
                          className={`DropdownItem ${selectedNodeOption === nodeOption ? 'Selected' : ''}`}
                          onClick={() => handleNodeOptionChange(nodeOption)}
                      >
                        {nodeOption}
                      </div>
                  ))}
                </div>
              </div>
            </div>
            {/*<div className="Button">Add or Remove Walls</div>*/}
            <div className="Dropdown">
                  <div className="DropdownButton" onClick={toggleCustomizationToolbar}>
                    Customize
                  </div>
                  {showCustomization && (
                    <div className="DropdownContent">
                         {showCustomization && (
                          <CustomizationToolbar 
                          nodeStyles={nodeStyles}
                          onColorChange={handleColorChange}
                          activeDropdown={activeDropdown}
                          setActiveDropdown={setActiveDropdown}
                />
                )}
                    </div>
                  )}
                </div>

            <div className="Dropdown">
              <div className="DropdownButton">
                Toggle Visbility
                <div className="DropdownContent">
                  {visibilityOptions.map((visibilityOption, index) => (
                      <div
                          key={index}
                          className={`DropdownItem ${selectedNodeOption === visibilityOption ? 'Selected' : ''}`}
                          onClick={() => handleToggleVisibilityClick(visibilityOption)}
                      >
                        {visibilityOption}
                      </div>
                  ))}
                </div>
              </div>
            </div>

            <div
                className="Button Blue"
                onClick={handleVisualizeClick}
            >
              Visualize!
            </div>

                <div className="Dropdown">
                      <div className="DropdownButton" onClick={toggleGridSizeMenu}>
                        Grid Size
                      </div>
                      {showGridSizeMenu && (
                        <div className="DropdownContent">
                          <div>
                            <label>Rows: {rows}</label>
                            <input
                              type="range"
                              min="5"
                              max="20"
                              value={rows}
                              onChange={(e) => {setRows(Number(e.target.value)); handleClearClick();}}
                            />
                          </div>
                          <div>
                            <label>Columns: {columns}</label>
                            <input
                              type="range"
                              min="5"
                              max="35"
                              value={columns}
                              onChange={(e) => {setColumns(Number(e.target.value)); handleClearClick();}}
                            />
                          </div>
                        </div>
                      )}
                    </div>    
 
         
            <div className="Button" onClick={handleClearClick}>Clear Board</div>
            <div className="Dropdown">
              <div className="DropdownButton">
                {stats_names[selected_stat] + stats[selected_stat]}
                <div className="DropdownContent">
                  {stats_names.map((stat, index) => (
                      <div
                          key={index}
                          className={`DropdownItem`}
                          onClick={() => {handleStatsClick(stat)}}
                      >
                        {stat + stats[index]}
                      </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="Button">
              Control:&nbsp;
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
          <div className={`grid-container ${getCursorClassName()}`}>
            {grid && grid.nodes.map((row, rowIndex) => (
                <div key={rowIndex} className="row">
                  {row.map((node, nodeIndex) => {
                    // If it's a start or end node, return them wrapped in DraggableNode.
                    if (node.type === 'start' || node.type === 'end') {
                      return (
                          <DraggableNode nodeStyles={nodeStyles} key={nodeIndex} node={node}  onDragEnd={handleDragEnd} />
                      );
                    }
                    // For all other nodes, return them wrapped in DroppableNode.
                    else {
                      return (
                          <DroppableNode
                              nodeStyles={nodeStyles} 
                              key={nodeIndex}
                              node={node}
                              onMouseDown={handleMouseDown}
                              onMouseUp={handleMouseUp}
                              onMouseEnter={handleMouseEnter}
                              onClick={() => handleDroppableNodeClick(node.row, node.col)}
                          />
                      );
                    }
                  })}
                </div>
            ))}
          </div>
        </main>
      </DndProvider>
  );
} 