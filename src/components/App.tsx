import './css/App.css';

import {useState, useEffect} from 'react';
import useSettings from '../hooks/useSettings';

import SettingManager from './SettingsManager';
import {MovableBoard, DrawableBoard, DisplayBoard} from './Board';

import { AppInterfaces, Settings, TileInterfaces } from '../logic/interfaces';

import BoardState = AppInterfaces.BoardState;
import Actions = Settings.Enums.ActionTypes;
import TileLogic = TileInterfaces.TileLogic

/*
  An app consists of two major components : SettingsManager and Board.

  SettingsManager component consists of input fields to change iterationSettings.

  Board is a meta component that can be represented by 3 states which are components of the own:
    * MovableBoard is used to move character piece and flag piece around the board.
    * DrawableBoard is used to draw obstacles for path-finding.
    * DisplayBoard is used to display iteration process to the user.

  Switch between these states is handled by the SettingsManager.
*/


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
