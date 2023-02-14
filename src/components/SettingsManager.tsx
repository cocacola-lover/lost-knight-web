import React, { ChangeEvent } from 'react';
import './css/SettingsManager.css';
import { useState, useRef } from 'react';

import { SettingsManagerInterface } from '../logic/interfaces';

function Slider (props : SettingsManagerInterface.SliderProps) {

    const handleSlider : React.ChangeEventHandler<HTMLInputElement> = (event : ChangeEvent<HTMLInputElement>) => {
        props.value.set(Number((event.target as HTMLInputElement).value));
    }

    return <div className="slidecontainer">
                <div className="sliderCounter"  
                    style={{left : `${(props.value.get - 2) * 5.3}%`}}>
                {props.value.get}</div>
                <input type="range" onChange={handleSlider}  min="2" max="20" value={props.value.get} className="slider" id="myRange"/>
            </div>
}

export default function SettingManager (props : SettingsManagerInterface.SettingsManagerProps) {

    return (<div className='SettingManager'>
                <Slider value={props.height}/>
                <Slider value={props.width}/>
            </div>)
}