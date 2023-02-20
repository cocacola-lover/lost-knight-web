import {useState, useEffect, useCallback} from 'react';
import useSettings from '../hooks/useSettings';
import Position from '../logic/position';
import Mapping2D from '../logic/mapping2d';

import SettingManager from './SettingsManager';
import { AppInterfaces } from '../logic/interfaces';
import {MovableBoard, DrawableBoard, DisplayBoard} from './Board';

import BoardState = AppInterfaces.BoardState;

import './css/App.css';

function App1 () {

  const {settings, setSettings} = useSettings();
  const [boardState, setBoardState] = useState(BoardState.Movable);

  return (
    <div className='App'>
      <div className='SettingsManagerWrapper'>

      <SettingManager
      width={{get : settings.width, set : setSettings.setWidth}}
      height={{get : settings.height, set : setSettings.setHeight}}
      iterate={{get : boardState === BoardState.Display, toggle : () => setBoardState((prevState) => {
        return (prevState === BoardState.Display) ? BoardState.Movable : BoardState.Display;
      })}}
      draw={{get : boardState === BoardState.Drawable, toggle : () => setBoardState((prevState) => {
        return (prevState === BoardState.Drawable) ? BoardState.Movable : BoardState.Drawable;
      })}}
      algorithmsNames={settings.algorithmNames}
      algorithmsChoose= {setSettings.chooseSearchIterator}
      characterNames={settings.pieceNames}
      characterChoose={setSettings.choosePiece}
      ></SettingManager>

      </div>

      {
        (() => {
          switch (boardState) {
            case BoardState.Movable :
              return <MovableBoard 
              settings={settings.getMovableSettings()}
              />
            case BoardState.Drawable :
              return <DrawableBoard
              settings={settings.getDrawableSettings()}
              />
            case BoardState.Display : 
              return <DisplayBoard
              settings={settings.getDisplaySettings()}/>
          }
        })()
      }
    </div>
  )
}

export default App1;
