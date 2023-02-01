import { useState, useEffect, useRef } from "react";

import { SensibleTile } from "./Tile";
import { MovableChessPiece, KnightSVG, FlagSVG } from "./ChessPiece";
import Position from "../logic/position";

import './css/Board.css';

const size = 600;

interface Square {
    distanceFromStart : number | null,
    shortestPath : Square | null,
    isPassable : boolean,
    other : Object | null
}

interface BoardProps {
    height : number,
    width : number,
    squares : Square[][],
    knightPosition : Position
    flagPosition : Position
    setKnightPosition : React.Dispatch<React.SetStateAction<Position>>
    setFlagPosition : React.Dispatch<React.SetStateAction<Position>>
}

export default function Board (props : BoardProps) {

    const {flagPosition, knightPosition, setFlagPosition, setKnightPosition} = props;
    const [shadow, setShadow] = useState<Position>(new Position(0, 0));
    const [dragBalance, setDragBalance] = useState<number>(0);

    const [isKnightMoving, setKnightMoving] = useState<boolean>(false);
    const [isFlagMoving, setFlagMoving] = useState<boolean>(false);

    
    const boardRef = useRef<HTMLDivElement>(null);

    // Weird drag bug prevention
    useEffect(() => {
        const board = boardRef.current;

        const preventDragOrAnimation = (e : Event) => e.preventDefault();
        
        board?.addEventListener("dragstart", preventDragOrAnimation);
        board?.addEventListener("dragover", preventDragOrAnimation);
        return () => {
            board?.removeEventListener("dragstart", preventDragOrAnimation);
            board?.removeEventListener("dragover", preventDragOrAnimation);
        }
    })

    // Watching for DragBalance
    useEffect( () => {
        const board = boardRef.current;
        const balanceUp = () => setDragBalance(prev => prev+1);
        const balanceDown = () => setDragBalance(prev => prev-1);

        board?.addEventListener("dragenter", balanceUp);
        board?.addEventListener("dragleave", balanceDown);

        return () => {
            board?.removeEventListener("dragenter", balanceUp);
            board?.removeEventListener("dragleave", balanceDown);
        }
    }, [dragBalance])

    //Following the Shadow
    useEffect(() => {
        const board = boardRef.current;

        const resultOfDrag = () => {
            if (isKnightMoving) {
                if (dragBalance === 1 && !Position.same(flagPosition, shadow)) setKnightPosition(shadow.copy());
            }
            if (isFlagMoving) {
                if (dragBalance === 1 && !Position.same(knightPosition, shadow)) setFlagPosition(shadow.copy());
            }
            setKnightMoving(false); setFlagMoving(false);
            setDragBalance(0);
        }

        board?.addEventListener("dragend", resultOfDrag);
        return () => board?.removeEventListener("dragend", resultOfDrag);
    })

    // Creating My ChessPieces
    const MovablePiece = (setMoving : (value: React.SetStateAction<boolean>) => void, sum : number, child :  (color: string) => JSX.Element) => {
        return <MovableChessPiece 
        onDragStart={(event : DragEvent) => {
            event.stopPropagation();
            setMoving(true)
        }}
        child={child}
        black={(sum) % 2 === 0}
        ></MovableChessPiece>
    }

    return (
    <div ref={boardRef} className="Board" 
        style={
                {gridTemplate : `repeat(${props.height}, 1fr) / repeat(${props.width}, 1fr)`,
                width : `${size}px`, height : `${size * props.height / props.width}px`}
                }>

            {props.squares.map((row, index1) => row.map((square, index2) => {

            const tilePosition = new Position(index1, index2);

            // Build tiles for the board

            return <SensibleTile 
            key={`${index1},${index2}`} 
            onDragEnter={() => {setShadow(tilePosition)}}
            black={(index1 + index2) % 2 === 1}>

                {/* Put knight and flag to their place */}

                { 
                Position.same(tilePosition, knightPosition) ? 
                    MovablePiece(setKnightMoving, index1 + index2, KnightSVG) : null
                }

                {
                Position.same(tilePosition, flagPosition) ? 
                    MovablePiece(setFlagMoving, index1 + index2, FlagSVG) : null
                }
            </SensibleTile>
        }))}
    </div>)

}