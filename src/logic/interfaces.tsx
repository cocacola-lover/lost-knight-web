import Position from "./position";

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

    export interface MovableBoardProps {
        height : number,
        width : number,

        knightPosition : Position
        flagPosition : Position

        getPassability : (position : Position) => boolean

        setKnightPosition : React.Dispatch<React.SetStateAction<Position>>
        setFlagPosition : React.Dispatch<React.SetStateAction<Position>>
    }

    export interface DrawableBoardProps {
        height : number
        width : number

        knightPosition : Position
        flagPosition : Position

        getPassability : (position : Position) => boolean
        setPassability : (position : Position, value : boolean) => void
    }

    export interface DisplayBoardProps {
        height : number
        width : number

        knightPosition : Position
        flagPosition : Position

        getPassability : (position : Position) => boolean
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

        chessPieceRef? : React.RefObject<HTMLDivElement>

        child : (color: string) => JSX.Element
    }

    export interface MovableChessPieceProps {
        black? : boolean

        onDragStart :  (event : DragEvent) => void

        child : (color: string) => JSX.Element
    }

    export function FlagSVG(color : string, opacity? : number) {
        return <svg opacity={opacity} xmlns="http://www.w3.org/2000/svg" fill={color} viewBox="0 0 24 24"><title>Destination</title><path d="M14.4,6H20V16H13L12.6,14H7V21H5V4H14L14.4,6M14,14H16V12H18V10H16V8H14V10L13,8V6H11V8H9V6H7V8H9V10H7V12H9V10H11V12H13V10L14,12V14M11,10V8H13V10H11M14,10H16V12H14V10Z" /></svg>
    }
    
    export function KnightSVG(color : string, opacity? : number) {
        return <svg opacity={opacity} xmlns="http://www.w3.org/2000/svg" fill={color} viewBox="0 0 24 24"><title>Lost Knight</title><path d="M19,22H5V20H19V22M13,2V2C11.75,2 10.58,2.62 9.89,3.66L7,8L9,10L11.06,8.63C11.5,8.32 12.14,8.44 12.45,8.9C12.47,8.93 12.5,8.96 12.5,9V9C12.8,9.59 12.69,10.3 12.22,10.77L7.42,15.57C6.87,16.13 6.87,17.03 7.43,17.58C7.69,17.84 8.05,18 8.42,18H17V6A4,4 0 0,0 13,2Z" /></svg>
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