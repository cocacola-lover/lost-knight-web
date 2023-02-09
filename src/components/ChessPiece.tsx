import './css/ChessPiece.css';

import {useRef, useEffect} from 'react';
import { ChessPieceInterface } from '../logic/interfaces';

export function ChessPiece (props : ChessPieceInterface.ChessPieceProps) {

    const dragabble = props.dragabble ?? false;
    const color = props.black ? 'black' : 'white';

    return <div ref={props.chessPieceRef} draggable={dragabble} className={`ChessPiece ${color}`}>
        {props.child(color)}
    </div>
}

export function MovableChessPiece (props : ChessPieceInterface.MovableChessPieceProps) {
    const chessPieceRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const chessPiece = chessPieceRef.current;

        const handleDragStart = (event : DragEvent) => {
            props.onDragStart(event);
    
            event.dataTransfer?.setDragImage(chessPiece ?? new Image(), 10, 10);
        }

        chessPiece?.addEventListener("dragstart", handleDragStart);
        return () => chessPiece?.removeEventListener("dragstart", handleDragStart);
    }, [props]);

    return <ChessPiece 
    child={props.child} 
    black={props.black} 
    dragabble={true} 
    chessPieceRef={chessPieceRef}
    ></ChessPiece>
}

