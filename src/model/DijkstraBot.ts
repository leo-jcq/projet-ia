import ActionType from '@/enums/ActionType';
import CellState from '@/enums/CellState';
import Difficulty from '@/enums/Difficulty';
import { Action, Coordinates } from '@/types/game';
import wait from '@/utils/wait';
import Grid from './Grid';

export default class DijkstraBot {
    public readonly grid: Grid;
    private readonly _knownGrid: Array<
        Array<{
            nbMinesAround?: number;
            isMined?: boolean;
            state: CellState;
        }>
    > = [];

    private readonly _gameGrid?: HTMLElement;

    constructor(difficulty: Difficulty, gameGrid?: HTMLElement) {
        this.grid = new Grid(difficulty);
        this.initializeKnownGrid();
        this._gameGrid = gameGrid;
    }

    private initializeKnownGrid(): void {
        for (let row = 0; row < this.grid.size; row++) {
            this._knownGrid[row] = [];
            for (let col = 0; col < this.grid.size; col++) {
                this._knownGrid[row][col] = { state: CellState.Covered };
            }
        }
    }

    private updateKnownGrid(): void {
        for (let row = 0; row < this.grid.size; row++) {
            for (let col = 0; col < this.grid.size; col++) {
                const gridCell = this.grid.cells[row][col];
                const knownCell = this._knownGrid[row][col];

                knownCell.state = gridCell.state;
                if (gridCell.state === CellState.Discovered) {
                    knownCell.nbMinesAround = gridCell.nbMinesAround;
                }
            }
        }
    }

    private findSafeMove(): Action | null {
        for (let row = 0; row < this.grid.size; row++) {
            for (let col = 0; col < this.grid.size; col++) {
                const cell = this._knownGrid[row][col];
                if (cell.state === CellState.Discovered && cell.nbMinesAround !== undefined) {
                    const neighbors = this.getNeighbors({ row, column: col });
                    const coveredNeighbors = neighbors.filter(
                        (n) => this._knownGrid[n.row][n.column].state === CellState.Covered
                    );

                    const markedMines = neighbors.filter(
                        (n) => this._knownGrid[n.row][n.column].state === CellState.Marked
                    );

                    // Si le nombre de mines marquées correspond au nombre de mines autour
                    if (markedMines.length === cell.nbMinesAround) {
                        // Découvrir toutes les cases non marquées
                        const safeMoves = coveredNeighbors.filter(
                            (n) => this._knownGrid[n.row][n.column].state !== CellState.Marked
                        );

                        if (safeMoves.length > 0) {
                            return {
                                type: ActionType.Discover,
                                coordinates: safeMoves[0]
                            };
                        }
                    }

                    // Si le nombre de cases couvertes correspond au nombre de mines restantes
                    if (coveredNeighbors.length === cell.nbMinesAround - markedMines.length) {
                        // Marquer toutes les cases couvertes restantes
                        const mineMoves = coveredNeighbors.filter(
                            (n) => this._knownGrid[n.row][n.column].state !== CellState.Marked
                        );

                        if (mineMoves.length > 0) {
                            return {
                                type: ActionType.Mark,
                                coordinates: mineMoves[0]
                            };
                        }
                    }
                }
            }
        }

        

        return null;
    }

    private findLeastRiskyMove(): Action | null {
        const probabilities: Array<{
            coordinates: Coordinates;
            probability: number;
        }> = [];

        for (let row = 0; row < this.grid.size; row++) {
            for (let col = 0; col < this.grid.size; col++) {
                if (this._knownGrid[row][col].state === CellState.Covered) {
                    const probability = this.calculateMineProbability({ row, column: col });
                    probabilities.push({ coordinates: { row, column: col }, probability });
                }
            }
        }

        // Trier par probabilité croissante
        probabilities.sort((a, b) => a.probability - b.probability);

        return probabilities.length > 0
            ? {
                  type: ActionType.Discover,
                  coordinates: probabilities[0].coordinates
              }
            : null;
    }

    private calculateMineProbability(coordinates: Coordinates): number {
        const neighbors = this.getNeighbors(coordinates);
        const discoveredNeighbors = neighbors.filter(
            (n) => this._knownGrid[n.row][n.column].state === CellState.Discovered
        );

        if (discoveredNeighbors.length === 0) return 0.5; // probabilité par défaut

        let totalMines = 0;
        let totalPossibleMines = 0;

        for (const neighbor of discoveredNeighbors) {
            const cell = this._knownGrid[neighbor.row][neighbor.column];
            if (cell.nbMinesAround !== undefined) {
                const neighborCoveredCells = this.getNeighbors(neighbor).filter(
                    (n) => this._knownGrid[n.row][n.column].state === CellState.Covered
                );

                const markedMines = this.getNeighbors(neighbor).filter(
                    (n) => this._knownGrid[n.row][n.column].state === CellState.Marked
                );

                totalMines += Math.max(0, cell.nbMinesAround - markedMines.length);
                totalPossibleMines += neighborCoveredCells.length;
            }
        }

        return totalPossibleMines > 0 ? totalMines / totalPossibleMines : 0.5;
    }

    private exploreRandomUncovered(): Action | null {
        const coveredCells: Coordinates[] = [];

        for (let row = 0; row < this.grid.size; row++) {
            for (let col = 0; col < this.grid.size; col++) {
                if (this._knownGrid[row][col].state === CellState.Covered) {
                    coveredCells.push({ row, column: col });
                }
            }
        }

        return coveredCells.length > 0
            ? {
                  type: ActionType.Discover,
                  coordinates: coveredCells[Math.floor(Math.random() * coveredCells.length)]
              }
            : null;
    }

    private getNeighbors(coordinates: Coordinates): Coordinates[] {
        const neighbors: Coordinates[] = [];
        const directions = [
            { row: -1, column: -1 },
            { row: -1, column: 0 },
            { row: -1, column: 1 },
            { row: 0, column: -1 },
            { row: 0, column: 1 },
            { row: 1, column: -1 },
            { row: 1, column: 0 },
            { row: 1, column: 1 }
        ];

        for (const dir of directions) {
            const newRow = coordinates.row + dir.row;
            const newCol = coordinates.column + dir.column;

            if (newRow >= 0 && newRow < this.grid.size && newCol >= 0 && newCol < this.grid.size) {
                neighbors.push({ row: newRow, column: newCol });
            }
        }

        return neighbors;
    }

    public display(): void {
        if (this._gameGrid) {
            this._gameGrid.innerHTML = this.grid.toHtml();
        } else {
            console.clear();
            console.log(this.grid.toString());
        }
    }

  
    public async solve(delay: number = 500) {
        while (!this.grid.isEnd) {
            // Affichage
            this.display();

            // Mise à jour de la grille connue avec les informations actuelles
            this.updateKnownGrid();

            // Stratégies de résolution par ordre de priorité
            const strategies = [
                this.findSafeMove,
                this.findLeastRiskyMove,
                this.exploreRandomUncovered
            ];

            for (const strategy of strategies) {
                const move = strategy.call(this);
                if (move) {
                    this.grid.performAction(move);
                    break;
                }
            }

            // Attente avant le prochain tour
            await wait(delay);
        }
    }
}
