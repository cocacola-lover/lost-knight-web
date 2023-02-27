import Position from "./position";

/*
    Convenience Class to easily deal with two-dimensional arrays using Positions
*/

export default class Mapping2D<Type> {
    public arr : Type[][];

    constructor(height : number, width : number, defaultVal : Type) {
        this.arr = [];
        for (let i = 0; i < width; i++){
            this.arr.push([]);
            for (let j = 0; j < height; j++) this.arr[i].push(defaultVal);
        }
    }
    get width () {
        return this.arr.length;
    }

    get height () {
        return this.arr[0].length;
    }

    at (position : Position) {
        return this.arr[position.x][position.y];
    }

    setAt (position : Position, value : Type) {
        this.arr[position.x][position.y] = value;
    }

    map (func : (value : Type, index1 : number, index : number) => Type) {
        const ans = this.copy();

        for (let i = 0; i < ans.arr.length; i++) {
            for (let j = 0; j < ans.arr[0].length; j++)
                ans.arr[i][j] = func(ans.arr[i][j], i, j);
        }

        return ans;
    }

    static converterMap<TypeFrom, TypeTo> (
            from : Mapping2D<TypeFrom>, using : (value : TypeFrom) => TypeTo) {
                const ans = new Mapping2D<TypeTo>(from.height, from.width, using(from.at(new Position(0, 0))));

                from.forEach((value, index1, index2) => {
                    ans.setAt(new Position(index1, index2), using(value));
                })

                return ans;
            }

    forEach (func : (value : Type, index1 : number, index : number) => any) {
        for (let i = 0; i < this.arr.length; i++) {
            for (let j = 0; j < this.arr[0].length; j++)
                func(this.arr[i][j], i, j);
        }
    }

    copy () {
        const ans = new Mapping2D<Type>(this.arr[0].length, this.arr.length, this.arr[0][0]);

        ans.arr = ans.arr.map((row, index1) => row.map((curentVal, index2) => {
            return this.arr[index1][index2];
        }))

        return ans;
    }

    scaleTo (height : number, width : number, defaultVal : Type) {
        const ans = new Mapping2D(height, width, defaultVal);
        
        this.forEach((value, index1, index2) => {
            if (index1 >= width || index2 >= height) return;
            ans.arr[index1][index2] = value;
        })

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