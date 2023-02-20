import './css/Board.css';
import { useState, useEffect, useRef, useMemo } from "react";
import useHTMLElementSizes from '../hooks/useHTMLElementSizes';
import { HTMLElementSizes, BoardInterfaces, TileInterfaces, ChessPieceInterface, ArrowScopeInterface } from "../logic/interfaces";
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
import { start } from 'repl';


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
    });

    let width: number, height : number;
    if (props.height > props.width) {
        height = size;
        width = size * props.width / props.height;
    } else {
        width = size;
        height = size * props.height / props.width;
    }

    return (
        <div className="Board" 
             ref={props.boardRef} 
             style={{
                gridTemplate : `repeat(${props.height}, 1fr) / repeat(${props.width}, 1fr)`, 
                width : `${width}px`, 
                height : `${height}px`}}>
                {createBoard()}
        </div>
    )
}

// Extensions after that

export function MovableBoard (props : BoardInterfaces.MovableBoardProps) {

    const {flagPosition, knightPosition} = props.settings;
    
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
    
            const stepUp = sizes.height / props.settings.height;
            const stepRight = sizes.width / props.settings.width;
    
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

        const {setFlagPosition, setKnightPosition} = props.settings;

        if (isFlagMoving) {

            const handleOnMouseUp = (event : Event) => {
                setFlagMoving(false);
                const newPosition = calculatePositionOnBoard(sizes, new Position(
                    (event as MouseEvent).clientX,
                    (event as MouseEvent).clientY
                ));
                if (newPosition !== undefined) setFlagPosition(newPosition);
            }

            document.addEventListener('pointerup', handleOnMouseUp);
            return () => document.removeEventListener('pointerup', handleOnMouseUp);
        };

        if (isKnightMoving) {

            const handleOnMouseUp = (event : Event) => {
                setKnightMoving(false);
                const newPosition = calculatePositionOnBoard(sizes, new Position(
                    (event as MouseEvent).clientX,
                    (event as MouseEvent).clientY
                ));
                if (newPosition !== undefined) setKnightPosition(newPosition);
            }

            document.addEventListener('pointerup', handleOnMouseUp);
            return () => document.removeEventListener('pointerup', handleOnMouseUp);
        }
        
    }, [props, sizes, isFlagMoving, isKnightMoving]);


    const MovablePiece = (setMoving : (value: React.SetStateAction<boolean>) => void, sum : number, child :  (color: string) => JSX.Element) => {
        return <MovableChessPiece 
        onDragStart={(event : Event) => {
            setMoving(true)
        }}
        child={child}
        black={(sum) % 2 === 0}
        ></MovableChessPiece>
    }

    return (
        <div>
            <BaseBoard boardRef={boardRef} 
            height={props.settings.height} width={props.settings.width} getPassability={props.settings.getPassability} knightPosition={props.settings.knightPosition} flagPosition={props.settings.flagPosition}
            createTile={
                (passable, pos, child) => 
                <SensibleTile 
                    key={`${pos.x},${pos.y}`} 
                    black={(pos.x + pos.y) % 2 === 1}
                    passable={passable}>
                    {child}
                </SensibleTile>                
            }
            createPiece={(pos) => {
                if (Position.same(pos, knightPosition)) return MovablePiece(setKnightMoving, pos.x + pos.y, props.settings.pieceSVG)
                else if (Position.same(pos, flagPosition))  return MovablePiece(setFlagMoving, pos.x + pos.y, ChessPieceInterface.FlagSVG)
                else return undefined;
            }}/>
        </div>
            )
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
            if (Position.same(position, props.settings.flagPosition) || Position.same(position, props.settings.knightPosition)) return;

            if (penState === PenState.Inactive) {
                setPenState( props.settings.getPassability(position) ? PenState.DrawImpassable : PenState.DrawPassable )
                props.settings.setPassability(position, !props.settings.getPassability(position));
            }
        }
    }

    const createTileHadleOnMouseEnter = (position : Position) => {
        return (event : Event) => {
            if (event.target !== event.currentTarget) return;
            if (Position.same(position, props.settings.flagPosition) || Position.same(position, props.settings.knightPosition)) return;

            if (penState !== PenState.Inactive) {
                props.settings.setPassability(position, penState === PenState.DrawPassable ? true : false);
            }
        }
    }

    const createTileHadleOnMouseUp = () => () => {setPenState(PenState.Inactive)}

    const boardRef = useRef<HTMLDivElement>(null);

    return <BaseBoard boardRef={boardRef}
            height={props.settings.height} width={props.settings.width} getPassability={props.settings.getPassability} knightPosition={props.settings.knightPosition} flagPosition={props.settings.flagPosition}
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
                if (Position.same(pos, props.settings.knightPosition)) return <ChessPiece child={props.settings.pieceSVG} black={(pos.x + pos.y) % 2 === 0}/>
                else if (Position.same(pos, props.settings.flagPosition)) return <ChessPiece child={ChessPieceInterface.FlagSVG} black={(pos.x + pos.y) % 2 === 0}/>
                else return undefined;
            }}/>
}

