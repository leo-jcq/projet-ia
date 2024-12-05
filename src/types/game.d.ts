import ActionType from '@/enums/ActionType';

/**
 * Représente des coordonnées dans une grille.
 * @export
 */
export type Coordinates = {
    /**
     * La ligne.
     * @type {number}
     */
    row: number;

    /**
     * La colonne.
     * @type {number}
     */
    column: number;
};

/**
 * Une action possible dans le jeu.
 * @export
 */
export type Action = {
    /**
     * Les coordonnées de la cellule sur laquelle l'action est effectuée.
     * @type {Coordinates}
     */
    coordinates: Coordinates;

    /**
     * Le type de l'action.
     * @type {ActionType}
     */
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
    readonly size: number;

    /**
     * Le nombre de mines dans la grille.
     */
    readonly nbMines: number;
};

/**
 * Les informations d'une cellule pour le bot.
 */
export type CellInfo = {
    /**
     * Le nombre de mines autour de la cellule (connu uniquement si la cellule est découverte).
     * @type {number}
     */
    nbMinesAround?: number;

    /**
     * Indique si la cellule contient une mine (détermineé par le bot).
     * @type {boolean}
     */
    hasMine?: boolean;

    /**
     * L'état de la cellule.
     * @type {CellState}
     */
    state: CellState;
};
