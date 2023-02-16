import { useLayoutEffect, useState } from "react";
import { HTMLElementSizes } from "./interfaces";
import Position from "./position";

export default function useHTMLElementSizes(ref : React.RefObject<HTMLElement>) {
    const [sizes, setSizes] = useState<HTMLElementSizes>({width : 0, height : 0, position : new Position(0, 0)});

    useLayoutEffect(() => {

      const element = ref.current;

      const resizeObserver = new ResizeObserver((entries) => entries.forEach((entry) => {
        setSizes({
            position : new Position(
              (entry.target as HTMLElement).getBoundingClientRect().left,
              (entry.target as HTMLElement).getBoundingClientRect().top
              ),
            width : (entry.target as HTMLElement).offsetWidth,
            height : (entry.target as HTMLElement).offsetHeight,
          }
        )
      }));
  
      function updateSizes() {
        if (element === null) return;

        setSizes({
          position : new Position(
            element.getBoundingClientRect().left,
            element.getBoundingClientRect().top
            ),
            width : element.offsetWidth,
            height : element.offsetHeight,
        })  
      }
      
      window.addEventListener('resize', updateSizes);
      updateSizes();
      resizeObserver.observe((element as HTMLElement));

      return () => {
        window.removeEventListener('resize', updateSizes);
        resizeObserver.unobserve(element as HTMLElement);
      }
    }, [ref]);

    return sizes;
}