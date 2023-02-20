import Mapping2D from "./mapping2d";
import Position from "./position";
import { Board, ChessPointers, SearchIterator } from '@cocacola-lover/knight_path_finder';


export namespace Settings {

    export enum Algorithm {
        Dijkstra = 0,
        DeepFirstSearch = 1,
        Greedy = 2,
        AStar = 3, 
    }

    export enum Character {
        Knight = 0,
        King = 1,
        Bishop = 2,
        Rook = 3,
        Pawn = 4,
        Queen = 5,
    }

    export interface Settings {
        width : number,
        height : number,

        algorithmNames : string[],
        pieceNames : string[],

        getPassability : (pos: Position, value: boolean) => void

        getMovableSettings : () => BoardInterfaces.MovableSettings
        getDrawableSettings : () => BoardInterfaces.DrawableSettings
        getDisplaySettings : () => BoardInterfaces.DisplaySettings
    }

    export interface SetSettings {
        setWidth : React.Dispatch<React.SetStateAction<number>>
        setHeight : React.Dispatch<React.SetStateAction<number>>
        chooseSearchIterator : (a : Algorithm) => void

        choosePiece : (a : Character) => void
    }
}

export namespace AppInterfaces {
    export enum BoardState {
        Display,
        Drawable,
        Movable
    }

    export enum Algorithm {
        Dijkstra = 0,
        DeepFirstSearch = 1,
    }
}

export namespace BoardInterfaces {

    export interface BaseBoardProps {
        height : number
        width : number

        knightPosition : Position
        flagPosition : Position
        
        boardRef? : React.RefObject<HTMLDivElement>
        
        getPassability : (position : Position) => boolean

        createTile : (passable : boolean, pos: Position, child : JSX.Element | undefined) => JSX.Element
        createPiece :  (pos: Position) => JSX.Element | undefined
    }

    export interface MovableSettings {
        height : number,
        width : number,

        pieceSVG : (color: string, opacity?: number) => JSX.Element,

        knightPosition : Position
        flagPosition : Position

        getPassability : (position : Position) => boolean

        setKnightPosition : React.Dispatch<React.SetStateAction<Position>>
        setFlagPosition : React.Dispatch<React.SetStateAction<Position>>
    }

    export interface MovableBoardProps {
        settings : MovableSettings
    }

    export interface DrawableSettings {
        height : number,
        width : number,

        pieceSVG : (color: string, opacity?: number) => JSX.Element,

        knightPosition : Position,
        flagPosition : Position,

        getPassability : (position : Position) => boolean,
        setPassability : (position : Position, value : boolean) => void,
    }

    export interface DrawableBoardProps {
        settings : DrawableSettings
    }

    export interface DisplaySettings {

        pieceSVG : (color: string, opacity?: number) => JSX.Element,
        piecePointer : (x : number, y : number, board : Board) => ChessPointers.BasicPointer,

        knightPosition : Position,
        flagPosition : Position,

        getPassability : (position : Position) => boolean
        passabilityMap : Mapping2D<boolean>

        algorithm : (start: ChessPointers.BasicPointer, end: ChessPointers.BasicPointer) => SearchIterator
    }

    export interface DisplayBoardProps {
        settings : DisplaySettings
    }

}

export namespace TileInterfaces {

    export enum TileLogic {
        notFound,
        found,
        visited,
        road
    }

    export interface BaseTileProps {
        black? : boolean
        passable? : boolean
        additionalClassName? : string

        children? : JSX.Element

        tileRef? : React.RefObject<HTMLDivElement>       
    }

    export interface SensibleTileProps {
        black? : boolean
        passable? : boolean

        onDragEnter? : (event : DragEvent) => void
        onMouseDown? : (event : Event) => void
        onMouseEnter? : (event : Event) => void
        onMouseUp? : (event : Event) => void

        children? : JSX.Element
    }


    export interface DisplayTileProps {
        black? : boolean
        passable? : boolean

        children? : JSX.Element

        tileLogic? : TileLogic
    }
}

export namespace ChessPieceInterface {

    export interface ChessPieceProps {
        black? : boolean
        dragabble? : boolean
        
        additionalClassName? : string
        style? : React.CSSProperties

        chessPieceRef? : React.RefObject<HTMLDivElement>

        child : (color: string, opacity?: number) => JSX.Element
    }

    export interface MovableChessPieceProps {
        black? : boolean

        onDragStart :  (event : Event) => void

        child : (color: string, opacity?: number) => JSX.Element
    }

    export function FlagSVG(color : string, opacity? : number) {
        return <svg opacity={opacity} xmlns="http://www.w3.org/2000/svg" fill={color} viewBox="0 0 24 24"><title>Destination</title><path d="M14.4,6H20V16H13L12.6,14H7V21H5V4H14L14.4,6M14,14H16V12H18V10H16V8H14V10L13,8V6H11V8H9V6H7V8H9V10H7V12H9V10H11V12H13V10L14,12V14M11,10V8H13V10H11M14,10H16V12H14V10Z" /></svg>
    }
    
