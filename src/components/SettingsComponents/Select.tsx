import { useState, useRef } from "react";
import { Settings, SettingsManagerInterface } from "../../logic/interfaces";

import { CheckBoxes } from "./CheckBoxes";

import Interfaces = SettingsManagerInterface.Select;
import Algorithm = Settings.Enums.Algorithm;

export function SelectAlgorithm (props : Interfaces.SelectAlgorithmProps) {

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

export function SelectPiece (props : Interfaces.SelectProps) {

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