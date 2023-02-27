import { ChangeEvent } from "react";
import { SettingsManagerInterface } from "../../logic/interfaces";

import Interfaces = SettingsManagerInterface.Sliders;

export function DimensionSlider ({value, onChange, label} : Interfaces.DimensionSliderProps) {

    const handleSlider : React.ChangeEventHandler<HTMLInputElement> = (event : ChangeEvent<HTMLInputElement>) => {
        onChange(Number((event.target as HTMLInputElement).value));
    }

    return <div className='Slider'>
        <div className='label'>{label}</div> 
        <div className="slidercontainer">
                <div className="sliderCounter"  
                    style={{left : `${(value - 2) * 5.3}%`}}>
                {value}</div>
                <input type="range" onChange={handleSlider}  min="2" max="20" value={value} className="slider"/>
        </div>
            </div>
}

export function VelocitySlider ({value, onChange, sliderValues, sliderLabels} : Interfaces.VelocitySliderProps) {
    
    const handleSlider : React.ChangeEventHandler<HTMLInputElement> = (event : ChangeEvent<HTMLInputElement>) => {
        onChange(sliderValues[Number((event.target as HTMLInputElement).value)]);
    }

    const valueIndex = sliderValues.findIndex((e) => e === value);

    return (<div className='Slider'>
        <div className='label'>{'Iteration Speed'}</div> 
        <div className='slidercontainer'>

            <div className="sliderCounterStatic">{ sliderLabels[valueIndex] }</div>
            
            <input type="range" onChange={handleSlider}  min="0" max={sliderValues.length - 1} value={valueIndex} className="slider"/>
        </div>
    </div>)
}