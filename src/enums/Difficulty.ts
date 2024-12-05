import { GridParam } from '@/types/game';

/**
 * Les difficultées du jeu.
 * @export
 * @enum {string}
 */
enum Difficulty {
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

export default Difficulty;

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
