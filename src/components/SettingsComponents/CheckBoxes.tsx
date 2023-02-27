import { ChangeEvent } from "react";
import { SettingsManagerInterface } from "../../logic/interfaces";

export function CheckBoxes ({values, toggleOnKey} : SettingsManagerInterface.CheckBoxesProps) {
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