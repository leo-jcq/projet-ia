/**
 * Les actions possibles dans le jeu.
 * @export
 * @enum {string}
 */
enum ActionType {
    /**
     * Découvrir une case.
     */
    Discover = 'd',

    /**
     * Marquer une case.
     */
    Mark = 'm'
}

export default ActionType;

export const ActionTypeToString: Record<ActionType, string> = {
    [ActionType.Discover]: 'Découverte',
    [ActionType.Mark]: 'Marquage'
};
