import ActionType from '@/enums/ActionType';
import CellState from '@/enums/CellState';
import Difficulty, { DifficultyParams } from '@/enums/Difficulty';
import type { Action, Coordinates } from '../types/game';
import Cell from './Cell';

/**
 * Représente la grille du démineur.
 * @export
 * @class Grid
 */
export default class Grid {
    /**
     * La taille de la grille.
     * @private
     * @readonly
     * @type {number}
     * @memberof Grid
     */
    private readonly _size: number;

    /**
     * Le nombre de mines dans la grille.
     * @private
     * @readonly
     * @type {number}
     * @memberof Grid
     */
    private readonly _nbMines: number;

    /**
     * Les cellules de la grille.
     * @private
     * @readonly
     * @type {Cell[][]}
     * @memberof Grid
     */
    private readonly _cells: Cell[][];

    /**
     * Crée une instance de {@link Grid}.
     * @param {Difficulty} difficulty La difficultée.
     * @memberof Grid
     */
    public constructor(difficulty: Difficulty) {
        const { size, nbMines } = DifficultyParams[difficulty];
        this._size = size;
        this._nbMines = nbMines;
        this._cells = [];

        this.initCells();
        this.calculateNbMinesAround();
    }

    /**
     * Initialise les cellules dans la grille.
     * @private
     * @memberof Grid
     */
    private initCells(): void {
        let remainingMines = this._nbMines;
        let availableCells = this.nbCells;

        // Ajout des cellules
        for (let row = 0; row < this._size; row++) {
            const rowCells: Cell[] = [];
            for (let col = 0; col < this._size; col++) {
                // Détermine si il y a une mine ou non
                let hasMine = false;
                const probability = remainingMines / availableCells;
                if (Math.random() < probability) {
                    hasMine = true;
                    remainingMines--;
                }

                // Ajout de la cellule
                rowCells.push(new Cell(hasMine));
                availableCells--;
            }
            this._cells.push(rowCells);
        }
    }

    /**
     * Calcule le nombre de mines autour de chaque cellule.
     * @private
     * @memberof Grid
     */
    private calculateNbMinesAround(): void {
        // Parcours de toutes les cellules
        for (let row = 0; row < this._size; row++) {
            for (let column = 0; column < this._size; column++) {
                const cell = this._cells[row][column];

                // Calcul du nombre de mines
                this.forEachNeighbors({ row, column }, (_, neighbor) => {
                    if (neighbor.hasMine) {
                        cell.nbMinesAround++;
                    }
                });
            }
        }
    }

    /**
     * Récupère une cellule de la grille.
     * @private
     * @param {Coordinates} coordinates - Les coordonnées de la cellule.
     * @return {(Cell | undefined)} La cellule ou `undefined` si les coordonnées sont invalides.
     * @memberof Grid
     */
    private getCell(coordinates: Coordinates): Cell | undefined {
        return this._cells[coordinates.row]?.[coordinates.column];
    }

    /**
     * Parcours les voisins d'une cellule.
     * @private
     * @param {Coordinates} coordinates - Les coordonnées de la cellule.
     * @param {(nCoordinates: Coordinates, neighbor: Cell) => unknown} callback - Le callback à exécuter pour chaque voisin.
     * @memberof Grid
     */
    private forEachNeighbors(
        coordinates: Coordinates,
        callback: (nCoordinates: Coordinates, neighbor: Cell) => unknown
    ): void {
        //
        const { row, column } = coordinates;

        // Parcours des voisins
        for (let nRow = row - 1; nRow <= row + 1; nRow++) {
            for (let nCol = column - 1; nCol <= column + 1; nCol++) {
                // Récupération du voisin
                const nCoordinates: Coordinates = { row: nRow, column: nCol };
                const neighbor = this.getCell(nCoordinates);

                // Exécution du callback si le voisin existe
                if (neighbor) {
                    callback(nCoordinates, neighbor);
                }
            }
        }
    }

    /**
     * Découvre les voisines d'une case si elle n'a pas de mines autour d'elle.
     * @private
     * @param {Coordinates} coordinates - Les coordonnées de la case.
     * @memberof Grid
     */
    private discoverNeighbors(coordinates: Coordinates) {
        // Récupération de la cellule
        const cell = this._cells[coordinates.row][coordinates.column];
        // Si elle n'a pas de mines autour
        if (cell.nbMinesAround === 0) {
            // Découverte de ses voisines
            this.forEachNeighbors(coordinates, (nCoordinates, neighbor) => {
                if (neighbor.state !== CellState.Discovered) {
                    // Découverte de la case
                    neighbor.discover();
                    // Découverte de ses voisines
                    this.discoverNeighbors(nCoordinates);
                }
            });
        }
    }

    /**
     * La taille de la grille.
     * @readonly
     * @type {number}
     * @memberof Grid
     */
    public get size(): number {
        return this._size;
    }

    /**
     * Le nombre de cellules de la grille.
     * @readonly
     * @type {number}
     * @memberof Grid
     */
    public get nbCells(): number {
        return this._size * this._size;
    }

