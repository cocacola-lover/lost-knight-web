import BaseBoard from './BaseBoard';
import { ChessPiece } from '../ChessPiece';
import { SensibleTile } from '../Tile';

import { BoardInterfaces, ChessPieceInterface, TileInterfaces } from '../../logic/interfaces';

import { useState, useRef } from 'react';

import Position from '../../logic/position';

import Interfaces = BoardInterfaces.DrawableBoard;
import Actions = Interfaces.ActionTypes;
import TileLogic = TileInterfaces.TileLogic;
import PenState = Interfaces.PenState

/*
    DrawableBoard allows to draw obstacles for path-finding

    Function creates event handlers and uses SensibleTiles to achieve that.
*/

export default function DrawableBoard ({settings, dispatch} : Interfaces.Props) {

    const [penState, setPenState] = useState<PenState>(PenState.Inactive);

    const boardRef = useRef<HTMLDivElement>(null);

    // Convenience functions

    const getPassability = (position : Position) => 
        settings.boardLogic.at(position) !== TileLogic.unpassable;

    const setTileLogicTo = (position : Position, tileLogic : TileLogic) => dispatch({
        type : Actions.SetTileLogic,
        payload : {
            at : position,
            to : tileLogic
        }
    });


    // Mouse Event handlers

    const createTileHadleOnMouseDown = (position : Position) => {
        return (event : Event) => {
            // Avoid bubbling
            if (event.target !== event.currentTarget) return;

            // Avoid drawing on the tile with a chess piece
            if (Position.same(position, settings.flagPosition) || Position.same(position, settings.knightPosition)) return;

            // If penState is already active then handled in mouseEnter.
            if (penState !== PenState.Inactive) return;

            setPenState( getPassability(position) ? PenState.DrawImpassable : PenState.DrawPassable );

            setTileLogicTo(
                position, 
                getPassability(position) ? TileLogic.unpassable : TileLogic.notFound
            );
        }
    }

    const createTileHadleOnMouseEnter = (position : Position) => {
        return (event : Event) => {
            // Avoid bubbling
            if (event.target !== event.currentTarget) return;

            // Avoid drawing on the tile with a chess piece
            if (Position.same(position, settings.flagPosition) || Position.same(position, settings.knightPosition)) return;

            // If penState is inactive then handled in mouseDown
            if (penState === PenState.Inactive) return;

            setTileLogicTo(
                position, 
                penState === PenState.DrawPassable ? TileLogic.notFound : TileLogic.unpassable
            );
        }
    }

    const createTileHadleOnMouseUp = () => () => setPenState(PenState.Inactive);

    //

    return <BaseBoard boardRef={boardRef} className='DrawableBoard'
            settings={settings}
            createTile={
                (tileLogic, pos, child) => 
                <SensibleTile
                    key={`${pos.x},${pos.y}`}
                    black={(pos.x + pos.y) % 2 === 1}
                    onMouseDown={createTileHadleOnMouseDown(pos)}
                    onMouseUp={createTileHadleOnMouseUp()}
                    onMouseEnter={createTileHadleOnMouseEnter(pos)}
                    tileLogic={tileLogic}>
                    {child}
                </SensibleTile>
            }
            createPiece={(pos) => {
                if (Position.same(pos, settings.knightPosition)) return <ChessPiece child={settings.chessPiece.pieceSVG} black={(pos.x + pos.y) % 2 === 0}/>
                else if (Position.same(pos, settings.flagPosition)) return <ChessPiece child={ChessPieceInterface.SVGs.FlagSVG} black={(pos.x + pos.y) % 2 === 0}/>
                else return undefined;
            }}/>
}