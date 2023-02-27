import './css/SettingsManager.css';

import { ThreeButtons } from './SettingsComponents/ThreeButtons';
import { DimensionSlider, VelocitySlider } from './SettingsComponents/Sliders';
import { SelectAlgorithm, SelectPiece } from './SettingsComponents/Select';

import { SettingsManagerInterface, Settings } from '../logic/interfaces';

import Actions = Settings.Enums.ActionTypes;

/*
    A parent component that is used to change settings.
*/

export default function SettingManager (props : SettingsManagerInterface.SettingsManagerProps) {

    const {settings, dispatch} = props;

    const sliderOnChangeWidth = (newWidth : number) => dispatch({
        type : Actions.ChangeSize,
        payload : [newWidth, settings.height]
    });

    const sliderOnChangeHeight = (newHeight : number) => dispatch({
        type : Actions.ChangeSize,
        payload : [ settings.width, newHeight,]
    });

    const algorithmsChoose = (algoId : number) => dispatch({
        type : Actions.SetSearchIterator,
        payload : algoId
    });

    const characterChoose = (characterId : number) => dispatch({
        type : Actions.SetCharacter,
        payload : characterId
    });

    const weightToggle = (key : string, value : boolean) => dispatch({
            type : Actions.SetWeights,
            payload :  (Object.assign({}, settings.weightSettings, {
                [key] : value
            })) as Settings.WeightSettings
    });

    const setIterationSpeed = (velocity : number | null) => dispatch({
        type : Actions.SetIterationSpeed,
        payload : velocity
    });

    return (<div className='SettingsManager'>

                {/* Are used to change between states of the board */}
                <ThreeButtons value={props.boardState} toggle={props.toggle}></ThreeButtons>

                <DimensionSlider label='Height' value={settings.height} onChange={sliderOnChangeHeight}/>
                <DimensionSlider label='Width' value={settings.width} onChange={sliderOnChangeWidth}/>

                <VelocitySlider 
                value={settings.iterationSpeed}
                onChange={setIterationSpeed}
                sliderValues={Settings.Constants.iterationSpeedValues}
                sliderLabels={Settings.Constants.iterationSpeedLabels}
                ></VelocitySlider>

                <SelectAlgorithm
                settings={settings.weightSettings}
                toggleCheckBoxes={weightToggle}
                options={Settings.Constants.algorithmNames} 
                choose={algorithmsChoose}/>

                <SelectPiece 
                options={Settings.Constants.pieceNames} 
                choose={characterChoose}/>
            </div>)
}