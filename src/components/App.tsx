import {useState} from 'react';
import Position from '../logic/position';

import { buildBoard } from '@cocacola-lover/knight_path_finder';
import Board from './Board';

import './css/App.css';

function App() {
  const width = 8;
  const height = 8;

  const board = buildBoard(width, height);

  const [knightPosition, setKnightPosition] = useState<Position>(new Position(0, 0));
  const [flagPosition, setFlagPosition] = useState<Position>(new Position(0, 1));

  return (
    <div className='App'>
      <Board 
      width={width} 
      height={height} 
      squares={board.squares}
      knightPosition={knightPosition}
      setKnightPosition={setKnightPosition}
      flagPosition={flagPosition}
      setFlagPosition={setFlagPosition}/>
    </div>
  );
}

export default App;
