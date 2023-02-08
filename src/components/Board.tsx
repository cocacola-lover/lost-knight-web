import { useState, useEffect, useRef } from "react";

import { SensibleTile, DisplayTile, TileLogic } from "./Tile";
import { ChessPiece, MovableChessPiece, KnightSVG, FlagSVG } from "./ChessPiece";
import { Board, ChessPointer, dijkstraSearchIterator, deepFirstSearchIterator, SearchResult } from '@cocacola-lover/knight_path_finder';
import Mapping2D from '../logic/mapping2d';


import Position from "../logic/position";

import './css/Board.css';

const size = 600;

interface BaseBoardProps {
    height : number
    width : number
    getPassability : (position : Position) => boolean
    knightPosition : Position
    flagPosition : Position
    boardRef? : React.RefObject<HTMLDivElement>
    createTile : (passable : boolean, pos: Position) => JSX.Element

}

// Base function

function BaseBoard (props : BaseBoardProps) {

    const createBoard = () => {
        const ans = [];
        for (let i = 0; i < props.height; i++){
            ans.push([]);
            for (let j = 0; j < props.width; j++) {
                const position = new Position(j, i);
                ans.push(
                    props.createTile(props.getPassability(position), position)
                );
            }
        }
        return ans;
    }

    // Weird drag bug prevention
    useEffect(() => {
        if (props.boardRef === undefined) return;
        const board = props.boardRef.current;

        const preventDragOrAnimation = (e : Event) => e.preventDefault();
        
        board?.addEventListener("dragstart", preventDragOrAnimation);
        board?.addEventListener("dragover", preventDragOrAnimation);
        return () => {
            board?.removeEventListener("dragstart", preventDragOrAnimation);
            board?.removeEventListener("dragover", preventDragOrAnimation);
        }
    })

    return (
        <div className="Board" 
             ref={props.boardRef} 
             style={{gridTemplate : `repeat(${props.height}, 1fr) / repeat(${props.width}, 1fr)`, width : `${size}px`, height : `${size * props.height / props.width}px`}}>
                {createBoard()}
        </div>
        )}

// Extensions after that

interface MovableBoardProps {
    height : number,
    width : number,
    getPassability : (position : Position) => boolean
    knightPosition : Position
    flagPosition : Position
    setKnightPosition : React.Dispatch<React.SetStateAction<Position>>
    setFlagPosition : React.Dispatch<React.SetStateAction<Position>>
}

export function MovableBoard (props : MovableBoardProps) {

    const {flagPosition, knightPosition, setFlagPosition, setKnightPosition} = props;
    const [shadow, setShadow] = useState<Position>(new Position(0, 0));
    const [dragBalance, setDragBalance] = useState<number>(0);

    const [isKnightMoving, setKnightMoving] = useState<boolean>(false);
    const [isFlagMoving, setFlagMoving] = useState<boolean>(false);

    
    const boardRef = useRef<HTMLDivElement>(null);

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

    return <BaseBoard boardRef={boardRef} 
            height={props.height} width={props.width} getPassability={props.getPassability} knightPosition={props.knightPosition} flagPosition={props.flagPosition}
            createTile={
                (passable, pos) => 
                <SensibleTile 
                    key={`${pos.x},${pos.y}`} 
                    onDragEnter={() => {setShadow(pos)}}
                    black={(pos.x + pos.y) % 2 === 1}
                    passable={passable}>

                    {/* Put knight and flag to their place */}

                    { 
                    Position.same(pos, knightPosition) ? 
                        MovablePiece(setKnightMoving, pos.x + pos.y, KnightSVG) : null
                    }

                    {
                    Position.same(pos, flagPosition) ? 
                        MovablePiece(setFlagMoving, pos.x + pos.y, FlagSVG) : null
                    }

                </SensibleTile>                
            }/>
}

interface DrawableBoardProps {
    height : number
    width : number
    knightPosition : Position
    flagPosition : Position
    getPassability : (position : Position) => boolean
    setPassability : (position : Position, value : boolean) => void
}

enum PenState {
    Inactive,
    DrawPassable,
    DrawImpassable
}

