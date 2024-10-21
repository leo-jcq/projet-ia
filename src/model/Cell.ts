/**
 * Représente les états d'une case.
 * @export
 * @enum {number}
 */
export enum CellState {
    /**
     * La case est couverte.
     */
    Covered,

    /**
     * La case est marquée comme ayant une mine.
     */
    Marked,

    /**
     * La case est découverte.
     */
    Discovered
}

/**
 * Représente une case du démineur.
 * @export
 * @class Cell
 */
class Cell {
    /**
     * Indique si la case est minée.
     * @private
     * @type {boolean}
     * @memberof Cell
     */
    private _hasMine: boolean;

    /**
     * L'état de la case.
     * @private
     * @type {CellState}
     * @memberof Cell
     */
    private _state: CellState;

    /**
     * Le nombre de mines autour de la cellule.
     * @type {number}
     * @memberof Cell
     */
    public nbMinesAround: number;

    /**
     * Crée une instance de {@link Cell}.
     * @param {boolean} hasMine - Indique si la case est minée.
     * @memberof Celld
     */
    public constructor(hasMine: boolean) {
        this._hasMine = hasMine;
        this._state = CellState.Covered;
        this.nbMinesAround = 0;
    }

    /**
     * Indique si la case est minée.
     * @readonly
     * @type {boolean}
     * @memberof Cell
     */
    public get hasMine(): boolean {
        return this._hasMine;
    }

    /**
     * L'état de la case.
     * @readonly
     * @type {CellState}
     * @memberof Cell
     */
    public get state(): CellState {
        return this._state;
    }

    /**
     * Place une mine dans la cellule
     * @memberof Cell
     */
    public putMine(): void {
        this._hasMine = true;
    }

    /**
     * Découvre la case.
     * @memberof Cell
     */
    public discover(): void {
        this._state = CellState.Discovered;
    }

    /**
     * Inverse l'état de marquage de la case.
     * @memberof Cell
     */
    public invertMarked(): void {
        if (this._state !== CellState.Discovered) {
            this._state = this._state === CellState.Marked ? CellState.Covered : CellState.Marked;
        }
    }

    public toString(): string {
        switch (this._state) {
            case CellState.Covered:
                return '';

            case CellState.Marked:
                return '🚩';

            case CellState.Discovered:
                if (this._hasMine) {
                    return '💣';
                } else {
                    return String(this.nbMinesAround);
                }
        }
    }
}

export default Cell;
