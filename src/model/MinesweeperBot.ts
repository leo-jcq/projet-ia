import { MAX_DELAY, MIN_DELAY } from '@/constants/defaults';
import ActionType, { ActionTypeToString } from '@/enums/ActionType';
import CellState from '@/enums/CellState';
import Difficulty from '@/enums/Difficulty';
import { Action, CellInfo, Coordinates } from '@/types/game';
import wait from '@/utils/wait';
import Grid from './Grid';

/**
 * Représente un bot utilisant l'algorithme de Dijkstra pour résoudre un démineur.
 * @export
 * @class MinesweeperBot
 */
export default class MinesweeperBot {
    /**
     * La grille du démineur.
     * @readonly
     * @type {Grid}
     * @memberof MinesweeperBot
     */
    public readonly grid: Grid;

    /**
     * La grille connue du bot.
     * @private
     * @readonly
     * @type {CellInfo[][]}
     * @memberof MinesweeperBot
     */
    private readonly _knownGrid: CellInfo[][];

    /**
     * Le délai entre chaque tour.
     * @private
     * @type {number}
     * @memberof MinesweeperBot
     */
    private _delay: number;

    /**
     * Indique si il faut montrer toute la résolution.
     * @type {boolean}
     * @memberof MinesweeperBot
     */
    public showFullSolving: boolean;

    /**
     * Indique si il faut afficher dans la console.
     * @type {boolean}
     * @memberof MinesweeperBot
     */
    public printConsole: boolean;

    /**
     * Indique si le bot doit continuer de résoudre le démineur.
     * Sers à stopper le bot de l'extérieur.
     * @private
     * @type {boolean}
     * @memberof MinesweeperBot
     */
    private _continueSolve: boolean;

    /**
     * L'élément HTML de la grille du démineur.
     * @private
     * @readonly
     * @type {HTMLElement}
     * @memberof MinesweeperBot
     */
    private readonly _gameGrid?: HTMLElement;

    /**
     * L'élément HTML de l'historique des actions du bot.
     * @private
     * @type {HTMLElement}
     * @memberof MinesweeperBot
     */
    private readonly _history?: HTMLElement;

    /**
     * Crée une instance de {@link MinesweeperBot}.
     * @param {Difficulty} difficulty - La difficulté du démineur.
     * @param {HTMLElement} [gameGrid] - L'élément HTML de la grille du démineur.
     * @param {HTMLElement} [history] - L'élément HTML de l'historique des actions du bot.
     * @memberof MinesweeperBot
     */
    public constructor(
        difficulty: Difficulty,
        delay: number,
        showFullSolving: boolean,
        gameGrid?: HTMLElement,
        history?: HTMLElement
    ) {
        this.grid = new Grid(difficulty);
        this._knownGrid = [];
        this._delay = delay;
        this.showFullSolving = showFullSolving;
        this._continueSolve = true;
        this._gameGrid = gameGrid;
        this._history = history;
        this.printConsole = false;

        this.initializeKnownGrid();
    }

