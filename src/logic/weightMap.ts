import Mapping2D from "./mapping2d";
import { Settings } from "./interfaces";

/*
    Convenience function to create Weight Maps for iterators
*/

export default function createWeightMap (height : number, width : number, settings : Settings.WeightSettings) {
    let ans = new Mapping2D<number>(height, width, 0);

    if (settings.avoidBlack) {
        ans = ans.map((value, index1, index2) => {
            return (index1 + index2) % 2 === 0 ? value : value + 1;
        });
    }
    if (settings.avoidWhite) {
        ans = ans.map((value, index1, index2) => {
            return (index1 + index2) % 2 === 1 ? value : value + 1;
        });
    }
    if (settings.avoidCorners) {
        ans = ans.map((value, index1, index2) =>{
            return value + Math.sqrt((index1 - (width - 1) / 2) * (index1 - (width - 1) / 2) + (index2 - (height - 1) / 2) * (index2 - (height - 1) / 2));
        })
    }
    if (settings.avoidCenter) {
        ans = ans.map((value, index1, index2) =>{
            return value - Math.sqrt((index1 - (width - 1) / 2) * (index1 - (width - 1) / 2) + (index2 - (height - 1) / 2) * (index2 - (height - 1) / 2));
        })
    }

    return ans;
}