import './css/ChessPiece.css';

import {useRef, useEffect, useState} from 'react';
import { ChessPieceInterface } from '../logic/interfaces';
import Position from '../logic/position';

export function ChessPiece (props : ChessPieceInterface.ChessPieceProps) {

    const dragabble = props.dragabble ?? false;
    const color = props.black ? 'black' : 'white';

    return <div 
        ref={props.chessPieceRef} 
        draggable={dragabble} 
        className={`ChessPiece ${color} ${props.additionalClassName ?? ''}`}
        style={props.style}>
        {props.child(color)}
    </div>
}

export function MovableChessPiece (props : ChessPieceInterface.MovableChessPieceProps) {
    
    const chessPieceRefStationary = useRef<HTMLDivElement>(null);

    const [flying, setFlying] = useState<boolean>(false);
    const [mousePosition, setMousePosition] = useState<Position>(new Position(0, 0));

    // Watch for flying
    useEffect(() => {
        const chessPiece = chessPieceRefStationary.current;

        const handleOnMouseDown = (event : Event) => {
            props.onDragStart(event);

            setMousePosition( new Position (
                (event as MouseEvent).clientX, (event as MouseEvent).clientY
            ))
            setFlying(true);

        }

        chessPiece?.addEventListener("pointerdown", handleOnMouseDown);
        return () => chessPiece?.removeEventListener("pointerdown", handleOnMouseDown);
    }, [props]);

    // Handle flying
    useEffect(() => {
        if (!flying) return;

        const handleOnMouseMove = (event : Event) => setMousePosition( new Position(
                    (event as MouseEvent).clientX,
                    (event as MouseEvent).clientY
        ));

        const handleOnMouseUp = (event : Event) => {
            setFlying(false);
        }
        document.addEventListener('pointermove', handleOnMouseMove);
        document.addEventListener('pointerup', handleOnMouseUp);
        return () => {
            document.removeEventListener('pointermove', handleOnMouseMove);
            document.removeEventListener('pointerup', handleOnMouseUp);
        }
    }, [flying])

    return(<div className='ChessPieceWrapper'>
        <ChessPiece 
        child={(color : string) => props.child(color, flying ? 0.3 : 1)} 
        black={props.black} 
        chessPieceRef={chessPieceRefStationary}
        ></ChessPiece>

        {flying ? <ChessPiece
            child={props.child} 
            black={props.black} 
            additionalClassName='flying'
            style={{
                width : `${chessPieceRefStationary.current?.offsetWidth}px`,
                height : `${chessPieceRefStationary.current?.offsetHeight}px`,
                left : `${mousePosition.x - chessPieceRefStationary.current!.offsetWidth / 2}px`,
                top : `${mousePosition.y - chessPieceRefStationary.current!.offsetHeight / 2}px`,
            }}
            ></ChessPiece> : undefined}
    </div>)
};

