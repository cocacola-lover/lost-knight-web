import './css/Board.css';
import { useState, useEffect, useRef } from "react";
import { BoardInterfaces, TileInterfaces, ChessPieceInterface, ArrowScopeInterface } from "../logic/interfaces";
import TileLogic = TileInterfaces.TileLogic;

// Components
import { SensibleTile, DisplayTile } from "./Tile";
import { ChessPiece, MovableChessPiece } from "./ChessPiece";
import ArrowScope from './ArrowScope';

// Logic
import Mapping2D from '../logic/mapping2d';
import Position from "../logic/position";

// Knigth-Path-finding Logic
import { Board, ChessPointers, PathFindingIterators, SearchResult } from '@cocacola-lover/knight_path_finder';


import iterator = PathFindingIterators.dijkstraSearchIterator;
const createPointer = 'createKnightPointer';

const size = 600;


// Base function

function BaseBoard (props : BoardInterfaces.BaseBoardProps) {

    const createBoard = () => {
        const ans : JSX.Element[][] = [];

        for (let i = 0; i < props.height; i++){
            ans.push([]);
            for (let j = 0; j < props.width; j++) {

                const position = new Position(j, i);

                ans[i].push(
                    props.createTile(
                        props.getPassability(position), 
                        position,
                        props.createPiece(position)
                        )
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
    )
}

// Extensions after that

export function MovableBoard (props : BoardInterfaces.MovableBoardProps) {

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
                (passable, pos, child) => 
                <SensibleTile 
                    key={`${pos.x},${pos.y}`} 
                    onDragEnter={() => {setShadow(pos)}}
                    black={(pos.x + pos.y) % 2 === 1}
                    passable={passable}>
                    {child}
                </SensibleTile>                
            }
            createPiece={(pos) => {
                if (Position.same(pos, knightPosition)) return MovablePiece(setKnightMoving, pos.x + pos.y, ChessPieceInterface.KnightSVG)
                else if (Position.same(pos, flagPosition))  return MovablePiece(setFlagMoving, pos.x + pos.y, ChessPieceInterface.FlagSVG)
                else return undefined;
            }}/>
}

export function DrawableBoard (props : BoardInterfaces.DrawableBoardProps) {

    enum PenState {
        Inactive,
        DrawPassable,
        DrawImpassable
    }

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

    const createTileHadleOnMouseUp = () => () => {setPenState(PenState.Inactive)}

    const boardRef = useRef<HTMLDivElement>(null);

    return <BaseBoard boardRef={boardRef}
            height={props.height} width={props.width} getPassability={props.getPassability} knightPosition={props.knightPosition} flagPosition={props.flagPosition}
            createTile={
                (passable, pos, child) => 
                <SensibleTile
                    key={`${pos.x},${pos.y}`}
                    black={(pos.x + pos.y) % 2 === 1}
                    onMouseDown={createTileHadleOnMouseDown(pos)}
                    onMouseUp={createTileHadleOnMouseUp()}
                    onMouseEnter={createTileHadleOnMouseEnter(pos)}
                    passable={passable}>
                    {child}
                </SensibleTile>
            }
            createPiece={(pos) => {
                if (Position.same(pos, props.knightPosition)) return <ChessPiece child={ChessPieceInterface.KnightSVG} black={(pos.x + pos.y) % 2 === 0}/>
                else if (Position.same(pos, props.flagPosition)) return <ChessPiece child={ChessPieceInterface.FlagSVG} black={(pos.x + pos.y) % 2 === 0}/>
                else return undefined;
            }}/>
}

export function DisplayBoard (props : BoardInterfaces.DisplayBoardProps) {

    const {width, height} = props;

    const [tileLogicMapping, setTileLogicMapping] = useState(new Mapping2D<TileLogic>(height, width, TileLogic.notFound))
    const [arrows, setArrows] = useState<ArrowScopeInterface.Line[]>([]);
    const [shadows, setShadows] = useState<Position[]>([]);

    const boardRef = useRef<HTMLDivElement>(null);
    const scopeRef = useRef<HTMLDivElement>(null);


    useEffect(() => {

        const {width, height, knightPosition, flagPosition} = props;
        const scope = scopeRef.current;

        const logicBoard = new Board(height, width);

        const startPosition = logicBoard[createPointer](knightPosition.x, knightPosition.y);
        const endPosition = logicBoard[createPointer](flagPosition.x, flagPosition.y);

        const ite = iterator(startPosition, endPosition);

        const iterateDisplay = () => {

            const addFound = () => setTileLogicMapping ((prevLogic) => {
                const ans = prevLogic.copy();
    
                logicBoard.forEach((square, x, y) => {
                    const currentPosition = new Position(x, y);
    
                    if (ans.at(currentPosition) === TileLogic.notFound 
                            && square.distanceFromStart !== undefined) ans.setAt(currentPosition, TileLogic.found);
    
                });
    
                return ans;
                });
    
            const addVisited = (newVisited : ChessPointers.BasicPointer) => setTileLogicMapping((prevMapping) => {
                    const ans = prevMapping.copy();
    
                    ans.setAt( new Position(newVisited.x, newVisited.y), TileLogic.visited);
                    return ans;
                });
    
            const addRoad = () => setTileLogicMapping((prevMapping) => {
                const ans = prevMapping.copy();
    
                let chessPointer : ChessPointers.BasicPointer | undefined = endPosition;
    
                while (chessPointer !== undefined) {
    
                    ans.setAt(new Position(chessPointer.x, chessPointer.y), TileLogic.road);
    
                    chessPointer = chessPointer.at().shortestPath;
    
                }
    
                return ans;
            });
            
            const drawArrowForVisited = (from : ChessPointers.BasicPointer | undefined, to : ChessPointers.BasicPointer | undefined) => {
                if (from !== undefined && to !== undefined) {
                    setArrows([
                        {from : new Position(from.x, from.y), to : new Position(to.x, to.y)}
                    ])
                    setShadows([new Position(from.x, from.y)]);
                }
            }

            const drawArrowRoad = () => {
                let pos : ChessPointers.BasicPointer = endPosition;
                const roadArrows = [];
                const roadShadows = []

                while (pos.at().shortestPath !== undefined) {
                    roadArrows.push(
                        {
                            to : new Position(pos.x, pos.y), 
                            from : new Position(pos.at().shortestPath!.x, pos.at().shortestPath!.y)
                        }
                    )
                    if (pos.at().shortestPath === undefined) break;
                    else {
                        pos = pos.at().shortestPath as ChessPointers.BasicPointer;
                        roadShadows.push(new Position(pos.x, pos.y));
                    }
                }
                setArrows(roadArrows);
                setShadows(roadShadows);
            }


            const ans = ite();

            switch (ans.result) {
                case SearchResult.SearchContinues :
                    addVisited(ans.to as ChessPointers.BasicPointer);
                    addFound();
                    drawArrowForVisited(ans.from, ans.to)
                    break;
                case SearchResult.TargetFound : 
                    addRoad();
                    drawArrowRoad();
                    break;
                case SearchResult.TargetNotFound : 
                    break
            }
            
        }

        scope?.addEventListener('click', iterateDisplay);

        return () => scope?.removeEventListener('click', iterateDisplay);
    }, [props])
    
    return <ArrowScope scopeRef={scopeRef} height={props.height} width={props.width} arrows={arrows}>
        <BaseBoard boardRef={boardRef}
            height={props.height} width={props.width} getPassability={props.getPassability} knightPosition={props.knightPosition} flagPosition={props.flagPosition}
            createTile={
                (passable, pos, child) => 
                <DisplayTile
                    key={`${pos.x},${pos.y}`}
                    black={(pos.x + pos.y) % 2 === 1}
                    passable={passable}
                    tileLogic={tileLogicMapping.at(pos)}>
                    {child}
                </DisplayTile>
            }
            createPiece={(pos) => {
                if (Position.same(pos, props.knightPosition)) return <ChessPiece child={ChessPieceInterface.KnightSVG} black={(pos.x + pos.y) % 2 === 0}/>
                if (Position.same(pos, props.flagPosition)) return <ChessPiece child={ChessPieceInterface.FlagSVG} black={(pos.x + pos.y) % 2 === 0}/>
                for (let i = 0; i < shadows.length; i++) {
                    if (Position.same(pos, shadows[i])) return <ChessPiece 
                    child={(color : string) => ChessPieceInterface.KnightSVG(color, 0.5)} 
                    black={(props.knightPosition.x + props.knightPosition.y) % 2 === 0}/>
                }}}/>
        </ArrowScope>
}