import './css/ArrowScope.css';
import { useState, useLayoutEffect } from 'react';
import { ArrowScopeInterface } from "../logic/interfaces";
import Position from '../logic/position';

function Arrow (props : ArrowScopeInterface.ArrowProps) {

    const {stickWidth, arrowHeight, arrowWidth, direction} = props;
    const {from, to} = direction;

    const angle = Math.atan2(to.x - from.x, to.y - from.y);
    const length = Math.sqrt((to.y - from.y) * (to.y - from.y) + (to.x - from.x) * (to.x - from.x));

    return (
    <div className="Arrow" style={{
        left : `${(from.x - arrowWidth / 2)}px`,
        top : `${from.y}px`,
        transform : `rotate(${-angle}rad)`,
    }}>
        <div className="Stick" style={{
            width : `${stickWidth}px`,
            height : `${length - arrowHeight - 20}px`,
            margin : `0px ${(arrowWidth - stickWidth) / 2}px`,
            marginTop : '10px',
            marginBottom : '2px'
        }}></div>
        <div className="ArrowHead" style={{
            borderLeft : `${arrowWidth / 2}px solid transparent`,
            borderRight : `${arrowWidth / 2}px solid transparent`,
            borderTop : `${arrowHeight}px solid rgba(255, 165, 0, 0.7)`,
        }} ></div>
    </div>
    )
}

Arrow.defaultProps = {
    stickWidth : 10,
    arrowWidth : 40,
    arrowHeight : 30,
}

export default function ArrowScope (props : ArrowScopeInterface.ArrowScopeProps) {

    const [stepRight, setStepRight] = useState<number>(0);
    const [stepDown, setStepDown] = useState<number>(0);


    useLayoutEffect(() => {
        if (props.scopeRef.current !== null) {
            setStepRight(props.scopeRef.current.offsetWidth / props.width / 2)
            setStepDown(props.scopeRef.current.offsetHeight / props.height / 2)
        }

    }, [props])


    return <div ref={props.scopeRef} className="ArrowScope">
        {props.children}
        {props.arrows.map((line, ind) => {
            return <Arrow key={ind} direction={{
                from : new Position(
                    stepRight + stepRight * 2  * (line.from.x),
                    stepDown + stepDown * 2 * (line.from.y)
                    ),
                to : new Position(
                    stepRight + stepRight * 2  * (line.to.x),
                    stepDown + stepDown * 2 * (line.to.y)
                    ),
            }}></Arrow>
        })}
    </div>
}