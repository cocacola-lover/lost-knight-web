export default class Position {
    public x : number;
    public y : number;

    constructor(x : number, y : number) {
        this.x = x;
        this.y = y;
    }

    copy() {
        return new Position(this.x, this.y);
    }

    static same (pos1 : Position, pos2 : Position) {
        return pos1.x === pos2.x && pos1.y === pos2.y;    
    }
}