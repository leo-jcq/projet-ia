import CellState from '@/enums/CellState';
import Cell from '@/model/Cell';
import { describe, expect, it } from 'vitest';

describe('Cell', () => {
    describe('constructor', () => {
        it('should create an empty cell', () => {
            // Arrange
            const hasMine = false;
            const state = CellState.Covered;
            const nbMinesAround = 0;

            // Act
            const cell = new Cell(hasMine);

            // Assert
            expect(cell.hasMine).toBe(hasMine);
            expect(cell.state).toBe(state);
            expect(cell.nbMinesAround).toBe(nbMinesAround);
        });

        it('should create a mined cell', () => {
            // Arrange
            const hasMine = true;
            const state = CellState.Covered;
            const nbMinesAround = 0;

            // Act
            const cell = new Cell(hasMine);

            // Assert
            expect(cell.hasMine).toBe(hasMine);
            expect(cell.state).toBe(state);
            expect(cell.nbMinesAround).toBe(nbMinesAround);
        });
    });

    describe('discover', () => {
        it('should discover the cell', () => {
            // Arrange
            const expected = CellState.Discovered;
            const cell = new Cell(false);

            // Act
            cell.discover();

            // Assert
            expect(cell.state).toBe(expected);
        });
    });

    describe('invertMarked', () => {
        it('should mark a covered cell', () => {
            // Arrange
            const expected = CellState.Marked;
            const cell = new Cell(false);

            // Act
            cell.toggleMarked();

            // Assert
            expect(cell.state).toBe(expected);
        });

        it('should unmark a marked cell', () => {
            // Arrange
            const expected = CellState.Covered;
            const cell = new Cell(false);

            // Act
            cell.toggleMarked();
            cell.toggleMarked();

            // Assert
            expect(cell.state).toBe(expected);
        });

        it('should not modify a discovered cell', () => {
            // Arrange
            const expected = CellState.Discovered;
            const cell = new Cell(false);
            cell.discover();

            // Act
            cell.toggleMarked();

            // Assert
            expect(cell.state).toBe(expected);
        });
    });

    describe('toString', () => {
        it('should print a covered cell', () => {
            // Arrange
            const expected = '  ';
            const cell = new Cell(false);

            // Act
            const result = cell.toString();

            // Assert
            expect(result).toBe(expected);
        });

        it('should print a marked cell', () => {
            // Arrange
            const expected = '🚩';
            const cell = new Cell(false);
            cell.toggleMarked();

            // Act
            const result = cell.toString();

            // Assert
            expect(result).toBe(expected);
        });

        it('should print a discovered mine', () => {
            // Arrange
            const expected = '💣';
            const cell = new Cell(true);
            cell.discover();

            // Act
            const result = cell.toString();

            // Assert
            expect(result).toBe(expected);
        });

        it('should print the number of mines around', () => {
            // Arrange
            const nbMinesAround = 3;
            const expected = `${nbMinesAround} `;
            const cell = new Cell(false);
            cell.nbMinesAround = nbMinesAround;
            cell.discover();

            // Act
            const result = cell.toString();

            // Assert
            expect(result).toBe(expected);
        });
    });
});
