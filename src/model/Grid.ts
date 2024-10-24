import type { Action, Coordinates } from '../types/game';
import Cell, { CellState } from './Cell';

/**
 * Les actions possibles dans le jeu.
 * @export
 * @enum {string}
 */
export enum ActionType {
    /**
     * Découvrir une case.
     */
    Discover = 'd',

    /**
     * Marquer une case.
     */
    Mark = 'm'
}

/**
 * Les difficultées du jeu.
 * @export
 * @enum {string}
 */
export enum Difficulty {
    /**
     * Facile.
     */
    Easy = 'easy',

    /**
     * Moyen.
     */
    Medium = 'medium',

    /**
     * Difficile.
     */
    Hard = 'hard'
}

/**
 * Les paramètres d'une grille.
 */
type GridParam = {
    /**
     * La taille de la grille.
     */
    size: number;

    /**
     * Le nombre de mines dans la grille.
     */
    nbMines: number;
};

/**
 * Les paramètres des difficultées.
 * @type {Record<Difficulty, GridParam>}
 */
export const DifficultyParams: Record<Difficulty, GridParam> = {
    [Difficulty.Easy]: {
        size: 10,
        nbMines: 10
    },
    [Difficulty.Medium]: {
        size: 18,
        nbMines: 40
    },
    [Difficulty.Hard]: {
        size: 24,
        nbMines: 99
    }
};

/**
 * Représente la grille du démineur.
 * @export
 * @class Grid
 */
class Grid {
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
                let hasMine: boolean = false;
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
                // Récupération de la cellule
                const cell = this._cells[row][column];

                // Récupération de ses voisines
                const neighbors = this.getNeighbors({ row, column });

                cell.nbMinesAround = neighbors.reduce(
                    (count, neighbor) =>
                        this._cells[neighbor.row][neighbor.column].hasMine ? count + 1 : count,
                    0
                );
            }
        }
    }

    /**
     * Les directions des voisines d'une cellule.
     * @private
     * @static
     * @readonly
     * @type {ReadonlyArray<Coordinates>}
     * @memberof Grid
     */
    private static readonly neighborsDirections: ReadonlyArray<Coordinates> = [
        { row: -1, column: -1 }, // Haut-gauche
        { row: -1, column: 0 }, // Haut
        { row: -1, column: 1 }, // Haut-droite
        { row: 0, column: -1 }, // Gauche
        { row: 0, column: 1 }, // Droite
        { row: 1, column: -1 }, // Bas-gauche
        { row: 1, column: 0 }, // Bas
        { row: 1, column: 1 } // Bas-droite
    ];

    /**
     * Récupère les cellules voisines d'une cellule.
     * @private
     * @param {Coordinates} - Les coordonnées de la cellule.
     * @return {Coordinates[]} Les coordonnées des cellules voisines.
     * @memberof Grid
     */
    private getNeighbors({ row, column }: Coordinates): Coordinates[] {
        // Initialisation de la liste des voisines
        const neighbors: Coordinates[] = [];

        for (const { row: dRow, column: dCol } of Grid.neighborsDirections) {
            // Calcul des coordonnées de la voisine
            const newRow = row + dRow;
            const newCol = column + dCol;

            // Vérification des limites de la grille
            if (newRow >= 0 && newRow < this._size && newCol >= 0 && newCol < this._size) {
                // Ajout de la voisine
                neighbors.push({ row: newRow, column: newCol });
            }
        }

        return neighbors;
    }

    /**
     * Découvre les voisines d'une case si elle n'a pas de mines autour d'elle.
     * @private
     * @param {Coordinates} coordinates Les coordonnées de la case.
     * @memberof Grid
     */
    private discoverNeighbors(coordinates: Coordinates) {
        // Récupération de la cellule
        const cell = this._cells[coordinates.row][coordinates.column];
        // Si elle n'a pas de mines autour
        if (cell.nbMinesAround === 0) {
            // Récupération de ses voisines
            const neighbors = this.getNeighbors(coordinates);
            for (const neighbor of neighbors) {
                const neighborCell = this._cells[neighbor.row][neighbor.column];
                if (neighborCell.state !== CellState.Discovered) {
                    // Découverte de la case
                    neighborCell.discover();
                    // Découverte de ses voisines
                    this.discoverNeighbors(neighbor);
                }
            }
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

    public get cells(): ReadonlyArray<ReadonlyArray<Cell>> {
        return this._cells;
    }

    /**
     * Récupère une cellule de la grille.
     * @param {Coordinates} coord - Les coordonnées de la cellule.
     * @return {(Cell | null)} La cellule ou `null` si les coordonnées sont invalides.
     * @memberof Grid
     */
    public getCell({ row, column }: Coordinates): Cell | null {
        return this._cells[row]?.[column] ?? null;
    }

    /**
     * Effectue une action du jeu.
     * @param {Action} move - L'action à effectuer.
     * @memberof Grid
     */
    public action({ coordinates, type }: Action) {
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
                if (!cell.hasMine) {
                    // Découverte de ses voisines
                    this.discoverNeighbors(coordinates);
                }
                break;

            case ActionType.Mark:
                cell.invertMarked();
                break;

            default:
                break;
        }
    }

    /**
     * Découvre toutes les mines de la grille.
     * @memberof Grid
     */
    public discoverMines(): void {
        for (let row = 0; row < this.size; row++) {
            for (let column = 0; column < this.size; column++) {
                const cell = this._cells[row][column];
                console.log(cell);
                if (cell.hasMine) {
                    cell.discover();
                }
            }
        }
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
        return this._cells.every((row) =>
            row.every(
                (cell) =>
                    (cell.hasMine && cell.state !== CellState.Discovered) ||
                    (!cell.hasMine && cell.state === CellState.Discovered)
            )
        );
    }

    /**
     * Indique si la partie est perdue : au moins une mine est découverte.
     * @readonly
     * @type {boolean}
     * @memberof Grid
     */
    public get isLoose(): boolean {
        return this._cells.some((row) =>
            row.some((cell) => cell.state === CellState.Discovered && cell.hasMine)
        );
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
     * @return {string} - Les numéros des colonnes sous forme de string.
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
     * @return {string} - Le numéro de la ligne sous forme de string.
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
     * @return {string} - Les cellules de la ligne sous forme de string.
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
        let html = '';

        for (let row = 0; row < this._size; row++) {
            for (let column = 0; column < this._size; column++) {
                html += this.cells[row][column].toHtml(row, column);
            }
        }

        return html;
    }
}

export default Grid;
