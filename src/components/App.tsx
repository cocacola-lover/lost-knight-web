import {useState, useEffect} from 'react';
import Position from '../logic/position';
import Mapping2D from '../logic/mapping2d';

import { Board, ChessPointer } from '@cocacola-lover/knight_path_finder';

import {MovableBoard, DrawableBoard, DisplayBoard} from './Board';

import './css/App.css';

function App() {
  const width = 8;
  const height = 8;

  const [board, setBoard] = useState(new Mapping2D<boolean>(height, width, true));

  const [knightPosition, setKnightPosition] = useState<Position>(new Position(0, 0));
  const [flagPosition, setFlagPosition] = useState<Position>(new Position(3, 5));


  const getPassability = (pos : Position) => {
    return board.at(pos);
  }

  const setPassability = (pos : Position, value : boolean) => {
    setBoard((previousState) => {
      const newState = previousState.copy();
      newState.setAt(pos, value);
      return newState;
    });
  }

  // return (
  //   <div className='App'>
  //     <MovableBoard 
  //     width={width} 
  //     height={height} 
  //     squares={board.squares}
  //     knightPosition={knightPosition}
  //     setKnightPosition={setKnightPosition}
  //     flagPosition={flagPosition}
  //     setFlagPosition={setFlagPosition}/>
  //   </div>
  // );

  return (
    <div className='App'>
      <DisplayBoard 
      width={width} 
      height={height} 
      knightPosition={knightPosition}
      flagPosition={flagPosition}
      getPassability={getPassability}
      />
    </div>
  )
}


export default App;
