import Position from "./position";

export default class Mapping2D<Type> {
    private arr : Type[][];

    constructor(height : number, width : number, defaultVal : Type) {
        this.arr = [];
        for (let i = 0; i < width; i++){
            this.arr.push([]);
            for (let j = 0; j < height; j++) this.arr[i].push(defaultVal);
        }
    }

    at (position : Position) {
        return this.arr[position.x][position.y];
    }

    setAt (position : Position, value : Type) {
        this.arr[position.x][position.y] = value;
    }

    copy () {
        const ans = new Mapping2D<Type>(this.arr[0].length, this.arr.length, this.arr[0][0]);

        ans.arr = ans.arr.map((row, index1) => row.map((curentVal, index2) => {
            return this.arr[index1][index2];
        }))

        return ans;
    }

    static createOpposition<Type>(height : number, width : number, val1 : Type, val2 : Type) {
        const ans = new Mapping2D<Type>(height, width, val1);

        ans.arr = ans.arr.map((row, index1) => row.map((curentVal, index2) => {
            return (index1 + index2) % 2 === 0 ? val1 : val2;
        }))

        return ans;
    }
}