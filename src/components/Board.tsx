import { useState, useEffect, useRef } from "react";

import { SensibleTile, DisplayTile, TileLogic } from "./Tile";
import { ChessPiece, MovableChessPiece, KnightSVG, FlagSVG } from "./ChessPiece";
import { Board, ChessPointer, dijkstraSearchIterator, SearchResult } from '@cocacola-lover/knight_path_finder';
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
                    key={`${pos.y},${pos.x}`} 
                    onDragEnter={() => {setShadow(pos)}}
                    black={(pos.y + pos.x) % 2 === 1}
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
                    key={`${pos.y},${pos.x}`}
                    black={(pos.y + pos.x) % 2 === 1}
                    onMouseDown={createTileHadleOnMouseDown(pos)}
                    onMouseUp={createTileHadleOnMouseUp()}
                    onMouseEnter={createTileHadleOnMouseEnter(pos)}
                    passable={props.getPassability(pos)}>

                    {/* Put knight and flag to their place */}

                    { 
                    Position.same(pos, props.knightPosition) ? 
                        <ChessPiece child={KnightSVG} black={(pos.y + pos.x) % 2 === 0}/> : null
                    }

                    {
                    Position.same(pos, props.flagPosition) ? 
                    <ChessPiece child={FlagSVG} black={(pos.y + pos.x) % 2 === 0}/> : null
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

    const [foundMapping, setFoundMapping] = useState(new Mapping2D<boolean>(height, width, false));
    const [visitedMapping, setVisitedMapping] = useState(new Mapping2D<boolean>(height, width, false));

    const boardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {

        console.log("Display board updating");

        const {width, height, knightPosition, flagPosition} = props;
        const board = boardRef.current;

        const logicBoard = new Board(width, height);
        const startPosition = new ChessPointer(
            knightPosition.y, knightPosition.x, logicBoard.squares);
        const endPosition = new ChessPointer(
            flagPosition.y, flagPosition.x, logicBoard.squares);

        const ite = dijkstraSearchIterator(startPosition, endPosition);

        const parceFound = () => {
            const ans = new Mapping2D<boolean>(height, width, false);

            logicBoard.squares.forEach((row, index1) => {
                row.forEach((value, index2) => {
                    ans.setAt(new Position(index1, index2), value.distanceFromStart !== undefined);
                })
            });

            setFoundMapping(ans);
        };

        const addVisited = (newVisited : ChessPointer) => {

            setVisitedMapping((prevMapping) => {
                const ans = prevMapping.copy();

                ans.setAt( new Position(newVisited.y, newVisited.x), true);
                return ans;

            });

        }

        const iterateDisplay = () => {
            
            const ans = ite();

            console.log("iterate", ans)
            console.log(startPosition, endPosition);
            
            if (ans.result === SearchResult.SearchContinues) {
                addVisited(ans.to as ChessPointer);
                parceFound();
            }
            
        }

        board?.addEventListener('click', iterateDisplay);

        return () => board?.removeEventListener('click', iterateDisplay);
    }, [props])
    
    return <BaseBoard boardRef={boardRef}
            height={props.height} width={props.width} getPassability={props.getPassability} knightPosition={props.knightPosition} flagPosition={props.flagPosition}
            createTile={
                (passable, pos) => {

                    let tileLogic = TileLogic.notFound;
                    if (foundMapping.at(pos)) tileLogic = TileLogic.found;
                    if (visitedMapping.at(pos)) tileLogic = TileLogic.visited;

                    return <DisplayTile
                    key={`${pos.y},${pos.x}`}
                    black={(pos.y + pos.x) % 2 === 1}
                    passable={passable}
                    tileLogic={tileLogic}>

                    {/* Put knight and flag to their place */}

                    { 
                    Position.same(pos, props.knightPosition) ? 
                        <ChessPiece child={KnightSVG} black={(pos.y + pos.x) % 2 === 0}/> : null
                    }

                    {
                    Position.same(pos, props.flagPosition) ? 
                    <ChessPiece child={FlagSVG} black={(pos.y + pos.x) % 2 === 0}/> : null
                    }

                    </DisplayTile>
                }
            }/>
}