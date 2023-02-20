import { useState, useEffect, useCallback } from "react";

import { Settings, ChessPieceInterface, BoardInterfaces } from "../logic/interfaces";
import Mapping2D from "../logic/mapping2d";
import Position from "../logic/position";

import { Board, ChessPointers, PathFindingIterators, SearchIterator } from "@cocacola-lover/knight_path_finder";

export default function useSettings () {

    /////
    // Initialisation
    /////

    const [width, setWidth] = useState(10);
    const [height, setHeight] = useState(10);

    const [board, setBoard] = useState(new Mapping2D<boolean>(height, width, true));
  
    const [knightPosition, setKnightPosition] = useState<Position>(new Position(0, 0));
    const [flagPosition, setFlagPosition] = useState<Position>(new Position(1, 1));


    const [algorithm, setAlgorithm] = useState
        <(start: ChessPointers.BasicPointer, end: ChessPointers.BasicPointer) => SearchIterator>
            (() => PathFindingIterators.dijkstraSearchIterator);


    const [pieceSVG, setPieceSVG] = useState(() => ChessPieceInterface.KnightSVG);
    const [piecePointer, setPiecePointer] = useState(() => ((x : number, y : number, board : Board) => new ChessPointers.KnightPointer(x, y, board.squares)));

    /////
    // Additional functions
    /////

    // Passability function

    const getPassability = useCallback((pos : Position) => {
        try {
        return board.at(pos);
        } catch (e) {}
        return true;
    }, [board]);

    const setPassability = (pos : Position, value : boolean) => {
      setBoard((previousState) => {
        const newState = previousState.copy();
        newState.setAt(pos, value);
        return newState;
      });
    }

    //Chooser Functions

    const chooseSearchIterator = (id : Settings.Algorithm) => {
      switch (id) {
          case Settings.Algorithm.Dijkstra : 
              setAlgorithm(() => PathFindingIterators.dijkstraSearchIterator);
              break;

          case Settings.Algorithm.DeepFirstSearch :
              setAlgorithm(() => PathFindingIterators.deepFirstSearchIterator);
              break;

          case Settings.Algorithm.Greedy : 
              setAlgorithm(() => PathFindingIterators.greedySearchIterator);
              break;

          case Settings.Algorithm.AStar :
              setAlgorithm(() => PathFindingIterators.aStarSearchIterator);
              break;
      }
    };

    const choosePiece = (id : Settings.Character) => {
        switch (id) {
            case Settings.Character.Knight : 
                setPieceSVG(() => ChessPieceInterface.KnightSVG);
                setPiecePointer(() => (x:number, y:number, board:Board) => new ChessPointers.KnightPointer(x, y, board.squares));
                break;
            case Settings.Character.Bishop : 
                setPieceSVG(() => ChessPieceInterface.BishopSVG);
                setPiecePointer(() => (x:number, y:number, board:Board) => new ChessPointers.BishopPointer(x, y, board.squares));
                break;
            case Settings.Character.King : 
                setPieceSVG(() => ChessPieceInterface.KingSVG);
                setPiecePointer(() => (x:number, y:number, board:Board) => new ChessPointers.KingPointer(x, y, board.squares));
                break;
            case Settings.Character.Rook : 
                setPieceSVG(() => ChessPieceInterface.RookSVG);
                setPiecePointer(() => (x:number, y:number, board:Board) => new ChessPointers.RookPointer(x, y, board.squares));
                break;
            case Settings.Character.Pawn : 
                setPieceSVG(() => ChessPieceInterface.PawnSVG);
                setPiecePointer(() => (x:number, y:number, board:Board) => new ChessPointers.PawnPointer(x, y, board.squares));
                break;
            case Settings.Character.Queen : 
                setPieceSVG(() => ChessPieceInterface.QueenSVG);
                setPiecePointer(() => (x:number, y:number, board:Board) => new ChessPointers.QueenPointer(x, y, board.squares));
                break;
        }
    }

    // Get names

    const algorithmNames = ['Dijkstra', 'Deep First Search', 'Greedy', 'A-Star'];
    const pieceNames = ['Knight', 'King', 'Bishop', 'Rook', 'Pawn', 'Queen'];

    /////
    /// Function for building props for boards
    /////

    const getMovableSettings = () => {
        return {
            width, height,
            pieceSVG, piecePointer,
            knightPosition, flagPosition,
            setKnightPosition, setFlagPosition,
            getPassability
        } as BoardInterfaces.MovableSettings
    };

    const getDrawableSettings = () => {
        return {
            width, height,
            pieceSVG, piecePointer,
            knightPosition, flagPosition,
            getPassability, setPassability
        } as BoardInterfaces.DrawableSettings
    };

    const getDisplaySettings = () => {
        return {
            width, height,
            pieceSVG, piecePointer,
            knightPosition, flagPosition,
            getPassability, algorithm,
            passabilityMap : board
        } as BoardInterfaces.DisplaySettings
    }


    /////
    /// UseEffects for Bug Prevention
    /////

    // Work with scaling
    useEffect(() => {
      setBoard((prevBoard) => {
        const newAns = prevBoard.scaleTo(height, width, true);
        console.log({newAns});
        return newAns;
      });

      setKnightPosition((prevPosition) => new Position(
            prevPosition.x < width ? prevPosition.x : width - 1,
            prevPosition.y < height ? prevPosition.y : height - 1,
      ));

      setFlagPosition((prevPosition) => new Position(
        prevPosition.x < width ? prevPosition.x : width - 1,
        prevPosition.y < height ? prevPosition.y : height - 1,
      ));

    }, [width, height]);

    // Collision prevention
    useEffect(() => {
      if (Position.same(knightPosition, flagPosition)) {
        setKnightPosition(new Position(0, 0));
        setFlagPosition(new Position(1, 1));
      }

      if (!getPassability(knightPosition)) setPassability(knightPosition, true);
      if (!getPassability(flagPosition)) setPassability(flagPosition, true);
    }, [knightPosition, flagPosition, getPassability])

    /////
    /// Return [Settings, SetSettings]
    /////

    const settings = {
        width, height,
        algorithmNames, pieceNames,
        getPassability,
        getMovableSettings, getDrawableSettings, getDisplaySettings,
    } as Settings.Settings

    const setSettings = {
        setWidth, setHeight,
        chooseSearchIterator, choosePiece
    } as Settings.SetSettings

    return {settings, setSettings};
}   