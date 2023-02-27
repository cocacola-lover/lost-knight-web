import './../css/Board.css';
import { BoardInterfaces } from '../../logic/interfaces';

import { useEffect } from 'react';

import Position from '../../logic/position';

import BaseBoardInterfaces = BoardInterfaces.BaseBoard;

/*
    Constructor component for Boards. Needs createPiece and createTile function to build a board.
    Uses css functions to make Boards responsive
*/


const size = 'min(90vh, 60vw)';

export default function BaseBoard ({settings, boardRef, createPiece, createTile, className} : BaseBoardInterfaces.Props) {

    const {height, width} = settings;

    const createBoard = () => {
        const ans : JSX.Element[][] = [];

        for (let i = 0; i < height; i++){

            ans.push([]);

            for (let j = 0; j < width; j++) {

                const position = new Position(j, i);
                const tileLogic = settings.boardLogic.at(position);

                ans[i].push(
                    createTile(
                        tileLogic,
                        position,
                        createPiece(position)
                ));
            }
        }
        return ans;
    }

    // Firefox drag bug prevention
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

    let relativeWidth: string, relativeHeight : string;
    if (height > width) {
        relativeHeight = size;
        relativeWidth = `calc(${size} * ${width / height})`;
    } else {
        relativeWidth = size;
        relativeHeight = `calc(${size} * ${height / width})`;
    }

    return (
        <div className={`Board ${className === undefined ? '' : className}`} 
             ref={boardRef} 
             style={{
                gridTemplate : `repeat(${height}, 1fr) / repeat(${width}, 1fr)`, 
                height : relativeHeight, width : relativeWidth}}>
                {createBoard()}
        </div>
    )
}