    /**
     * Initialise la grille connue du bot.
     * @private
     * @memberof MinesweeperBot
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
     * @memberof MinesweeperBot
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
     * @memberof MinesweeperBot
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
     * @return {(Action | null)} L'action sûr à effectuer, ou `null` si aucune action sûr n'est trouvée.
     * @memberof MinesweeperBot
     */
    private async findSafeAction(): Promise<Action | null> {
        // Parcours des cellules
        for (let row = 0; row < this.grid.size; row++) {
            for (let column = 0; column < this.grid.size; column++) {
                if (this.showFullSolving) {
                    this.display({ row, column });
                }

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

                    if (this.showFullSolving) {
                        await wait(this._delay);
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
     * @return {(Action | null)} Le mouvement le moins risqué à effectuer, ou `null` si aucun mouvement n'est trouvé.
     * @memberof MinesweeperBot
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
                const coordinates: Coordinates = { row, column };
                if (this.showFullSolving) {
                    this.display(coordinates);
                }

                // Si la cellule est couverte
                if (this._knownGrid[row][column].state === CellState.Covered) {
                    // Calcul de la probabilité qu'elle ait une mine
                    const probability = await this.calculateMineProbability(
                        coordinates,
                        defaultProbability
                    );
                    // Ajout de la probabilité
                    probabilities.push({ coordinates, probability });
                }

                if (this.showFullSolving) {
                    await wait(this._delay);
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
     * @memberof MinesweeperBot
     */
    private async calculateMineProbability(
        coordinates: Coordinates,
        defaultProbability: number
    ): Promise<number> {
        if (this.showFullSolving) {
            // Attente et affichage
            await wait(this.delay);
            this.display(coordinates);
        }

        // Récupération des voisines découvertes
        const discoveredNeighbors = this.getNeighbors(coordinates).filter(
            (n) => this._knownGrid[n.row][n.column].state === CellState.Discovered
        );

        // Initialisation des variables
        let totalMines = 0; // Le total de mines autour
        let totalPossibleMines = 0; // Le nombre total de possibles mines autour

        // Parcours des voisines découvertes
        for (const neighborCoordinates of discoveredNeighbors) {
            if (this.showFullSolving) {
                // Attente et affichage
                await wait(this.delay);
                this.display(coordinates);
            }

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
     * Affiche une action dans l'historique.
     * @private
     * @param {Action} action - L'action à afficher.
     * @memberof MinesweeperBot
     */
    private displayAction(action: Action): void {
        // Pas d'affichage si on a pas l'élement HTML
        if (!this._history) return;

        // Conversion en chaîne de caractères
        const { coordinates, type } = action;
        const actionString = ActionTypeToString[type];
        const coordinatesString = `(${coordinates.row + 1}, ${coordinates.column + 1})`;

        // Ajout de l'action à l'historique
        this._history.textContent += `${actionString} de la case ${coordinatesString}\n`;
    }

    /**
     * Le délai entre chaque tour.
     * @type {number}
     * @memberof MinesweeperBot
     */
    public get delay(): number {
        return this._delay;
    }

    /**
     * Le délai entre chaque tour.
     * @type {number}
     * @memberof MinesweeperBot
     */
    public set delay(value: number) {
        if (value >= MIN_DELAY && value < MAX_DELAY) {
            this._delay = value;
        }
    }

    /**
     * Affiche la grille du démineur.
     * @memberof MinesweeperBot
     */
    public display(current?: Coordinates): void {
        // Si on a l'élement HTML de la grille
        if (this._gameGrid) {
            // Affichage de la grille en HTML
            this._gameGrid.innerHTML = this.grid.toHtml();
            if (current) {
                const currentElement = document.querySelector<HTMLDivElement>(
                    `.game-cell[data-row="${current.row}"][data-column="${current.column}"]`
                );
                if (currentElement) {
                    currentElement.classList.add('game-cell--current');
                }
            }
        } else if (this.printConsole) {
            // Affichage dans la console
            console.clear();
            console.log(this.grid.toString());
        }
    }

    /**
     * Arrête la résolution du démineur.
     * @memberof MinesweeperBot
     */
    public stopSolving(): void {
        this._continueSolve = false;
    }

    /**
     * Résout le démineur.
     * @memberof MinesweeperBot
     */
    public async solve(): Promise<void> {
        // Premier coup
        const firstAction: Action = {
            coordinates: { row: 0, column: 0 },
            type: ActionType.Discover
        };
        this.display(this.showFullSolving ? firstAction.coordinates : undefined);
        this.grid.performAction(firstAction);
        this.display(this.showFullSolving ? firstAction.coordinates : undefined);

        while (!this.grid.isEnd && this._continueSolve) {
            // Mise à jour de la grille connue avec les informations actuelles
            this.updateKnownGrid();

            let action = await this.findSafeAction();
            if (!action) {
                action = await this.findLeastRiskyMove();

                // Aucune action trouvée
                if (!action) {
                    break;
                }
            }

            if (this.showFullSolving) {
                this.display(action.coordinates);
            }

            this.grid.performAction(action);
            this.displayAction(action);

            if (this.showFullSolving) {
                this.display(action.coordinates);
            }

            // Attente avant le prochain tour
            this.display();
            await wait(this._delay);
        }

        // Marquage des mines restantes si on a gagné
        if (this.grid.isWin) {
            // Parcours des cellules
            for (let row = 0; row < this.grid.size; row++) {
                for (let column = 0; column < this.grid.size; column++) {
                    // Récupération de la cellule
                    const cell = this._knownGrid[row][column];

                    // Si la cellule est couverte
                    if (cell.state === CellState.Covered) {
                        // Création de l'action
                        const action: Action = {
                            coordinates: { row, column },
                            type: ActionType.Mark
                        };
                        // Marquage de la cellule
                        this.grid.performAction(action);

                        // Affichage
                        this.display();
                        this.displayAction(action);

                        // Attente
                        await wait(this._delay);
                    }
                }
            }
        }
    }
}
