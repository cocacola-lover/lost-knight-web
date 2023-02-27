import BaseBoard from './BaseBoard';
import { ChessPiece } from '../ChessPiece';
import { DisplayTile } from '../Tile';
import ArrowScope from '../ArrowScope';

import { BoardInterfaces, ChessPieceInterface, TileInterfaces, ArrowScopeInterface } from '../../logic/interfaces';

import { useState, useRef, useMemo, useEffect } from 'react';

import Position from '../../logic/position';
import Mapping2D from '../../logic/mapping2d';

import { createWeightMap } from '../../logic/weightMap';
import { Board, ChessPointers, SearchResult } from '@cocacola-lover/knight_path_finder';

import DisplayBoardInterfaces = BoardInterfaces.DisplayBoard;
import TileLogic = TileInterfaces.TileLogic;


export default function DisplayBoard ({settings, dispatch} : DisplayBoardInterfaces.Props) {

    interface IteResult {
        result: SearchResult;
        from?: ChessPointers.BasicPointer | undefined;
        to?: ChessPointers.BasicPointer | undefined;
    }

    const setTileLogic = (position : Position, logic : TileLogic) => dispatch({
            type : DisplayBoardInterfaces.ActionTypes.SetTileLogic,
            payload : {at : position, to : logic}
        });
    const setTileLogicMany = (callback : (prev : Mapping2D<TileLogic>) => Mapping2D<TileLogic>) => dispatch({
            type : DisplayBoardInterfaces.ActionTypes.SetTileLogicMany,
            payload : callback
        });


    const {width, height} = settings;

    const iterationBoard = useMemo(() => {

        const logicBoard = new Board(height, width);

        const passabilityMap = Mapping2D.converterMap<TileLogic, boolean>(
            settings.boardLogic, (logic : TileLogic) => logic !== TileLogic.unpassable 
            );

        logicBoard.setPassability(passabilityMap.arr);
        logicBoard.setWeight(createWeightMap(height, width, settings.weightSettings).arr);

        console.log(createWeightMap(height, width, settings.weightSettings).arr);

        return logicBoard;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [width, height, settings.pathFindingAlgo, settings.chessPiece, settings.weightSettings]);

    const iterate = useMemo(() => {
        const startPosition = settings.chessPiece.piecePointer(settings.knightPosition.x, settings.knightPosition.y, iterationBoard);
        const endPosition = settings.chessPiece.piecePointer(settings.flagPosition.x, settings.flagPosition.y, iterationBoard);

        return settings.pathFindingAlgo(startPosition, endPosition);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [settings.chessPiece, settings.pathFindingAlgo, iterationBoard])

    const [searchResult, setSearchResult] = useState<IteResult>();

    const [arrows, setArrows] = useState<ArrowScopeInterface.Line[]>([]);
    const [shadows, setShadows] = useState<Position[]>([]);

    // Resulting Analysis
    const [iterationPassed, setIterationPassed] = useState<number>(0);
    const [pathLength, setPathLength] = useState<number | null>(null);


    const boardRef = useRef<HTMLDivElement>(null);
    const scopeRef = useRef<HTMLDivElement>(null);

    // Iterate on press and/or on interval
    useEffect(() => {
        if (searchResult !== undefined && searchResult.result !== SearchResult.SearchContinues) return;
        const scope = scopeRef.current;

        const ite = () => {
            setSearchResult(iterate());
            setIterationPassed((prev) => prev + 1);
        }

        scope?.addEventListener('click', ite);

        const id : NodeJS.Timeout | null = settings.iterationSpeed !== null ? 
            setTimeout(ite, settings.iterationSpeed) 
            : null;

        return () => {
            scope?.removeEventListener('click', ite);
            if (id !== null) clearTimeout(id);
        }
    }, [iterate, searchResult, settings.iterationSpeed]);

    // Display Changes
    useEffect(() => {
        if (searchResult === undefined) return;

        const {from, to, result} = searchResult;

        if (result === SearchResult.SearchContinues) {

            // Color just visited square
            setTileLogic(
                new Position(
                    (to as ChessPointers.BasicPointer).x, 
                    (to as ChessPointers.BasicPointer).y
                    ), 
                TileLogic.visited
            );

            // Color squares that were just found
            setTileLogicMany ((prevLogic) => {
                const ans = prevLogic.copy();
    
                iterationBoard.forEach((square, x, y) => {
                    const currentPosition = new Position(x, y);
    
                    if (ans.at(currentPosition) === TileLogic.notFound 
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

            const {piecePointer} = settings.chessPiece;

            // Color squares in Path from flag to the knight
            setTileLogicMany((prevMapping) => {
                const ans = prevMapping.copy();
    
                let chessPointer : ChessPointers.BasicPointer | undefined = 
                    piecePointer(settings.flagPosition.x, settings.flagPosition.y, iterationBoard);
    
                while (chessPointer !== undefined) {
    
                    ans.setAt(new Position(chessPointer.x, chessPointer.y), TileLogic.road);
    
                    chessPointer = chessPointer.at().shortestPath;
    
                }
    
                return ans;
            });

            // Draw Shadows and arrows for path
            let pos : ChessPointers.BasicPointer = 
                piecePointer(settings.flagPosition.x, settings.flagPosition.y, iterationBoard);
            let pathLength = 0;

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
                    pathLength++;
                }
            }
            setPathLength(pathLength);
            setArrows(roadArrows);
            setShadows(roadShadows);
        } 
        else {
            setPathLength(Number.POSITIVE_INFINITY);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchResult])

    // Make sure full reset on change of props
    useEffect (() => {
        setTileLogicMany((prev) => prev.map((value) => 
                value === TileLogic.unpassable ? TileLogic.unpassable : TileLogic.notFound
        ));

        setArrows([]);
        setShadows([]);
        setSearchResult(undefined);
        setIterationPassed(0);
        setPathLength(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [height, width, settings.pathFindingAlgo, settings.chessPiece, settings.weightSettings])
    
    return (<div>
        <div className={'scoreWatcher'}>{`Iterations has passed : ${iterationPassed} ${pathLength === null ? '' : `    Shortest Path length is ${pathLength}`}`}</div>
        <ArrowScope scopeRef={scopeRef} height={height} width={width} arrows={arrows}>
            <BaseBoard boardRef={boardRef} className='DisplayBoard'
                settings={settings}
                createTile={
                    (passable, pos, child) =>
                    <DisplayTile
                        key={`${pos.x},${pos.y}`}
                        black={(pos.x + pos.y) % 2 === 1}
                        passable={passable}
                        tileLogic={settings.boardLogic.at(pos)}>
                        {child}
                    </DisplayTile>
                }
                createPiece={(pos) => {
                    if (Position.same(pos, settings.knightPosition)) return <ChessPiece child={settings.chessPiece.pieceSVG} black={(pos.x + pos.y) % 2 === 0}/>
                    if (Position.same(pos, settings.flagPosition)) return <ChessPiece child={ChessPieceInterface.FlagSVG} black={(pos.x + pos.y) % 2 === 0}/>
                    for (let i = 0; i < shadows.length; i++) {
                        if (Position.same(pos, shadows[i])) return <ChessPiece
                        child={(color : string) => settings.chessPiece.pieceSVG(color, 0.5)}
                        black={(settings.knightPosition.x + settings.knightPosition.y) % 2 === 0}/>
                    }}}/>
            </ArrowScope>
    </div>)
}