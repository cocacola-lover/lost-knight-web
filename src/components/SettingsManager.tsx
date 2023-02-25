import React, { ChangeEvent, useRef, useState } from 'react';
import './css/SettingsManager.css';

import { SettingsManagerInterface, Settings } from '../logic/interfaces';

import Actions = Settings.ActionTypes;
import Algorithm = Settings.Algorithm;

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

function CheckBoxes ({values, toggleOnKey} : SettingsManagerInterface.CheckBoxesProps) {
    return (
        <div>
            {(function createCheckBoxes () {

                const ans : JSX.Element[] = []

                for (const [key, value] of Object.entries(values)) {

                    const onClick = (event : ChangeEvent) => {
                        toggleOnKey(key, (event.target as HTMLInputElement).checked);
                    }

                    ans.push((
                        <div key={key}>
                            <input type="checkbox" id={`checkbox ${key}`} checked={!!value} onChange={onClick}/>
                            <label htmlFor={`checkbox ${key}`}>{key}</label>
                        </div>
                    ));
                }

                return ans;
            })()}
        </div>
    )
}

function SelectAlgorithm (props : SettingsManagerInterface.SelectAlgorithmProps) {

    const selectRef = useRef<HTMLSelectElement>(null);
    const [displayCheckBoxes, setDisplayCheckBoxes] = useState<boolean>(true)

    const onChange = () => {
        if (selectRef.current === null) return;

        const newInput = Number(selectRef.current.selectedOptions[0].value);

        props.choose(newInput);

        if (newInput === Algorithm.Dijkstra) setDisplayCheckBoxes(true);
        else setDisplayCheckBoxes(false);
    }

    return (<div><select ref={selectRef} name='Algorithm' onChange={onChange}>
        <option value={Algorithm.Dijkstra}>{props.options[Algorithm.Dijkstra]}</option>
        <option value={Algorithm.DeepFirstSearch}>{props.options[Algorithm.DeepFirstSearch]}</option>
        <option value={Algorithm.Greedy}>{props.options[Algorithm.Greedy]}</option>
        <option value={Algorithm.AStar}>{props.options[Algorithm.AStar]}</option>
    </select>
    {
        (function CreateCheckBoxesForWeights () {
            if (!displayCheckBoxes) return;
            return <CheckBoxes 
            values={props.settings}
            toggleOnKey={props.toggleCheckBoxes}/>
        })()
    }
    </div>)
}

function SelectPiece (props : SettingsManagerInterface.SelectProps) {
    const selectRef = useRef<HTMLSelectElement>(null);

    const onChange = () => {
        if (selectRef.current === null) return;
        props.choose(Number(selectRef.current.selectedOptions[0].value));
    }
    return (<select ref={selectRef} name='Piece' onChange={onChange}>
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

    const weightToggle = (key : string, value : boolean) => {
        dispatch({
            type : Actions.SetWeights,
            payload :  (Object.assign({}, settings.weightSettings, {
                [key] : value
            })) as Settings.WeightSettings
        })
    }

    return (<div className='SettingsManager'>
                <ThreeButtons value={props.boardState} toggle={props.toggle}></ThreeButtons>
                <Slider value={settings.height} onChange={sliderOnChangeHeight}/>
                <Slider value={settings.width} onChange={sliderOnChangeWidth}/>
                <SelectAlgorithm
                settings={settings.weightSettings}
                toggleCheckBoxes={weightToggle}
                options={Settings.algorithmNames} 
                choose={algorithmsChoose}/>
                <SelectPiece 
                options={Settings.pieceNames} 
                choose={characterChoose}/>
            </div>)
}