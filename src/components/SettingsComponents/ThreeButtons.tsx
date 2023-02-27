import {SettingsManagerInterface } from "../../logic/interfaces";

export function ThreeButtons ({value, toggle} : SettingsManagerInterface.ButtonsProps) {
    return (<div className='ThreeButtons'>
        <div className='label'></div>
        <div className='wrapper'>
            <button className={value === 0 ? 'active' : ''} onClick={toggle[0]}>Iterate</button>
            <button className={value === 1 ? 'active' : ''} onClick={toggle[1]}>Draw</button>
            <button className={value === 2 ? 'active' : ''} onClick={toggle[2]}>Move</button>
        </div>
    </div>)
}