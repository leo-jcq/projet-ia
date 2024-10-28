import { ActionType } from '@/model/Grid';

/**
 * Représente des coordonnées dans une grille.
 * @export
 */
export type Coordinates = {
    row: number;
    column: number;
};

export type Action = {
    coordinates: Coordinates;
    type: ActionType;
};

/**
 * Les paramètres d'une grille.
 * @export
 */
export type GridParam = {
    /**
     * La taille de la grille.
     */
    size: number;

    /**
     * Le nombre de mines dans la grille.
     */
    nbMines: number;
};

type BaseCellInfo = {
    row: number;
    column: number;
    cell: Cell;
};

export type CellInfo = BaseCellInfo & {
    neighbors: BaseCellInfo[];
};