    export function KnightSVG(color : string, opacity? : number) {
        return <svg opacity={opacity} xmlns="http://www.w3.org/2000/svg" fill={color} viewBox="0 0 24 24"><title>Lost Knight</title><path d="M19,22H5V20H19V22M13,2V2C11.75,2 10.58,2.62 9.89,3.66L7,8L9,10L11.06,8.63C11.5,8.32 12.14,8.44 12.45,8.9C12.47,8.93 12.5,8.96 12.5,9V9C12.8,9.59 12.69,10.3 12.22,10.77L7.42,15.57C6.87,16.13 6.87,17.03 7.43,17.58C7.69,17.84 8.05,18 8.42,18H17V6A4,4 0 0,0 13,2Z" /></svg>
    }

    export function PawnSVG(color : string, opacity? : number) {
        return <svg fill={color} opacity={opacity} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>chess-pawn</title><path d="M19 22H5V20H19V22M16 18H8L10.18 10H8V8H10.72L10.79 7.74C10.1 7.44 9.55 6.89 9.25 6.2C8.58 4.68 9.27 2.91 10.79 2.25C12.31 1.58 14.08 2.27 14.74 3.79C15.41 5.31 14.72 7.07 13.2 7.74L13.27 8H16V10H13.82L16 18Z" /></svg>
    }

    export function BishopSVG(color : string, opacity? : number) {
        return <svg fill={color} opacity={opacity} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>chess-bishop</title><path d="M19,22H5V20H19V22M17.16,8.26C18.22,9.63 18.86,11.28 19,13C19,15.76 15.87,18 12,18C8.13,18 5,15.76 5,13C5,10.62 7.33,6.39 10.46,5.27C10.16,4.91 10,4.46 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.46 13.84,4.91 13.54,5.27C14.4,5.6 15.18,6.1 15.84,6.74L11.29,11.29L12.71,12.71L17.16,8.26Z" /></svg>
    }

    export function KingSVG(color : string, opacity? : number) {
        return <svg fill={color} opacity={opacity} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>chess-king</title><path d="M19,22H5V20H19V22M17,10C15.58,10 14.26,10.77 13.55,12H13V7H16V5H13V2H11V5H8V7H11V12H10.45C9.35,10.09 6.9,9.43 5,10.54C3.07,11.64 2.42,14.09 3.5,16C4.24,17.24 5.57,18 7,18H17A4,4 0 0,0 21,14A4,4 0 0,0 17,10Z" /></svg>
    }

    export function QueenSVG(color : string, opacity? : number) {
        return <svg fill={color} opacity={opacity} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>chess-queen</title><path d="M18,3A2,2 0 0,1 20,5C20,5.81 19.5,6.5 18.83,6.82L17,13.15V18H7V13.15L5.17,6.82C4.5,6.5 4,5.81 4,5A2,2 0 0,1 6,3A2,2 0 0,1 8,5C8,5.5 7.82,5.95 7.5,6.3L10.3,9.35L10.83,5.62C10.33,5.26 10,4.67 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.67 13.67,5.26 13.17,5.62L13.7,9.35L16.47,6.29C16.18,5.94 16,5.5 16,5A2,2 0 0,1 18,3M5,20H19V22H5V20Z" /></svg>
    }
    export function RookSVG(color : string, opacity? : number) {
        return <svg fill={color} opacity={opacity} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>chess-rook</title><path d="M5,20H19V22H5V20M17,2V5H15V2H13V5H11V2H9V5H7V2H5V8H7V18H17V8H19V2H17Z" /></svg>
    }

}

export namespace ArrowScopeInterface {

    export interface Line {
        from : Position
        to : Position
    }

    export interface ArrowProps {
        direction : Line

        stickWidth : number;
        arrowWidth : number;
        arrowHeight : number;
    }


    export interface ArrowScopeProps {
        height : number,
        width : number,
        children : JSX.Element
        arrows : Line[],
        scopeRef : React.RefObject<HTMLDivElement>
    }
}

export namespace SettingsManagerInterface {

    export interface StatePair<Type> {
        get : Type,
        set : React.Dispatch<React.SetStateAction<Type>>
    }

    export interface TogglePair<Type> {
        get : Type,
        toggle : () => void
    }

    export interface SliderProps {
        value : StatePair<number>
    }

    export interface ButtonProps {
        state : TogglePair<boolean>
        className? : string
    }

    export interface SelectProps {
        options : string[],
        choose : (ind : number) => void
    }

    export interface SettingsManagerProps {
        height : StatePair<number>,
        width : StatePair<number>

        iterate : TogglePair<boolean>
        draw : TogglePair<boolean>

        algorithmsNames : string[]
        algorithmsChoose : (ind : number) => void

        characterNames : string[]
        characterChoose : (ind : number) => void
    }
}

export interface HTMLElementSizes {
    width : number,
    height : number,
    position : Position
}