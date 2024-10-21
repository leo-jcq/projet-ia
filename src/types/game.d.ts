import { ActionType } from "@/model/Grid";

/**
 * Représente des coordonnées dans une grille.
 * @export
 */
export type Coordinates = {
    row: number;
    column: number;
}

export type Action = {
    coordinates: Coordinates;
    type: ActionType;
}
