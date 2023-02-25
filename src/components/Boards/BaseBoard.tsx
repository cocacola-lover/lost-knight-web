import './../css/Board.css';
import { BoardInterfaces, TileInterfaces } from '../../logic/interfaces';

import { useEffect } from 'react';

import Position from '../../logic/position';

import BaseBoardInterfaces = BoardInterfaces.BaseBoard;
import TileLogic = TileInterfaces.TileLogic;


const size = 'min(90vh, 60vw)';

export default function BaseBoard ({settings, boardRef, createPiece, createTile, className} : BaseBoardInterfaces.Props) {

    const {height, width} = settings;

    const getPassability = (position : Position) => {
        return settings.boardLogic.at(position) !== TileLogic.unpassable;
    }

    const createBoard = () => {
        const ans : JSX.Element[][] = [];

        for (let i = 0; i < height; i++){
            ans.push([]);
            for (let j = 0; j < width; j++) {

                const position = new Position(j, i);

                ans[i].push(
                    createTile(
                        getPassability(position), 
                        position,
                        createPiece(position)
                        )
                );
            }
        }
        return ans;
    }

    // Weird drag bug prevention
    useEffect(() => {
        if (boardRef === undefined) return;
        const board = boardRef.current;

        const preventDragOrAnimation = (e : Event) => e.preventDefault();
        
        board?.addEventListener("dragstart", preventDragOrAnimation);
        board?.addEventListener("dragover", preventDragOrAnimation);
        return () => {
            board?.removeEventListener("dragstart", preventDragOrAnimation);
            board?.removeEventListener("dragover", preventDragOrAnimation);
        }
    });

    let pxWidth: string, pxHeight : string;
    if (height > width) {
        pxHeight = size;
        pxWidth = `calc(${size} * ${width / height})`;
    } else {
        pxWidth = size;
        pxHeight = `calc(${size} * ${height / width})`;
    }

    return (
        <div className={`Board ${className === undefined ? '' : className}`} 
             ref={boardRef} 
             style={{
                gridTemplate : `repeat(${height}, 1fr) / repeat(${width}, 1fr)`, 
                height : pxHeight, width : pxWidth}}>
                {createBoard()}
        </div>
    )
}