import React, { ChangeEvent, useRef } from 'react';
import './css/SettingsManager.css';



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

function Button (props : SettingsManagerInterface.ButtonProps) {
    return <button className={`${props.className} ${props.state.get ? 'active' : 'inactive'}`}
            onClick={props.state.toggle}>
                {props.className}
            </button>
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

    return (<div className='SettingManager'>
                <Button className='Iterate' state={props.iterate}></Button>
                <Button className='Draw' state={props.draw}></Button>
                <Slider value={props.height}/>
                <Slider value={props.width}/>
                <SelectAlgorithm 
                options={props.algorithmsNames} 
                choose={props.algorithmsChoose}/>
                <SelectAlgorithm 
                options={props.characterNames} 
                choose={props.characterChoose}/>
            </div>)
}