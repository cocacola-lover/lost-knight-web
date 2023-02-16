import {useState, useEffect, useCallback} from 'react';
import Position from '../logic/position';
import Mapping2D from '../logic/mapping2d';

import SettingManager from './SettingsManager';
import { AppInterfaces } from '../logic/interfaces';
import {MovableBoard, DrawableBoard, DisplayBoard} from './Board';

import BoardState = AppInterfaces.BoardState;

import './css/App.css';

function App() {

  const [width, setWidth] = useState(10);
  const [height, setHeight] = useState(10);

  const [boardState, setBoardState] = useState(BoardState.Movable);
  const [board, setBoard] = useState(new Mapping2D<boolean>(height, width, true));

  const [knightPosition, setKnightPosition] = useState<Position>(new Position(0, 0));
  const [flagPosition, setFlagPosition] = useState<Position>(new Position(1, 1));


  const getPassability = useCallback((pos : Position) => {
    try {
      return board.at(pos);
    } catch (e) {}
    return true;
  }, [board]);

  const setPassability = (pos : Position, value : boolean) => {
    setBoard((previousState) => {
      const newState = previousState.copy();
      newState.setAt(pos, value);
      return newState;
    });
  }

  // Work with scaling
  useEffect(() => {
    setBoard((prevBoard) => {
      return prevBoard.scaleTo(height, width, true);
    });

    setKnightPosition((prevPosition) => new Position(
          prevPosition.x < width ? prevPosition.x : width - 1,
          prevPosition.y < height ? prevPosition.y : height - 1,
    ));

    setFlagPosition((prevPosition) => new Position(
      prevPosition.x < width ? prevPosition.x : width - 1,
      prevPosition.y < height ? prevPosition.y : height - 1,
    ));

  }, [width, height]);

  // Collision prevention
  useEffect(() => {
    if (Position.same(knightPosition, flagPosition)) {
      setKnightPosition(new Position(0, 0));
      setFlagPosition(new Position(1, 1));
    }

    if (!getPassability(knightPosition)) setPassability(knightPosition, true);
    if (!getPassability(flagPosition)) setPassability(flagPosition, true);
  }, [knightPosition, flagPosition, getPassability])

  return (
    <div className='App'>
      <div className='SettingsManagerWrapper'>

      <SettingManager
      width={{get : width, set : setWidth}}
      height={{get : height, set : setHeight}}
      iterate={{get : boardState === BoardState.Display, toggle : () => setBoardState((prevState) => {
        return (prevState === BoardState.Display) ? BoardState.Movable : BoardState.Display;
      })}}
      draw={{get : boardState === BoardState.Drawable, toggle : () => setBoardState((prevState) => {
        return (prevState === BoardState.Drawable) ? BoardState.Movable : BoardState.Drawable;
      })}}
      ></SettingManager>

      </div>

      {
        (() => {
          switch (boardState) {
            case BoardState.Movable :
              return <MovableBoard 
              width={width} 
              height={height} 
              knightPosition={knightPosition}
              flagPosition={flagPosition}
              setFlagPosition={setFlagPosition}
              setKnightPosition={setKnightPosition}
              getPassability={getPassability}
              />
            case BoardState.Drawable :
              return <DrawableBoard
              width={width} 
              height={height} 
              knightPosition={knightPosition}
              flagPosition={flagPosition}
              getPassability={getPassability}
              setPassability={setPassability}
              />
            case BoardState.Display : 
              return <DisplayBoard
              width={width} 
              height={height} 
              knightPosition={knightPosition}
              flagPosition={flagPosition}
              getPassability={getPassability}
              passabilityMap={board}/>
          }
        })()
      }
    </div>
  )
}


export default App;
