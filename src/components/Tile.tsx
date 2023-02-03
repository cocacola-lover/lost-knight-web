import './css/Tile.css';
import { useEffect, useRef } from 'react';

interface BaseTileProps {
    black? : boolean
    children? : any
    tileRef? : React.RefObject<HTMLDivElement>
    passable? : boolean
}


function BaseTile (props : BaseTileProps) {

    const color = props.black ? 'black' : 'white';
    const passable = props.passable === false ? 'unpassable' : 'passable';

    return <div ref={props.tileRef} className={`Tile ${color} ${passable}`}>
        {props.children}
    </div>
}

interface SensibleTileProps {
    onDragEnter? : (event : DragEvent) => void
    onMouseDown? : (event : Event) => void
    onMouseEnter? : (event : Event) => void
    onMouseUp? : (event : Event) => void
    black? : boolean
    passable? : boolean
    children? : any
}

export function SensibleTile (props : SensibleTileProps) {
    const tileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const {onDragEnter, onMouseDown, onMouseEnter, onMouseUp} = props;
        const tile = tileRef.current
        if (onDragEnter !== undefined) tile?.addEventListener("dragenter", onDragEnter);
        if (onMouseEnter !== undefined) tile?.addEventListener("mouseenter", onMouseEnter);
        if (onMouseDown !== undefined) tile?.addEventListener("mousedown", onMouseDown);
        if (onMouseUp !== undefined) tile?.addEventListener("mouseup", onMouseUp);

        return () => {
            if (onDragEnter !== undefined) tile?.removeEventListener("dragenter", onDragEnter);
            if (onMouseEnter !== undefined) tile?.removeEventListener("mouseenter", onMouseEnter);
            if (onMouseDown !== undefined) tile?.removeEventListener("mousedown", onMouseDown);
            if (onMouseUp !== undefined) tile?.removeEventListener("mouseup", onMouseUp);
        }
        })

    return <BaseTile tileRef={tileRef} passable={props.passable} black={props.black}>{props.children}</BaseTile>
}