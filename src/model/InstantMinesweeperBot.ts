import ActionType from '@/enums/ActionType';
import CellState from '@/enums/CellState';
import Difficulty from '@/enums/Difficulty';
import { Action, CellInfo, Coordinates } from '@/types/game';
import Grid from './Grid';
import MinesweeperBot from './MinesweeperBot';

/**
 * Version instantanée de {@link MinesweeperBot} (sans attente entre les coups).
 * @export
 * @class MinesweeperBot
 */
export default class InstantMinesweeperBot {
    /**
     * La grille du démineur.
     * @readonly
     * @type {Grid}
     * @memberof InstantMinesweeperBot
     */
    public readonly grid: Grid;

    /**
     * La grille connue du bot.
     * @private
     * @readonly
     * @type {CellInfo[][]}
     * @memberof InstantMinesweeperBot
     */
    private readonly _knownGrid: CellInfo[][];

    /**
     * Indique si le bot doit continuer de résoudre le démineur.
     * Sers à stopper le bot de l'extérieur.
     * @private
     * @type {boolean}
     * @memberof InstantMinesweeperBot
     */
    private _continueSolve: boolean;

    /**
     * Crée une instance de {@link MinesweeperBot}.
     * @param {Difficulty} difficulty - La difficulté du démineur.
     * @memberof InstantMinesweeperBot
     */
    public constructor(difficulty: Difficulty) {
        this.grid = new Grid(difficulty);
        this._knownGrid = [];
        this._continueSolve = true;

        this.initializeKnownGrid();
    }

    /**
     * Initialise la grille connue du bot.
     * @private
     * @memberof InstantMinesweeperBot
     */
    private initializeKnownGrid(): void {
        // Parcours des lignes
        for (let row = 0; row < this.grid.size; row++) {
            // Initialisation de la ligne
            this._knownGrid[row] = [];
            // Parcours des colonnes
            for (let column = 0; column < this.grid.size; column++) {
                // Initialisation de la cellule
                this._knownGrid[row][column] = {
                    state: CellState.Covered
                };
            }
        }
    }

    /**
     * Met à jour la grille connue du bot avec les informations actuelles.
     * @private
     * @memberof InstantMinesweeperBot
     */
    private updateKnownGrid(): void {
        // Parcours de la grille
        for (let row = 0; row < this.grid.size; row++) {
            for (let column = 0; column < this.grid.size; column++) {
                // Récupération de la cellule
                const gridCell = this.grid.cells[row][column];
                const knownCell = this._knownGrid[row][column];

                // Mise à jour de l'état de la cellule
                knownCell.state = gridCell.state;
                // Si la cellule est découverte
                if (gridCell.state === CellState.Discovered) {
                    // Mise à jour du nombre de mines autour
                    knownCell.nbMinesAround = gridCell.nbMinesAround;
                }
            }
        }
    }

    /**
     * Récupère les coordonnées des voisines d'une cellule.
     * @private
     * @param {Coordinates} coordinates - Les coordonnées de la cellule.
     * @return {Coordinates[]} Les coordonnées des voisines d'une cellule.
     * @memberof InstantMinesweeperBot
     */
    private getNeighbors(coordinates: Coordinates): Coordinates[] {
        const { row, column } = coordinates;
        // Initialisation de la liste des voisines
        const neighbors: Coordinates[] = [];

        // Parcours des voisines
        for (let nRow = row - 1; nRow <= row + 1; nRow++) {
            for (let nCol = column - 1; nCol <= column + 1; nCol++) {
                // Vérification si on est dans les limites de la grille : [0, taille[
                if (nRow >= 0 && nRow < this.grid.size && nCol >= 0 && nCol < this.grid.size) {
                    // Ajout de la voisine
                    neighbors.push({ row: nRow, column: nCol });
                }
            }
        }

        // Renvoi de la liste
        return neighbors;
    }

    /**
     * Trouve une action sûr à effectuer.
     * @private
     * @return {Promise<Action | null>} L'action sûr à effectuer, ou `null` si aucune action sûr n'est trouvée.
     * @memberof InstantMinesweeperBot
     */
    private async findSafeAction(): Promise<Action | null> {
        // Parcours des cellules
        for (let row = 0; row < this.grid.size; row++) {
            for (let column = 0; column < this.grid.size; column++) {
                // Récupération de la cellule
                const cell = this._knownGrid[row][column];

                // Si la cellule est découverte
                if (cell.state === CellState.Discovered && cell.nbMinesAround !== undefined) {
                    // Récupération des voisines
                    const neighbors = this.getNeighbors({ row, column });

                    // Récupération des voisines couvertes
                    const coveredNeighbors = neighbors.filter(
                        (n) => this._knownGrid[n.row][n.column].state === CellState.Covered
                    );
                    // Si aucune voisine couverte, on passe à la cellule suivante
                    if (coveredNeighbors.length === 0) continue;

                    // Récupération des voisins marqués
                    const markedNeighbors = neighbors.filter(
                        (n) => this._knownGrid[n.row][n.column].state === CellState.Marked
                    );

                    // Si il y autant de de voisins marqués que de cellules autours
                    if (markedNeighbors.length === cell.nbMinesAround) {
                        // Récupéraiton de l'action
                        return {
                            type: ActionType.Discover,
                            coordinates: coveredNeighbors[0]
                        };
                    }

                    // Si il y autant de de voisines couvertes que mines autours
                    // et des voisines encore couvertes
                    if (coveredNeighbors.length === cell.nbMinesAround - markedNeighbors.length) {
                        // Récupération de l'action
                        return {
                            type: ActionType.Mark,
                            coordinates: coveredNeighbors[0]
                        };
                    }
                }
            }
        }

        // Aucune action sûr trouvée
        return null;
    }

