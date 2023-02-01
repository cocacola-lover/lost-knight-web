import './css/ChessPiece.css';
import {useRef, useEffect} from 'react';


export function FlagSVG(color : string) {
    return <svg xmlns="http://www.w3.org/2000/svg" fill={color} viewBox="0 0 24 24"><title>Destination</title><path d="M14.4,6H20V16H13L12.6,14H7V21H5V4H14L14.4,6M14,14H16V12H18V10H16V8H14V10L13,8V6H11V8H9V6H7V8H9V10H7V12H9V10H11V12H13V10L14,12V14M11,10V8H13V10H11M14,10H16V12H14V10Z" /></svg>
}

export function KnightSVG(color : string) {
    return <svg xmlns="http://www.w3.org/2000/svg" fill={color} viewBox="0 0 24 24"><title>Lost Knight</title><path d="M19,22H5V20H19V22M13,2V2C11.75,2 10.58,2.62 9.89,3.66L7,8L9,10L11.06,8.63C11.5,8.32 12.14,8.44 12.45,8.9C12.47,8.93 12.5,8.96 12.5,9V9C12.8,9.59 12.69,10.3 12.22,10.77L7.42,15.57C6.87,16.13 6.87,17.03 7.43,17.58C7.69,17.84 8.05,18 8.42,18H17V6A4,4 0 0,0 13,2Z" /></svg>
}

interface ChessPieceProps {
    black? : boolean
    chessPieceRef? : React.RefObject<HTMLDivElement>
    dragabble? : boolean
    child : (color: string) => JSX.Element
}

export function ChessPiece (props : ChessPieceProps) {

    const dragabble = props.dragabble ?? false;
    const color = props.black ? 'black' : 'white';

    return <div ref={props.chessPieceRef} draggable={dragabble} className={`ChessPiece ${color}`}>
        {props.child(color)}
    </div>
}

interface MovableChessPieceProps {
    black? : boolean
    onDragStart :  (event : DragEvent) => void
    child : (color: string) => JSX.Element
}

export function MovableChessPiece (props : MovableChessPieceProps) {
    const chessPieceRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const chessPiece = chessPieceRef.current;

        const handleDragStart = (event : DragEvent) => {
            props.onDragStart(event);
    
            event.dataTransfer?.setDragImage(chessPiece ?? new Image(), 10, 10);
        }

        chessPiece?.addEventListener("dragstart", handleDragStart);
        return () => chessPiece?.removeEventListener("dragstart", handleDragStart);
    });

    return <ChessPiece 
    child={props.child} 
    black={props.black} 
    dragabble={true} 
    chessPieceRef={chessPieceRef}
    ></ChessPiece>
}

