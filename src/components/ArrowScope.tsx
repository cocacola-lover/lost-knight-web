import './css/ArrowScope.css';

import { useState, useLayoutEffect } from 'react';
import { ArrowScopeInterface } from "../logic/interfaces";

import useHTMLElementSizes from '../hooks/useHTMLElementSizes';
import Position from '../logic/position';

/*
    Arrow is an absolutely positioned component that draws an arrow from one position in pixels to another.

    ArrowScope component is relatively positioned component that wraps others, creates a grid and places arrows from the perspective of the grid.
    ArrowScope devides itself into a grid of squares using height and width. Then places arrows using coordinates OF CENTERS of those squares.
*/

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
            height : `${length* 0.9 - arrowHeight}px`,
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
    arrowWidth : 30,
    arrowHeight : 30,
}

export default function ArrowScope (props : ArrowScopeInterface.ArrowScopeProps) {

    const [stepRight, setStepRight] = useState<number>(0);
    const [stepDown, setStepDown] = useState<number>(0);

    const htmlElementSizes = useHTMLElementSizes(props.scopeRef);

    useLayoutEffect(() => {
        if (props.scopeRef.current !== null) {
            setStepRight(htmlElementSizes.width / props.width / 2)
            setStepDown(htmlElementSizes.height / props.height / 2)
        }
    }, [props, htmlElementSizes])


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