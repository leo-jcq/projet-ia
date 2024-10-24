/**
 * Représente les états d'une case.
 * @export
 * @enum {number}
 */
export enum CellState {
    /**
     * La case est couverte.
     */
    Covered = 'covered',

    /**
     * La case est marquée comme ayant une mine.
     */
    Marked = 'marked',

    /**
     * La case est découverte.
     */
    Discovered = 'discovered'
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

    /**
     * Convertis une cellule en chaîne de caractères.
     * @return {string} La chaîne de caractères représentant la cellule.
     * @memberof Cell
     */
    public toString(): string {
        switch (this._state) {
            case CellState.Covered:
                return '  ';

            case CellState.Marked:
                return '🚩';

            case CellState.Discovered:
                if (this._hasMine) {
                    return '💣';
                } else {
                    return `${this.nbMinesAround} `;
                }
        }
    }

    /**
     * Convertis une cellule en HTML.
     * @param {number} row - La ligne de la cellule.
     * @param {number} column - La colonne de la cellule.
     * @return {string} La chaîne de caractères représentant la cellule en HTML.
     * @memberof Cell
     */
    public toHtml(row: number, column: number): string {
        // Construction de la classe CSS
        const baseClass = 'game-cell';
        let className = `${baseClass} ${baseClass}--${this._state} ${baseClass}--${
            (row + column) % 2 === 0 ? 'odd' : 'even'
        }`;
        if (this._state === CellState.Discovered) {
            className += ` ${baseClass}--${this._hasMine ? 'mine' : this.nbMinesAround}`;
        }

        return `
        <button class="${className}" data-row="${row}" data-column="${column}">
            ${this.toString().trim().replace('0', '')}
        </button>
        `;
    }
}

export default Cell;
