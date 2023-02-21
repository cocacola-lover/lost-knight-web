import {useState} from 'react';
import useSettings from '../hooks/useSettings';


import SettingManager from './SettingsManager';
import { AppInterfaces, Settings } from '../logic/interfaces';
import {MovableBoard, DrawableBoard, DisplayBoard} from './Board';

import Actions = Settings.ActionTypes;
import BoardState = AppInterfaces.BoardState;

import './css/App.css';

function App1 () {

  const [settings, dispatch] = useSettings();

  const [boardState, setBoardState] = useState(BoardState.Movable);

  return (
    <div className='App'>
      <div className='SettingsManagerWrapper'>

      <SettingManager
      width={{get : settings.width, set : (newWidth : number) => dispatch({
        type : Actions.ChangeSize,
        payload : [newWidth, settings.height]
      })}}
      height={{get : settings.height, set : (newHeight : number) => dispatch({
        type : Actions.ChangeSize,
        payload : [settings.width, newHeight]
      })}}
      iterate={{get : boardState === BoardState.Display, toggle : () => setBoardState((prevState) => {
        return (prevState === BoardState.Display) ? BoardState.Movable : BoardState.Display;
      })}}
      draw={{get : boardState === BoardState.Drawable, toggle : () => setBoardState((prevState) => {
        return (prevState === BoardState.Drawable) ? BoardState.Movable : BoardState.Drawable;
      })}}
      algorithmsNames={Settings.algorithmNames}
      algorithmsChoose= {(algo : number) => dispatch({
        type : Actions.SetSearchIterator,
        payload : algo
      })}
      characterNames={Settings.pieceNames}
      characterChoose={(character : number) => dispatch({
        type : Actions.SetCharacter,
        payload : character
      })}
      ></SettingManager>

      </div>

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
  )
}

export default App1;