export function DrawableBoard (props : DrawableBoardProps) {

    const [penState, setPenState] = useState<PenState>(PenState.Inactive);

    const createTileHadleOnMouseDown = (position : Position) => {
        return (event : Event) => {
            if (event.target !== event.currentTarget) return;
            if (Position.same(position, props.flagPosition) || Position.same(position, props.knightPosition)) return;

            if (penState === PenState.Inactive) {
                setPenState( props.getPassability(position) ? PenState.DrawImpassable : PenState.DrawPassable )
                props.setPassability(position, !props.getPassability(position));
            }
        }
    }

    const createTileHadleOnMouseEnter = (position : Position) => {
        return (event : Event) => {
            if (event.target !== event.currentTarget) return;
            if (Position.same(position, props.flagPosition) || Position.same(position, props.knightPosition)) return;

            if (penState !== PenState.Inactive) {
                props.setPassability(position, penState === PenState.DrawPassable ? true : false);
            }
        }
    }

    const createTileHadleOnMouseUp = () => {
        return () => {
            setPenState(PenState.Inactive);
            }
    }

    const boardRef = useRef<HTMLDivElement>(null);

    return <BaseBoard boardRef={boardRef}
            height={props.height} width={props.width} getPassability={props.getPassability} knightPosition={props.knightPosition} flagPosition={props.flagPosition}
            createTile={
                (square, pos) => {
                    return <SensibleTile
                    key={`${pos.x},${pos.y}`}
                    black={(pos.x + pos.y) % 2 === 1}
                    onMouseDown={createTileHadleOnMouseDown(pos)}
                    onMouseUp={createTileHadleOnMouseUp()}
                    onMouseEnter={createTileHadleOnMouseEnter(pos)}
                    passable={props.getPassability(pos)}>

                    {/* Put knight and flag to their place */}

                    { 
                    Position.same(pos, props.knightPosition) ? 
                        <ChessPiece child={KnightSVG} black={(pos.x + pos.y) % 2 === 0}/> : null
                    }

                    {
                    Position.same(pos, props.flagPosition) ? 
                    <ChessPiece child={FlagSVG} black={(pos.x + pos.y) % 2 === 0}/> : null
                    }

                    </SensibleTile>
                }
            }/>
}

interface DisplayBoardProps {
    height : number
    width : number
    knightPosition : Position
    flagPosition : Position
    getPassability : (position : Position) => boolean
}

export function DisplayBoard (props : DisplayBoardProps) {

    const {width, height} = props;

    const [tileLogicMapping, setTileLogicMapping] = useState(new Mapping2D<TileLogic>(height, width, TileLogic.notFound))

    const boardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {

        const {width, height, knightPosition, flagPosition} = props;
        const board = boardRef.current;

        const logicBoard = new Board(height, width);

        const startPosition = new ChessPointer(
            knightPosition.x, knightPosition.y, logicBoard.squares);
        const endPosition = new ChessPointer(
            flagPosition.x, flagPosition.y, logicBoard.squares);

        const ite = dijkstraSearchIterator(startPosition, endPosition);

        const addFound = () => setTileLogicMapping ((prevLogic) => {
            const ans = prevLogic.copy();

            logicBoard.squares.forEach( (row, index1) => row.forEach((value, index2) => {
                const currentPosition = new Position(index1, index2);

                if (ans.at(currentPosition) === TileLogic.notFound) {
                    ans.setAt(
                        currentPosition, 
                        value.distanceFromStart !== undefined ? TileLogic.found : TileLogic.notFound
                    );}
                }));

            return ans;
            });

        const addVisited = (newVisited : ChessPointer) => setTileLogicMapping((prevMapping) => {
                const ans = prevMapping.copy();

                ans.setAt( new Position(newVisited.x, newVisited.y), TileLogic.visited);
                return ans;
            });

        const addRoad = () => setTileLogicMapping((prevMapping) => {
            const ans = prevMapping.copy();

            let chessPointer : ChessPointer | undefined = endPosition;

            while (chessPointer !== undefined) {

                ans.setAt(new Position(chessPointer.x, chessPointer.y), TileLogic.road);

                chessPointer = chessPointer.at().shortestPath;

            }

            return ans;
        });

        const iterateDisplay = () => {
            
            const ans = ite();

            console.log("iterate", ans)
            console.log(startPosition, endPosition);
            
            if (ans.result === SearchResult.SearchContinues) {
                addVisited(ans.to as ChessPointer);
                addFound();
            } else if (ans.result === SearchResult.TargetFound) {
                addRoad();
            }
            
        }

        board?.addEventListener('click', iterateDisplay);

        return () => board?.removeEventListener('click', iterateDisplay);
    }, [props])
    
    return <BaseBoard boardRef={boardRef}
            height={props.height} width={props.width} getPassability={props.getPassability} knightPosition={props.knightPosition} flagPosition={props.flagPosition}
            createTile={
                (passable, pos) => {

                    return <DisplayTile
                    key={`${pos.x},${pos.y}`}
                    black={(pos.x + pos.y) % 2 === 1}
                    passable={passable}
                    tileLogic={tileLogicMapping.at(pos)}>

                    {/* Put knight and flag to their place */}

                    { 
                    Position.same(pos, props.knightPosition) ? 
                        <ChessPiece child={KnightSVG} black={(pos.x + pos.y) % 2 === 0}/> : null
                    }

                    {
                    Position.same(pos, props.flagPosition) ? 
                    <ChessPiece child={FlagSVG} black={(pos.x + pos.y) % 2 === 0}/> : null
                    }

                    </DisplayTile>
                }
            }/>
}