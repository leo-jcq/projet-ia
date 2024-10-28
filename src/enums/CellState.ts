/**
 * Représente les états d'une case.
 * @export
 * @enum {string}
 */
enum CellState {
    /**
     * La case est couverte.
     */
    Covered = 'covered',

    /**
     * La case est marquée comme ayant une mine.
     */
    Marked = 'marked',

    /**
     * La case est découverte.
     */
    Discovered = 'discovered'
}

export default CellState;
