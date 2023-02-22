import BaseBoard from './BaseBoard';
import { ChessPiece } from '../ChessPiece';
import { SensibleTile } from '../Tile';

import { BoardInterfaces, ChessPieceInterface, TileInterfaces } from '../../logic/interfaces';

import { useState, useRef } from 'react';

import Position from '../../logic/position';

import DrawableBoardInterface = BoardInterfaces.DrawableBoard;
import Actions = DrawableBoardInterface.ActionTypes;
import TileLogic = TileInterfaces.TileLogic;


export default function DrawableBoard ({settings, dispatch} : DrawableBoardInterface.Props) {

    enum PenState {
        Inactive,
        DrawPassable,
        DrawImpassable
    }

    const getPassability = (position : Position) => {
        return settings.boardLogic.at(position) !== TileLogic.unpassable;
    }

    const [penState, setPenState] = useState<PenState>(PenState.Inactive);

    const createTileHadleOnMouseDown = (position : Position) => {
        return (event : Event) => {
            if (event.target !== event.currentTarget) return;
            if (Position.same(position, settings.flagPosition) || Position.same(position, settings.knightPosition)) return;

            if (penState === PenState.Inactive) {

                setPenState( getPassability(position) ? PenState.DrawImpassable : PenState.DrawPassable )

                dispatch({
                    type : Actions.SetTileLogic,
                    payload : {
                        at : position,
                        to : getPassability(position) ? TileLogic.unpassable : TileLogic.notFound
                    }
                });

            }
        }
    }

    const createTileHadleOnMouseEnter = (position : Position) => {
        return (event : Event) => {
            if (event.target !== event.currentTarget) return;
            if (Position.same(position, settings.flagPosition) || Position.same(position, settings.knightPosition)) return;

            if (penState !== PenState.Inactive) {
                dispatch({
                    type : Actions.SetTileLogic,
                    payload : {
                        at : position,
                        to : penState === PenState.DrawPassable ? TileLogic.notFound : TileLogic.unpassable
                    }
                });
            }
        }
    }

    const createTileHadleOnMouseUp = () => () => {setPenState(PenState.Inactive)}

    const boardRef = useRef<HTMLDivElement>(null);

    return <BaseBoard boardRef={boardRef} className='DrawableBoard'
            settings={settings}
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
                if (Position.same(pos, settings.knightPosition)) return <ChessPiece child={settings.chessPiece.pieceSVG} black={(pos.x + pos.y) % 2 === 0}/>
                else if (Position.same(pos, settings.flagPosition)) return <ChessPiece child={ChessPieceInterface.FlagSVG} black={(pos.x + pos.y) % 2 === 0}/>
                else return undefined;
            }}/>
}