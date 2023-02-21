import './css/Tile.css';

import { useEffect, useRef } from 'react';
import { TileInterfaces } from '../logic/interfaces';

import TileLogic = TileInterfaces.TileLogic;


function BaseTile (props : TileInterfaces.BaseTileProps) {

    const color = props.black ? 'black' : 'white';
    const passable = props.passable === false ? 'unpassable' : 'passable';

    return <div ref={props.tileRef} className={`Tile ${color} ${passable} ${props.additionalClassName}`}>
        {props.children}
    </div>
}

export function SensibleTile (props : TileInterfaces.SensibleTileProps) {
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
        }, [props])

    return <BaseTile tileRef={tileRef} passable={props.passable} black={props.black}>{props.children}</BaseTile>
}

export function DisplayTile (props : TileInterfaces.DisplayTileProps) {
    const tileRef = useRef<HTMLDivElement>(null);

    let tileLogic : string;

    switch(props.tileLogic ?? TileLogic.notFound) {
        case TileLogic.notFound :
            tileLogic = '';
            break;
        case TileLogic.found : 
            tileLogic = 'found';
            break;
        case TileLogic.visited : 
            tileLogic = 'visited';
            break;
        case TileLogic.road : 
            tileLogic='road';
            break;
        default : 
            tileLogic='';
            break;
    }

    return <BaseTile additionalClassName={tileLogic} tileRef={tileRef} passable={props.passable} black={props.black}>{props.children}</BaseTile>
}