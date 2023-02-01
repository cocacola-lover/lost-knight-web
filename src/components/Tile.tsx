import './css/Tile.css';
import { useEffect, useRef } from 'react';

interface BaseTileProps {
    black? : boolean
    children? : any
    tileRef? : React.RefObject<HTMLDivElement>
}


function BaseTile ({black, children, tileRef} : BaseTileProps) {

    const color = black ? "black" : "white";

    return <div ref={tileRef} className={`Tile ${color}`}>
        {children}
    </div>
}

interface SensibleTileProps {
    onDragEnter : () => void
    black? : boolean
    children? : any
}

export function SensibleTile (props : SensibleTileProps) {
    const tileRef = useRef<HTMLDivElement>(null);

    // On dragenter

    useEffect(() => {
            const tile = tileRef.current
            tile?.addEventListener("dragenter", props.onDragEnter);
            return () => tile?.removeEventListener("dragenter", props.onDragEnter);
        })

    return <BaseTile tileRef={tileRef} black={props.black}>{props.children}</BaseTile>
}