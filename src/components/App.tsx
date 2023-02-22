import {useState, useEffect} from 'react';
import useSettings from '../hooks/useSettings';


import SettingManager from './SettingsManager';
import { AppInterfaces, Settings, TileInterfaces } from '../logic/interfaces';
import {MovableBoard, DrawableBoard, DisplayBoard} from './Board';

import BoardState = AppInterfaces.BoardState;
import Actions = Settings.ActionTypes;
import TileLogic = TileInterfaces.TileLogic

import './css/App.css';

function App () {

  const [settings, dispatch] = useSettings();

  const [boardState, setBoardState] = useState(BoardState.Movable);

  // Clean up board after display is turned off
  useEffect(() => {
    dispatch({
      type : Actions.SetTileLogicMany,
      payload : (prevBoard) => {
        return prevBoard.map((value) => 
                value === TileLogic.unpassable ? TileLogic.unpassable : TileLogic.notFound);;
      }
  });
  }, [boardState, dispatch])

  return (
    <div className='App'>
      <div className='SettingsManagerWrapper'>

      <SettingManager
        settings={settings}
        dispatch={dispatch}
        boardState={boardState}
        toggle={[
          () => setBoardState(BoardState.Display),
          () => setBoardState(BoardState.Drawable),
          () => setBoardState(BoardState.Movable),
        ]}
      ></SettingManager>

      </div>
      <div className='BoardWrapper'>
      {
        (() => {
          switch (boardState) {
            case BoardState.Movable :
              return <MovableBoard 
              settings={settings}
              dispatch={dispatch}
              />
            case BoardState.Drawable :
              return <DrawableBoard
              settings={settings}
              dispatch={dispatch}
              />
            case BoardState.Display : 
              return <DisplayBoard
              settings={settings}
              dispatch={dispatch}
              />
          }
        })()
      }
      </div>
    </div>
  )
}

export default App;
