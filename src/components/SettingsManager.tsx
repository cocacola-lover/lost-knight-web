import React, { ChangeEvent, useRef } from 'react';
import './css/SettingsManager.css';

import { SettingsManagerInterface, Settings } from '../logic/interfaces';

import Actions = Settings.ActionTypes;

function Slider ({value, onChange} : SettingsManagerInterface.SliderProps) {

    const handleSlider : React.ChangeEventHandler<HTMLInputElement> = (event : ChangeEvent<HTMLInputElement>) => {
        onChange(Number((event.target as HTMLInputElement).value));
    }

    return <div className="slidecontainer">
                <div className="sliderCounter"  
                    style={{left : `${(value - 2) * 5.3}%`}}>
                {value}</div>
                <input type="range" onChange={handleSlider}  min="2" max="20" value={value} className="slider" id="myRange"/>
            </div>
}


function ThreeButtons ({value, toggle} : SettingsManagerInterface.ButtonsProps) {
    return (<div className='ThreeButtons'>
        <button className={value === 0 ? 'active' : ''} onClick={toggle[0]}>Iterate</button>
        <button className={value === 1 ? 'active' : ''} onClick={toggle[1]}>Draw</button>
        <button className={value === 2 ? 'active' : ''} onClick={toggle[2]}>Move</button>
    </div>)
}

function SelectAlgorithm (props : SettingsManagerInterface.SelectProps) {

    const selectRef = useRef<HTMLSelectElement>(null);

    const onChange = () => {
        if (selectRef.current === null) return;
        props.choose(Number(selectRef.current.selectedOptions[0].value));
        console.log(Number(selectRef.current.selectedOptions[0].value))
    }

    return (<select ref={selectRef} name='Algorithm' onChange={onChange}>
        {props.options.map((str, index) => {
            return <option key={index} value={index}>{str}</option>
        })}
    </select>)
}

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

    return (<div className='SettingsManager'>
                <ThreeButtons value={props.boardState} toggle={props.toggle}></ThreeButtons>
                <Slider value={settings.height} onChange={sliderOnChangeHeight}/>
                <Slider value={settings.width} onChange={sliderOnChangeWidth}/>
                <SelectAlgorithm 
                options={Settings.algorithmNames} 
                choose={algorithmsChoose}/>
                <SelectAlgorithm 
                options={Settings.pieceNames} 
                choose={characterChoose}/>
            </div>)
}