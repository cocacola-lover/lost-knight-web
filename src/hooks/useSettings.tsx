import { useReducer } from "react";

import { Settings, ChessPieceInterface, TileInterfaces } from "../logic/interfaces";
import Mapping2D from "../logic/mapping2d";
import Position from "../logic/position";

import { Board, ChessPointers, PathFindingIterators } from "@cocacola-lover/knight_path_finder";

import TileLogic = TileInterfaces.TileLogic;
import ActionTypes = Settings.ActionTypes;
import SetTileLogicAction = Settings.SetTileLogicAction;
import SetTileLogicManyAction = Settings.SetTileLogicManyAction;

export default function useSettings () {

    function reducer (state : Settings.Settings, action : Settings.SettingsAction) {

        if (action.type === ActionTypes.ChangeSize){

            // Assign new Sizes
            const newSizes = action.payload as number[];
            const newWidth = newSizes[0]; const newHeight = newSizes[1];

            // New boardLogic
            const newBoardLogic = state.boardLogic.scaleTo(
                newHeight, newWidth, TileLogic.notFound
                );

            // Scale Knight and Flag position if needed
            let newKnightPosition = new Position(
                state.knightPosition.x < newWidth ? state.knightPosition.x : newWidth - 1,
                state.knightPosition.y < newHeight ? state.knightPosition.y : newHeight - 1,
            );
    
            let newFlagPosition = new Position(
                state.flagPosition.x < newWidth ? state.flagPosition.x : newWidth - 1,
                state.flagPosition.y < newHeight ? state.flagPosition.y : newHeight - 1,
            );

            // Make sure there is no collision with each other
            if (Position.same(newKnightPosition, newFlagPosition)) {
                newKnightPosition = new Position(0, 0);
                newFlagPosition = new Position(1, 1);
            }
            
            // And with the unpassable Tiles
            if (newBoardLogic.at(newKnightPosition) === TileLogic.unpassable) 
                newBoardLogic.setAt(newKnightPosition, TileLogic.notFound)
            if (newBoardLogic.at(newFlagPosition) === TileLogic.unpassable) 
                newBoardLogic.setAt(newFlagPosition, TileLogic.notFound)

            return Object.assign({}, state, {
                width : newWidth,
                height : newHeight,
                boardLogic : newBoardLogic,

                knightPosition : newKnightPosition,
                flagPosition : newFlagPosition,
            }) as Settings.Settings;
        }
        if (action.type === ActionTypes.SetTileLogic) {
            const tileAction = action.payload as SetTileLogicAction;

            const newBoardLogic = state.boardLogic.copy();
            newBoardLogic.setAt(tileAction.at, tileAction.to);

            return Object.assign({}, state, {
                boardLogic : newBoardLogic
            }) as Settings.Settings;

        }
        if (action.type === ActionTypes.SetTileLogicMany) {
            const newBoardLogic = (action.payload as SetTileLogicManyAction)(state.boardLogic);

            return Object.assign({}, state, {
                boardLogic : newBoardLogic
            }) as Settings.Settings;
        }
        if (action.type === ActionTypes.SetSearchIterator) {

            let algorithm = PathFindingIterators.dijkstraSearchIterator;

            switch (action.payload as Settings.Algorithm) {
                case Settings.Algorithm.Dijkstra : 
                    algorithm = PathFindingIterators.dijkstraSearchIterator;
                    break;
      
                case Settings.Algorithm.DeepFirstSearch :
                    algorithm = PathFindingIterators.deepFirstSearchIterator;
                    break;
      
                case Settings.Algorithm.Greedy : 
                    algorithm = PathFindingIterators.greedySearchIterator;
                    break;
      
                case Settings.Algorithm.AStar :
                    algorithm = PathFindingIterators.aStarSearchIterator;
                    break;
            }

            return Object.assign({}, state, {
                pathFindingAlgo : algorithm
            }) as Settings.Settings;
        }
        if (action.type === ActionTypes.SetCharacter) {

            let chessPiece : Settings.ChessPieceState;

            switch (action.payload as Settings.Character) {
                case Settings.Character.Knight : 
                    chessPiece = {
                        pieceSVG : ChessPieceInterface.KnightSVG,
                        piecePointer : (x : number, y : number, board : Board) => new ChessPointers.KnightPointer(x, y, board.squares)
                    }
                    break;
                case Settings.Character.Bishop : 
                    chessPiece = {
                        pieceSVG : ChessPieceInterface.BishopSVG,
                        piecePointer : (x : number, y : number, board : Board) => new ChessPointers.BishopPointer(x, y, board.squares)
                    }
                    break;
                case Settings.Character.King : 
                    chessPiece = {
                        pieceSVG : ChessPieceInterface.KingSVG,
                        piecePointer : (x : number, y : number, board : Board) => new ChessPointers.KingPointer(x, y, board.squares)
                    }
                    break;
                case Settings.Character.Rook : 
                    chessPiece = {
                        pieceSVG : ChessPieceInterface.RookSVG,
                        piecePointer : (x : number, y : number, board : Board) => new ChessPointers.RookPointer(x, y, board.squares)
                    }
                    break;
                case Settings.Character.Pawn : 
                    chessPiece = {
                        pieceSVG : ChessPieceInterface.PawnSVG,
                        piecePointer : (x : number, y : number, board : Board) => new ChessPointers.PawnPointer(x, y, board.squares)
                    }
                    break;
                case Settings.Character.Queen : 
                    chessPiece = {
                        pieceSVG : ChessPieceInterface.QueenSVG,
                        piecePointer : (x : number, y : number, board : Board) => new ChessPointers.QueenPointer(x, y, board.squares)
                    }
                    break;
            }
            return Object.assign({}, state, {
                chessPiece : chessPiece
            }) as Settings.Settings;
        }
        if (action.type === ActionTypes.SetFlagPosition || action.type === ActionTypes.SetKnightPosition){

            const newPosition = action.payload as Position;

            switch (action.type) {
                case ActionTypes.SetKnightPosition :
                    return Object.assign({}, state, {
                        knightPosition : newPosition
                    });
                case ActionTypes.SetFlagPosition : 
                    return Object.assign({}, state, {
                        flagPosition : newPosition
                    });
            }
        }
        if (action.type === ActionTypes.SetWeights) {

            return Object.assign({}, state, {
                weightSettings : (action.payload as Settings.WeightSettings)}) as Settings.Settings;
        }
        if (action.type === ActionTypes.SetIterationSpeed) {

            const newIterationSpeed = action.payload as number | null;

            return Object.assign({}, state, {
                iterationSpeed : newIterationSpeed
            }) as Settings.Settings;
        }
        return state;
    }

    return useReducer(reducer, {
        width : 8,
        height : 8,

        iterationSpeed : 500,

        boardLogic : new Mapping2D<TileInterfaces.TileLogic>(8, 8, TileInterfaces.TileLogic.notFound),
        weightSettings : {
            avoidWhite : false,
            avoidBlack : false,
            avoidCenter : false,
            avoidCorners : false
        },

        knightPosition : new Position(0, 0),
        flagPosition : new Position(1, 1),

        pathFindingAlgo : PathFindingIterators.dijkstraSearchIterator,
        chessPiece : {
            pieceSVG : ChessPieceInterface.KnightSVG,
            piecePointer : (x : number, y : number, board : Board) => new ChessPointers.KnightPointer(x, y, board.squares)
        } as Settings.ChessPieceState
    } as Settings.Settings)
}