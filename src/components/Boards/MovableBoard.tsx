import BaseBoard from './BaseBoard';
import { MovableChessPiece } from '../ChessPiece';
import { SensibleTile } from '../Tile';
import useHTMLElementSizes from '../../hooks/useHTMLElementSizes';

import { BoardInterfaces, ChessPieceInterface, HTMLElementSizes, TileInterfaces } from '../../logic/interfaces';

import { useState, useEffect, useRef } from 'react';

import Position from '../../logic/position';

import Interface = BoardInterfaces.MovableBoard;
import Actions = Interface.ActionTypes;

/*
    MovableBoard allows to move pieces on the board.

    MovableChessPiece handles displaying the moving shadow. So MovableBoard just needs to place chess piece on mouseUp.
*/


export default function MovableBoard ({settings, dispatch} : Interface.Props) {

    const {flagPosition, knightPosition} = settings;
    
    const [isKnightMoving, setKnightMoving] = useState<boolean>(false);
    const [isFlagMoving, setFlagMoving] = useState<boolean>(false);
    
    const boardRef = useRef<HTMLDivElement>(null);
    const sizes = useHTMLElementSizes(boardRef);


    // Handle onMouseUp on board
    useEffect(() => {
        const calculatePositionOnBoard = (sizes : HTMLElementSizes, mousePosition : Position) => {

            const position = new Position(
                mousePosition.x - sizes.position.x,
                mousePosition.y - sizes.position.y
            );
            
            if (position.x < 0 || position.y < 0 
                || position.x > (sizes.width) 
                    || position.y > (sizes.height)) return undefined;
    
            const stepUp = sizes.height / settings.height;
            const stepRight = sizes.width / settings.width;
    
            let i = 0, j = 0;
            while (position.x > stepRight) {
                position.x -= stepRight;
                i++;
            }
            while (position.y > stepUp) {
                position.y -= stepUp;
                j++;
            }
            return new Position(i, j);
        }


        if (isFlagMoving || isKnightMoving) {

            const [setMoving, action] = isFlagMoving ? 
                        [setFlagMoving, Actions.SetFlagPosition] : 
                            [setKnightMoving, Actions.SetKnightPosition];

            const handleOnMouseUp = (event : Event) => {
                setMoving(false);
                const newPosition = calculatePositionOnBoard(sizes, new Position(
                    (event as MouseEvent).clientX,
                    (event as MouseEvent).clientY
                ));
                if (newPosition !== undefined 
                    && settings.boardLogic.at(newPosition) !== TileInterfaces.TileLogic.unpassable) dispatch({
                    type : action,
                    payload : newPosition
                });
            }

            document.addEventListener('pointerup', handleOnMouseUp);
            return () => document.removeEventListener('pointerup', handleOnMouseUp);
        };
        
    }, [settings, dispatch, sizes, isFlagMoving, isKnightMoving]);


    const MovablePiece = (setMoving : (value: React.SetStateAction<boolean>) => void, sum : number, child :  (color: string) => JSX.Element) => {
        return <MovableChessPiece 
        onDragStart={() => setMoving(true)}
        black={(sum) % 2 === 0}
        child={child}
        ></MovableChessPiece>
    }

    return (
            <BaseBoard boardRef={boardRef} className='MovableBoard'
            settings={settings}
            createTile={
                (tileLogic, pos, child) => 
                <SensibleTile 
                    key={`${pos.x},${pos.y}`} 
                    black={(pos.x + pos.y) % 2 === 1}
                    tileLogic={tileLogic}>
                    {child}
                </SensibleTile>                
            }
            createPiece={(pos) => {
                if (Position.same(pos, knightPosition)) return MovablePiece(setKnightMoving, pos.x + pos.y, settings.chessPiece.pieceSVG)
                else if (Position.same(pos, flagPosition))  return MovablePiece(setFlagMoving, pos.x + pos.y, ChessPieceInterface.SVGs.FlagSVG)
                else return undefined;
            }}/>
            )
}