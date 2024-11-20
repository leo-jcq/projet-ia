import CellState from '@/enums/CellState';
import { BaseCellInfo, Coordinates } from '@/types/game';

/**
 * Récupère la clé d'une cellule.
 * @export
 * @param {Coordinates} coordinates - Les coordonnées de la cellule.
 * @return {string} La clé de la cellule
 */
export function getCellKey(coordinates: Coordinates): string {
    return `${coordinates.row},${coordinates.column}`;
}
 
/**
 * Récupère les cellules découvertes d'une liste de cellules.
 * @export
 * @param {BaseCellInfo[]} cells - La liste de cellules.
 * @return {BaseCellInfo[]} Les cellules découvertes.
 */
export function getCoveredCells(cells: BaseCellInfo[]): BaseCellInfo[] {
    return cells.filter((n) => n.cell.state === CellState.Covered);
}

/**
 * Récupère les cellules marquées d'une liste de cellules.
 * @export
 * @param {BaseCellInfo[]} cells - La liste de cellules.
 * @return {BaseCellInfo[]} Les cellules marquées.
 */
export function getMarkedCells(cells: BaseCellInfo[]): BaseCellInfo[] {
    return cells.filter((n) => n.cell.state === CellState.Marked);
}
