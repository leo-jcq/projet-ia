import Cell, { CellState } from '@/model/Cell';
import Grid, { ActionType, Difficulty, DifficultyParams } from '@/model/Grid';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('Grid', () => {
    const difficulty = Difficulty.Easy;
    let grid: Grid;

    beforeEach(() => {
        grid = new Grid(difficulty);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('constructor', () => {
        it('should create a grid with the right size', () => {
            // Arrange
            const { size } = DifficultyParams[difficulty];

            // Assert
            expect(grid.size).toBe(size);
            expect(grid.nbCells).toBe(size * size);
            expect(grid.cells).toHaveLength(size);
            grid.cells.forEach((row) => {
                expect(row).toHaveLength(size);
            });
        });

        it('should create a grid with the right number of mines', () => {
            // Arrange
            const { nbMines } = DifficultyParams[difficulty];

            // Assert
            let placedMines = 0;
            grid.cells.forEach((row) => {
                row.forEach((cell) => {
                    expect(cell).toBeInstanceOf(Cell);
                    if (cell.hasMine) {
                        placedMines++;
                    }
                });
            });
            expect(placedMines).toBe(nbMines);
        });
    });

    describe('performAction', () => {
        it('should discover a cell', () => {
            // Arrange
            const row = 0;
            const column = 0;
            const cell = grid.cells[row][column];

            // Act
            grid.performAction({ coordinates: { row, column }, type: ActionType.Discover });

            // Assert
            expect(cell.state).toBe(CellState.Discovered);
        });

        it('should mark a cell', () => {
            // Arrange
            const row = 0;
            const column = 0;
            const cell = grid.cells[row][column];

            // Act
            grid.performAction({ coordinates: { row, column }, type: ActionType.Mark });

            // Assert
            expect(cell.state).toBe(CellState.Marked);
        });

        it('should throw an error if the coordinates are invalid', () => {
            // Arrange
            const row = -1;
            const column = 0;

            // Assert
            expect(() => {
                // Act
                grid.performAction({ coordinates: { row, column }, type: ActionType.Discover });
            }).toThrowError();
        });
    });

    describe('discoverNeighbors', () => {
        it('should discover neighbors cells when a empty cell is discovered', () => {
            // Arrange
            // Force une cellul à ne pas avoir de mines
            const row = 5;
            const column = 5;
            const cell = grid.cells[row][column];
            vi.spyOn(cell, 'hasMine', 'get').mockReturnValue(false);
            vi.spyOn(cell, 'nbMinesAround', 'get').mockReturnValue(0);

            // Act
            grid.performAction({ coordinates: { row, column }, type: ActionType.Discover });

            // Assert
            for (let i = row - 1; i <= row + 1; i++) {
                for (let j = column - 1; j <= column + 1; j++) {
                    const neighborCell = grid.cells[i][j];
                    if (neighborCell) {
                        expect(neighborCell.state).toBe(CellState.Discovered);
                    }
                }
            }
        });
    });

    describe('game state', () => {
        it('should detect a win game', () => {
            // Arrange
            // Simule la partie
            for (let row = 0; row < grid.size; row++) {
                for (let column = 0; column < grid.size; column++) {
                    if (!grid.cells[row][column].hasMine) {
                        grid.performAction({
                            coordinates: { row, column },
                            type: ActionType.Discover
                        });
                    }
                }
            }

            // Assert
            expect(grid.isWin).toBe(true);
            expect(grid.isLoose).toBe(false);
            expect(grid.isEnd).toBe(true);
        });

        it('should detect a losing game', () => {
            // Arrange
            // Force une cellule à avoir une mine
            const row = 0;
            const column = 0;
            const cell = grid.cells[row][column];
            vi.spyOn(cell, 'hasMine', 'get').mockReturnValue(true);

            // Act
            grid.performAction({ coordinates: { row, column }, type: ActionType.Discover });

            // Assert
            expect(grid.isWin).toBe(false);
            expect(grid.isLoose).toBe(true);
            expect(grid.isEnd).toBe(true);
        });
    });

    describe('discoverMines', () => {
        it('should discover all mines', () => {
            // Act
            grid.discoverMines();

            // Assert
            grid.cells.forEach((row) => {
                row.forEach((cell) => {
                    if (cell.hasMine) {
                        expect(cell.state).toBe(CellState.Discovered);
                    }
                });
            });
        });
    });
});
