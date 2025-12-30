import React, {Component} from 'react';

import Node from './Node/Node';
import {dijkstra, getNodesInShortestPathOrder} from '../algorithms/dijkstra';

import './PathfindingVisualizer.css';

const START_NODE_ROW = 10;
const START_NODE_COL = 15;
const FINISH_NODE_ROW = 10;
const FINISH_NODE_COL = 35;

export default class PathfindingVisualizer extends Component {
  constructor() {
    super();
    this.state = {
      grid: [],
      mouseIsPressed: false,
      startNodeRow: START_NODE_ROW,
      startNodeCol: START_NODE_COL,
      finishNodeRow: FINISH_NODE_ROW,
      finishNodeCol: FINISH_NODE_COL,
      selectedNodeType: null,
      selectedNodeRow: null,
      selectedNodeCol: null,
      executionTime: 0,
      totalOperations: 0,
      shortestPathLength: 0,
    };
  }

  componentDidMount() {
    const grid = getInitialGrid(this.state.startNodeRow, this.state.startNodeCol, this.state.finishNodeRow, this.state.finishNodeCol);
    this.setState({grid});
  }

  handleMouseDown(row, col) {
    const node = this.state.grid[row][col];
    // Check if clicking on start or finish node
    if (node.isStart || node.isFinish) {
      this.setState({
        mouseIsPressed: true,
        selectedNodeType: node.isStart ? 'start' : 'finish',
        selectedNodeRow: row,
        selectedNodeCol: col,
      });
    } else {
      // Toggle wall
      const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
      this.setState({grid: newGrid, mouseIsPressed: true});
    }
  }

  handleMouseEnter(row, col) {
    if (!this.state.mouseIsPressed) return;
    
    // Handle dragging of start/end nodes
    if (this.state.selectedNodeType) {
      const newGrid = this.state.grid.map(r => [...r]);
      const selectedRow = this.state.selectedNodeRow;
      const selectedCol = this.state.selectedNodeCol;
      
      // Clear old position
      if (newGrid[selectedRow][selectedCol].isStart) {
        newGrid[selectedRow][selectedCol].isStart = false;
        newGrid[row][col].isStart = true;
        this.setState({grid: newGrid, selectedNodeRow: row, selectedNodeCol: col});
      } else if (newGrid[selectedRow][selectedCol].isFinish) {
        newGrid[selectedRow][selectedCol].isFinish = false;
        newGrid[row][col].isFinish = true;
        this.setState({grid: newGrid, selectedNodeRow: row, selectedNodeCol: col});
      }
    } else {
      // Toggle walls
      const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
      this.setState({grid: newGrid});
    }
  }

  handleMouseUp() {
    // Update start/end node positions in state after drag completes
    if (this.state.selectedNodeType && this.state.selectedNodeRow !== null && this.state.selectedNodeCol !== null) {
      if (this.state.selectedNodeType === 'start') {
        this.setState({
          mouseIsPressed: false,
          startNodeRow: this.state.selectedNodeRow,
          startNodeCol: this.state.selectedNodeCol,
          selectedNodeType: null,
          selectedNodeRow: null,
          selectedNodeCol: null,
        });
      } else if (this.state.selectedNodeType === 'finish') {
        this.setState({
          mouseIsPressed: false,
          finishNodeRow: this.state.selectedNodeRow,
          finishNodeCol: this.state.selectedNodeCol,
          selectedNodeType: null,
          selectedNodeRow: null,
          selectedNodeCol: null,
        });
      }
    } else {
      this.setState({
        mouseIsPressed: false,
        selectedNodeType: null,
        selectedNodeRow: null,
        selectedNodeCol: null,
      });
    }
  }

  resetVisualizer = () => {
    // Clear all visited and shortest path animations
    const allNodes = document.querySelectorAll('.node');
    allNodes.forEach(node => {
      node.classList.remove('node-visited', 'node-shortest-path');
    });
    
    // Reset grid to initial state with default start/end positions
    const freshGrid = getInitialGrid(START_NODE_ROW, START_NODE_COL, FINISH_NODE_ROW, FINISH_NODE_COL);
    
    // Update state and ensure nodes are visible by restoring classes
    this.setState({
      grid: freshGrid,
      startNodeRow: START_NODE_ROW,
      startNodeCol: START_NODE_COL,
      finishNodeRow: FINISH_NODE_ROW,
      finishNodeCol: FINISH_NODE_COL,
      mouseIsPressed: false,
      executionTime: 0,
      totalOperations: 0,
      shortestPathLength: 0,
    }, () => {
      // After state update, restore node classes
      setTimeout(() => {
        const startNode = document.getElementById(`node-${START_NODE_ROW}-${START_NODE_COL}`);
        const finishNode = document.getElementById(`node-${FINISH_NODE_ROW}-${FINISH_NODE_COL}`);
        
        if (startNode) {
          startNode.className = 'node node-start';
        }
        if (finishNode) {
          finishNode.className = 'node node-finish';
        }
      }, 0);
    });
  };

  clearBarriers = () => {
    // Remove only barriers, keep start and end nodes
    const newGrid = this.state.grid.map(row => 
      row.map(node => ({
        ...node,
        isWall: false,
      }))
    );
    
    // Clear animations
    const allNodes = document.querySelectorAll('.node');
    allNodes.forEach(node => {
      node.classList.remove('node-visited', 'node-shortest-path');
    });
    
    this.setState({grid: newGrid});
  };

  animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder) {
    const {startNodeRow, startNodeCol, finishNodeRow, finishNodeCol} = this.state;
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          this.animateShortestPath(nodesInShortestPathOrder);
        }, 10 * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        // Skip styling start and end nodes - they must remain immutable
        if ((node.row === startNodeRow && node.col === startNodeCol) ||
            (node.row === finishNodeRow && node.col === finishNodeCol)) {
          return;
        }
        document.getElementById(`node-${node.row}-${node.col}`).className =
          'node node-visited';
      }, 10 * i);
    }
  }

  animateShortestPath(nodesInShortestPathOrder) {
    const {startNodeRow, startNodeCol, finishNodeRow, finishNodeCol} = this.state;
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        // Skip styling start and end nodes - they must remain immutable
        if ((node.row === startNodeRow && node.col === startNodeCol) ||
            (node.row === finishNodeRow && node.col === finishNodeCol)) {
          // On last iteration, update metrics regardless
          if (i === nodesInShortestPathOrder.length - 1) {
            this.setState({
              executionTime: this.metrics.executionTime,
              totalOperations: this.metrics.totalOperations,
              shortestPathLength: this.metrics.shortestPathLength,
            });
          }
          return;
        }
        document.getElementById(`node-${node.row}-${node.col}`).className =
          'node node-shortest-path';
        
        // Update metrics state after the last node is animated
        if (i === nodesInShortestPathOrder.length - 1) {
          this.setState({
            executionTime: this.metrics.executionTime,
            totalOperations: this.metrics.totalOperations,
            shortestPathLength: this.metrics.shortestPathLength,
          });
        }
      }, 50 * i);
    }
  }

  visualizeDijkstra() {
    // Reset metrics before running
    this.setState({
      executionTime: 0,
      totalOperations: 0,
      shortestPathLength: 0,
    });
    
    const startTime = performance.now();
    const {grid, startNodeRow, startNodeCol, finishNodeRow, finishNodeCol} = this.state;
    // Use current dragged positions, not hardcoded defaults
    const startNode = grid[startNodeRow][startNodeCol];
    const finishNode = grid[finishNodeRow][finishNodeCol];
    const visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
    
    // Calculate metrics
    const executionTime = performance.now() - startTime;
    const totalOperations = visitedNodesInOrder.length;
    const shortestPathLength = nodesInShortestPathOrder.length;
    
    // Store metrics and animate
    this.metrics = {
      executionTime: Math.round(executionTime * 100) / 100,
      totalOperations,
      shortestPathLength,
    };
    
    this.animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder);
  }

  render() {
    const {grid, mouseIsPressed, executionTime, totalOperations, shortestPathLength} = this.state;

    return (
      <>
        <div className="visualizer-controls">
          <button 
            className="btn btn-primary"
            onClick={() => this.visualizeDijkstra()}
          >
            Visualize Dijkstra's Algorithm
          </button>
          <button 
            className="btn btn-danger"
            onClick={this.resetVisualizer}
          >
            Reset
          </button>
        </div>
        <div className="metrics-panel">
          <div className="metric-card">
            <div className="metric-label">Time</div>
            <div className="metric-value">{executionTime} ms</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Operations</div>
            <div className="metric-value">{totalOperations}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Shortest Path Length</div>
            <div className="metric-value">{shortestPathLength}</div>
          </div>
        </div>
        <div className="grid">
          {grid.map((row, rowIdx) => {
            return (
              <div key={rowIdx}>
                {row.map((node, nodeIdx) => {
                  const {row, col, isFinish, isStart, isWall} = node;
                  return (
                    <Node
                      key={nodeIdx}
                      col={col}
                      isFinish={isFinish}
                      isStart={isStart}
                      isWall={isWall}
                      mouseIsPressed={mouseIsPressed}
                      onMouseDown={(row, col) => this.handleMouseDown(row, col)}
                      onMouseEnter={(row, col) =>
                        this.handleMouseEnter(row, col)
                      }
                      onMouseUp={() => this.handleMouseUp()}
                      row={row}></Node>
                  );
                })}
              </div>
            );
          })}
        </div>
      </>
    );
  }
}

const getInitialGrid = (startRow = START_NODE_ROW, startCol = START_NODE_COL, finishRow = FINISH_NODE_ROW, finishCol = FINISH_NODE_COL) => {
  const grid = [];
  for (let row = 0; row < 20; row++) {
    const currentRow = [];
    for (let col = 0; col < 50; col++) {
      currentRow.push(createNode(col, row, startRow, startCol, finishRow, finishCol));
    }
    grid.push(currentRow);
  }
  return grid;
};

const createNode = (col, row, startRow = START_NODE_ROW, startCol = START_NODE_COL, finishRow = FINISH_NODE_ROW, finishCol = FINISH_NODE_COL) => {
  return {
    col,
    row,
    isStart: row === startRow && col === startCol,
    isFinish: row === finishRow && col === finishCol,
    distance: Infinity,
    isVisited: false,
    isWall: false,
    previousNode: null,
  };
};

const getNewGridWithWallToggled = (grid, row, col) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  const newNode = {
    ...node,
    isWall: !node.isWall,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};