    /**
     * Le nombre de mines de la grille.
     * @readonly
     * @type {number}
     * @memberof Grid
     */
    public get nbMines(): number {
        return this._nbMines;
    }

    /**
     * Les cellules de la grille.
     * @readonly
     * @type {ReadonlyArray<ReadonlyArray<Cell>>}
     * @memberof Grid
     */
    public get cells(): ReadonlyArray<ReadonlyArray<Cell>> {
        return this._cells;
    }

    public get nbMinesLeft(): number {
        // Récupération des cellules maruquées
        const markedCells = this._cells.flat().filter((cell) => cell.state === CellState.Marked);
        // Calcul du nombre de mines restantes
        return this.nbMines - markedCells.length;
    }

    /**
     * Indique si la partie est gagnée, toutes les mines :
     * - minées ne sont pas découvertes
     * - non minées sont découvertes.
     * @readonly
     * @type {boolean}
     * @memberof Grid
     */
    public get isWin(): boolean {
        return this._cells
            .flat()
            .every(
                (cell) =>
                    (cell.hasMine && cell.state !== CellState.Discovered) ||
                    (!cell.hasMine && cell.state === CellState.Discovered)
            );
    }

    /**
     * Indique si la partie est perdue : au moins une mine est découverte.
     * @readonly
     * @type {boolean}
     * @memberof Grid
     */
    public get isLoose(): boolean {
        return this._cells
            .flat()
            .some((cell) => cell.state === CellState.Discovered && cell.hasMine);
    }

    /**
     * Indique si la partie est finie.
     * @readonly
     * @type {boolean}
     * @memberof Grid
     */
    public get isEnd(): boolean {
        return this.isWin || this.isLoose;
    }

    /**
     * Effectue une action du jeu.
     * @param {Action} action - L'action à effectuer.
     * @memberof Grid
     */
    public performAction(action: Action) {
        const { coordinates, type } = action;
        // Récupération de la cellule
        const cell = this.getCell(coordinates);
        if (!cell) {
            throw new Error(
                `Aucune cellule aux coordonnées (${coordinates.row}, ${coordinates.column}).`
            );
        }

        switch (type) {
            case ActionType.Discover:
                // Découverte de la cellule
                cell.discover();
                if (!cell.hasMine && cell.state === CellState.Discovered) {
                    // Découverte de ses voisines
                    this.discoverNeighbors(coordinates);
                }
                break;

            case ActionType.Mark:
                cell.toggleMarked();
                break;

            default:
                break;
        }
    }

    /**
     * Convertis la grille en string.
     * @return {string} La grille sous forme de string.
     * @memberof Grid
     */
    public toString(): string {
        let str = '';

        str += this.printColNumbers();
        for (let row = 0; row < this._size; row++) {
            str += this.lineHeaderToString() + this.printRowNumber(row) + this.printCells(row);
        }
        str += this.lineHeaderToString();

        return str;
    }

    /**
     * Convertis la ligne de séparation de la grille en string.
     * @private
     * @return {string} - La ligne de séparation de la grille sous forme de string.
     * @memberof Grid
     */
    private lineHeaderToString(): string {
        let str = '   -';

        for (let column = 0; column < this._size; column++) {
            str += '---';
        }
        str += `\n`;

        return str;
    }

    /**
     * Affiche les numéros des colonnes.
     * @private
     * @return {string} Les numéros des colonnes sous forme de string.
     * @memberof Grid
     */
    private printColNumbers(): string {
        let str = '  ';

        for (let column = 0; column < this._size; column++) {
            const printed = column + 1;
            if (printed < 10) {
                str += `  ${printed}`;
            } else {
                str += `  ${printed}`;
            }
        }
        str += '\n';

        return str;
    }

    /**
     * Affiche le numéro de la ligne.
     * @private
     * @param {number} row
     * @return {string} Le numéro de la ligne sous forme de string.
     * @memberof Grid
     */
    private printRowNumber(row: number): string {
        let str = '';

        const printedRow = row + 1;
        if (printedRow < 10) {
            str += ` ${printedRow}`;
        } else {
            str += printedRow;
        }
        str += ' ';

        return str;
    }

    /**
     * Affiche les cellules d'une ligne.
     * @private
     * @param {number} row - Le numéro de la ligne.
     * @return {string} Les cellules de la ligne sous forme de string.
     * @memberof Grid
     */
    private printCells(row: number): string {
        let str = '|';

        for (let column = 0; column < this._size; column++) {
            str += `${this._cells[row][column].toString()}|`;
        }
        str += '\n';

        return str;
    }

    /**
     * Convertis la grille en HTML.
     * @return {string} La grille sous forme de HTML.
     * @memberof Grid
     */
    public toHtml(): string {
        let html = ``;

        // Ajout des numéros de colonnes
        html += `<span class="grid-number"></span>`;
        for (let column = 0; column < this._size; column++) {
            html += `<span class="grid-number">${column + 1}</span>`;
        }

        for (let row = 0; row < this._size; row++) {
            html += `<span class="grid-number">${row + 1}</span>`;
            for (let column = 0; column < this._size; column++) {
                html += this.cells[row][column].toHtml(row, column);
            }
        }

        return html;
    }
}