export function DisplayBoard ({settings} : BoardInterfaces.DisplayBoardProps) {

    interface IteResult {
        result: SearchResult;
        from?: ChessPointers.BasicPointer | undefined;
        to?: ChessPointers.BasicPointer | undefined;
    }

    const width = settings.passabilityMap.width;
    const height = settings.passabilityMap.height;

    const [tileLogicMapping, setTileLogicMapping] = useState(new Mapping2D<TileLogic>(height, width, TileLogic.notFound))

    const iterationBoard = useMemo(() => {

        const logicBoard = new Board(height, width);

        console.log({passability : settings.passabilityMap.arr, logicBoard : logicBoard.squares})
        logicBoard.setPassability(settings.passabilityMap.arr);

        return logicBoard;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [settings.passabilityMap, settings.algorithm, settings.piecePointer]);

    const iterate = useMemo(() => {
        const startPosition = settings.piecePointer(settings.knightPosition.x, settings.knightPosition.y, iterationBoard);
        const endPosition = settings.piecePointer(settings.flagPosition.x, settings.flagPosition.y, iterationBoard);

        console.log(startPosition);

        return settings.algorithm(startPosition, endPosition);
    }, [settings.flagPosition, settings.knightPosition, settings.algorithm, iterationBoard, settings])

    const [searchResult, setSearchResult] = useState<IteResult>();

    const [arrows, setArrows] = useState<ArrowScopeInterface.Line[]>([]);
    const [shadows, setShadows] = useState<Position[]>([]);

    const boardRef = useRef<HTMLDivElement>(null);
    const scopeRef = useRef<HTMLDivElement>(null);

    // Iterate on press and/or on interval
    useEffect(() => {
        if (searchResult !== undefined && searchResult.result !== SearchResult.SearchContinues) return;
        const scope = scopeRef.current;

        const ite = () => {
            setSearchResult(iterate());
        }

        scope?.addEventListener('click', ite);
        const id = setTimeout(ite, 200);

        return () => {
            scope?.removeEventListener('click', ite);
            clearTimeout(id);
        }
    }, [iterate, searchResult]);

    // Display Changes
    useEffect(() => {
        if (searchResult === undefined) return;

        const {from, to, result} = searchResult;

        if (result === SearchResult.SearchContinues) {

            // Color just visited square
            setTileLogicMapping((prevMapping) => {
                const ans = prevMapping.copy();
                const newlyVisited = (to as ChessPointers.BasicPointer);

                ans.setAt( new Position(newlyVisited.x, newlyVisited.y), TileLogic.visited);
                return ans;
            });

            // Color squares that were just found
            setTileLogicMapping ((prevLogic) => {
                const ans = prevLogic.copy();
    
                iterationBoard.forEach((square, x, y) => {
                    const currentPosition = new Position(x, y);
    
                    if (ans.safeAt(currentPosition, TileLogic.notFound) === TileLogic.notFound 
                            && square.distanceFromStart !== undefined) ans.setAt(currentPosition, TileLogic.found);
    
                });
    
                return ans;
            });

            // Draw Arrow and Shadow to the square that was just visited
            if (from !== undefined && to !== undefined) {
                setArrows([
                    {from : new Position(from.x, from.y), to : new Position(to.x, to.y)}
                ])
                setShadows([new Position(from.x, from.y)]);
            }

        }
        else if (result === SearchResult.TargetFound) {

            // Color squares in Path from flag to the knight
            setTileLogicMapping((prevMapping) => {
                const ans = prevMapping.copy();
    
                let chessPointer : ChessPointers.BasicPointer | undefined = 
                    settings.piecePointer(settings.flagPosition.x, settings.flagPosition.y, iterationBoard);
    
                while (chessPointer !== undefined) {
    
                    ans.setAt(new Position(chessPointer.x, chessPointer.y), TileLogic.road);
    
                    chessPointer = chessPointer.at().shortestPath;
    
                }
    
                return ans;
            });

            // Draw Shadows and arrows for path
            let pos : ChessPointers.BasicPointer = 
                settings.piecePointer(settings.flagPosition.x, settings.flagPosition.y, iterationBoard);
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
        else {

        }

    }, [iterationBoard, settings.flagPosition.x, settings.flagPosition.y, searchResult, settings.piecePointer])

    // Make sure full reset on change of props
    useEffect (() => {
        console.log('fullreset')
        setTileLogicMapping((prev) => {
            const ans = new Mapping2D<TileLogic>(height, width, TileLogic.notFound)
            console.log(ans);
            return ans
        })
        setArrows([]);
        setShadows([]);
        setSearchResult(undefined);
    }, [height, width, settings.algorithm, settings.piecePointer])
    
    return <ArrowScope scopeRef={scopeRef} height={height} width={width} arrows={arrows}>
        <BaseBoard boardRef={boardRef}
            height={height} width={width} getPassability={settings.getPassability} knightPosition={settings.knightPosition} flagPosition={settings.flagPosition}
            createTile={
                (passable, pos, child) => 
                <DisplayTile
                    key={`${pos.x},${pos.y}`}
                    black={(pos.x + pos.y) % 2 === 1}
                    passable={passable}
                    // Save "At()""
                    tileLogic={tileLogicMapping.safeAt(pos, TileLogic.notFound)}>
                    {child}
                </DisplayTile>
            }
            createPiece={(pos) => {
                if (Position.same(pos, settings.knightPosition)) return <ChessPiece child={settings.pieceSVG} black={(pos.x + pos.y) % 2 === 0}/>
                if (Position.same(pos, settings.flagPosition)) return <ChessPiece child={ChessPieceInterface.FlagSVG} black={(pos.x + pos.y) % 2 === 0}/>
                for (let i = 0; i < shadows.length; i++) {
                    if (Position.same(pos, shadows[i])) return <ChessPiece 
                    child={(color : string) => settings.pieceSVG(color, 0.5)} 
                    black={(settings.knightPosition.x + settings.knightPosition.y) % 2 === 0}/>
                }}}/>
        </ArrowScope>
}