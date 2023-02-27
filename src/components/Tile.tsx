import './css/Tile.css';

import { useEffect, useRef } from 'react';
import { TileInterfaces } from '../logic/interfaces';

import chooseColor = TileInterfaces.chooseColor;
import tileClasses = TileInterfaces.tileClasses;

/*
    Tiles form grid of the Board.

    BaseTile is a base component that displays information about the tile.

    SensibleTile can mount some mouse listeners to itself.

    Note for future : Might want to change to pointer listeners.
*/

export function BaseTile (props : TileInterfaces.BaseTileProps) {

    let className = 'Tile ';
    className += chooseColor(props.black ?? false) + ' ';
    className += tileClasses[props.tileLogic] + ' ';
    className += props.additionalClassName ?? '';

    return <div ref={props.tileRef} className={className}>
        {props.children}
    </div>
}

export function SensibleTile (props : TileInterfaces.SensibleTileProps) {

    const tileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const {onMouseDown, onMouseEnter, onMouseUp} = props;
        const tile = tileRef.current
        if (onMouseEnter !== undefined) tile?.addEventListener("mouseenter", onMouseEnter);
        if (onMouseDown !== undefined) tile?.addEventListener("mousedown", onMouseDown);
        if (onMouseUp !== undefined) tile?.addEventListener("mouseup", onMouseUp);

        return () => {
            if (onMouseEnter !== undefined) tile?.removeEventListener("mouseenter", onMouseEnter);
            if (onMouseDown !== undefined) tile?.removeEventListener("mousedown", onMouseDown);
            if (onMouseUp !== undefined) tile?.removeEventListener("mouseup", onMouseUp);
        }
        }, [props])

    const {tileLogic, black, children} = props;

    return <BaseTile tileRef={tileRef} tileLogic={tileLogic} black={black}>
        {children}
    </BaseTile>
}