    /**
     * Trouve le mouvement le moins risqué à effectuer.
     * @private
     * @return {Promise<Action | null>} Le mouvement le moins risqué à effectuer, ou `null` si aucun mouvement n'est trouvé.
     * @memberof InstantMinesweeperBot
     */
    private async findLeastRiskyMove(): Promise<Action | null> {
        // Initialisation de la liste des probabilités qu'il ait une mine pour chaque coordonnée
        const probabilities: {
            coordinates: Coordinates;
            probability: number;
        }[] = [];

        // Calcul de la probabilité par défaut
        const flatGrid = this._knownGrid.flat();
        const coveredCells = flatGrid.filter((cellInfo) => cellInfo.state === CellState.Covered);
        const markedCells = flatGrid.filter((cellInfo) => cellInfo.state === CellState.Marked);
        // Probabilité = (nombre de mines restantes - nombre de cellules marquées) / nombre de cellules couvertes
        const defaultProbability =
            coveredCells.length === 0
                ? 0
                : (this.grid.nbMinesLeft - markedCells.length) / coveredCells.length;

        // Parcours des cellules
        for (let row = 0; row < this.grid.size; row++) {
            for (let column = 0; column < this.grid.size; column++) {
                // Si la cellule est couverte
                if (this._knownGrid[row][column].state === CellState.Covered) {
                    const coordinates: Coordinates = { row, column };

                    // Calcul de la probabilité qu'elle ait une mine
                    const probability = await this.calculateMineProbability(
                        coordinates,
                        defaultProbability
                    );
                    // Ajout de la probabilité
                    probabilities.push({ coordinates, probability });
                }
            }
        }

        // Renoi de null si aucune probabilité n'est trouvée
        if (probabilities.length === 0) {
            return null;
        }

        // Trier par probabilité croissante
        probabilities.sort((a, b) => a.probability - b.probability);

        // Renvoi de la probabilité la plus faible
        return {
            type: ActionType.Discover,
            coordinates: probabilities[0].coordinates
        };
    }

    /**
     * Calcule la probabilité qu'une cellule contienne une mine.
     * @private
     * @param {Coordinates} coordinates - Les coordonnées de la cellule.
     * @return {number} La probabilité qu'une cellule contienne une mine.
     * @memberof InstantMinesweeperBot
     */
    private async calculateMineProbability(
        coordinates: Coordinates,
        defaultProbability: number
    ): Promise<number> {
        // Récupération des voisines découvertes
        const discoveredNeighbors = this.getNeighbors(coordinates).filter(
            (n) => this._knownGrid[n.row][n.column].state === CellState.Discovered
        );

        // Initialisation des variables
        let totalMines = 0; // Le total de mines autour
        let totalPossibleMines = 0; // Le nombre total de possibles mines autour

        // Parcours des voisines découvertes
        for (const neighborCoordinates of discoveredNeighbors) {
            // Récupération de la cellule
            const neighbor = this._knownGrid[neighborCoordinates.row][neighborCoordinates.column];

            // Si on connait le nombre de mines autour de la cellule
            if (neighbor.nbMinesAround !== undefined) {
                // Récupération de ses voisines
                const neighborCells = this.getNeighbors(neighborCoordinates);

                // Récupération de ses voisines couvertes
                const neighborCoveredCells = neighborCells.filter(
                    (n) => this._knownGrid[n.row][n.column].state === CellState.Covered
                );

                // Récupération de ses voisines marquées
                const markedMines = neighborCells.filter(
                    (n) => this._knownGrid[n.row][n.column].state === CellState.Marked
                );

                // Calcul
                totalMines += Math.max(0, neighbor.nbMinesAround - markedMines.length);
                totalPossibleMines += neighborCoveredCells.length;
            }
        }

        // Retourne la probabilité calculée ou la probabilité par défaut si aucune probabilité n'est trouvée
        return totalPossibleMines > 0 ? totalMines / totalPossibleMines : defaultProbability;
    }

    /**
     * Arrête la résolution du démineur.
     * @memberof InstantMinesweeperBot
     */
    public stopSolving(): void {
        this._continueSolve = false;
    }

    /**
     * Résout le démineur.
     * @memberof InstantMinesweeperBot
     * @return {Promise<number>} Le temps de résolution (en milisecondes).
     */
    public async solve(): Promise<number> {
        const startTime = Date.now();

        // Premier coup
        const firstAction: Action = {
            coordinates: { row: 0, column: 0 },
            type: ActionType.Discover
        };
        this.grid.performAction(firstAction);

        while (!this.grid.isEnd && this._continueSolve) {
            // Mise à jour de la grille connue avec les informations actuelles
            this.updateKnownGrid();

            // Recherche de l'action à trouver
            let action = await this.findSafeAction();
            if (!action) {
                action = await this.findLeastRiskyMove();

                // Aucune action trouvée
                if (!action) {
                    break;
                }
            }

            this.grid.performAction(action);
        }

        return Date.now() - startTime;
    }
}
