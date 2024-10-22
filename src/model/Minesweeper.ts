import { Coordinates } from '@/types/game';
import Grid, { ActionType, Difficulty } from './Grid';

/**
 * Classe représentant le jeu du démineur.
 * @class Minesweeper
 */
class Minesweeper {
    /**
     * La grille de jeu.
     * @private
     * @type {Grid}
     * @memberof Minesweeper
     */
    private _grid: Grid;

    /**
     * L'élément HTML représentant la grille de jeu.
     * @readonly
     * @private
     * @type {HTMLElement}
     * @memberof Minesweeper
     */
    private readonly _gameGrid: HTMLElement;

    /**
     * Le sélecteur de difficultée.
     * @private
     * @type {HTMLSelectElement}
     * @memberof Minesweeper
     */
    private readonly _difficultySelect: HTMLSelectElement;

    /**
     * Le bouton pour démarrer une nouvelle partie.
     * @private
     * @type {HTMLElement}
     * @memberof Minesweeper
     */
    private readonly _newGameBtn: HTMLElement;

    /**
     * Le conteneur de fin de partie.
     * @private
     * @type {HTMLElement}
     * @memberof Minesweeper
     */
    private readonly _gameOverContainer: HTMLElement;

    /**
     * Le message de fin de partie.
     * @private
     * @type {HTMLElement}
     * @memberof Minesweeper
     */
    private readonly _gameOverMessage: HTMLElement;

    /**
     * Le bouton pour recommencer une partie.
     * @private
     * @type {HTMLElement}
     * @memberof Minesweeper
     */
    private readonly _gameOverBtn: HTMLElement;

    /**
     * Crée une instance de {@link Minesweeper}.
     * @memberof Minesweeper
     */
    public constructor() {
        this._gameGrid = document.getElementById('game-grid')!;
        this._difficultySelect = document.getElementById('difficulty-select') as HTMLSelectElement;
        this._newGameBtn = document.getElementById('new-game')!;
        this._gameOverContainer = document.getElementById('game-over')!;
        this._gameOverMessage = document.getElementById('game-over-message')!;
        this._gameOverBtn = document.getElementById('game-over-btn')!;

        this._grid = new Grid(this.getCurrentDifficulty());

        // Bindings
        this.newGame = this.newGame.bind(this);

        // Inits
        this.initEventListeners();
        this._gameGrid.style.setProperty('--grid-size', this._grid.size.toString());
        this.render();
    }

    /**
     * Récupère la difficultée sélectionnée.
     * @private
     * @return {Difficulty} La difficultée sélectionnée.
     * @memberof Minesweeper
     */
    private getCurrentDifficulty(): Difficulty {
        if (
            this._difficultySelect.value !== Difficulty.Easy &&
            this._difficultySelect.value !== Difficulty.Medium &&
            this._difficultySelect.value !== Difficulty.Hard
        ) {
            throw new Error('Difficultée invalide');
        }

        return this._difficultySelect.value;
    }

    /**
     * Initialise les écouteurs d'événements.
     * @private
     * @memberof Minesweeper
     */
    private initEventListeners(): void {
        // Nouvelle partie
        this._newGameBtn.addEventListener('click', this.newGame);
        this._difficultySelect.addEventListener('change', this.newGame);
        this._gameOverBtn.addEventListener('click', this.newGame);

        // Cellules
        this._gameGrid.addEventListener('click', (e) => {
            const button = (e.target as HTMLElement).closest('button');
            if (!button) {
                return;
            }

            this.handleCellClick(Minesweeper.getCellCoordinatesFromClick(e), ActionType.Discover);
        });
        this._gameGrid.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const button = (e.target as HTMLElement).closest('button');
            if (!button) {
                return;
            }

            this.handleCellClick(Minesweeper.getCellCoordinatesFromClick(e), ActionType.Mark);
        });
    }

    /**
     * Démarre une nouvelle partie.
     * @private
     * @memberof Minesweeper
     */
    private newGame(): void {
        this._grid = new Grid(this.getCurrentDifficulty());
        document.getElementById('game-over')!.style.display = 'none';
        this.render();
        this._gameGrid.style.setProperty('--grid-size', this._grid.size.toString());
    }

    /**
     * Récupère les coordonnées d'une cellule à partir d'un clic de souris.
     * @private
     * @static
     * @param {MouseEvent} e - L'événement de clic.
     * @return {Coordinates} Les coordonnées de la cellule.
     * @memberof Minesweeper
     */
    private static getCellCoordinatesFromClick(e: MouseEvent): Coordinates {
        // Récupération de la cellule cliquée
        const button = (e.target as HTMLElement).closest('button');
        if (!button || !button.dataset.row || !button.dataset.column) {
            throw new Error("L'élément cliqué n'est pas une cellule");
        }

        // Récupération des coordonnées
        const row = parseInt(button.dataset.row);
        const column = parseInt(button.dataset.column);

        return { row, column };
    }

    /**
     * Gère le clic sur une cellule.
     * @private
     * @param {Coordinates} coordinates - Les coordonnées de la cellule.
     * @param {ActionType} type - Le type d'action.
     * @memberof Minesweeper
     */
    private handleCellClick(coordinates: Coordinates, type: ActionType): void {
        if (this._grid.isEnd) {
            return;
        }

        this._grid.action({ coordinates, type });
        this.render();

        if (this._grid.isEnd) {
            this.handleGameOver();
        }
    }

    /**
     * Affiche la grille de jeu.
     * @private
     * @memberof Minesweeper
     */
    private render(): void {
        this._gameGrid.innerHTML = this._grid.toHtml();
    }

    /**
     * Gère la fin de la partie.
     * @private
     * @memberof Minesweeper
     */
    private handleGameOver(): void {
        // Affichage du message de fin de partie
        if (this._grid.isLoose) {
            this._grid.discoverMines();
            this._gameOverMessage.textContent = 'Perdu !';
        } else {
            this._gameOverMessage.textContent = 'Gagné !';
        }
        this.render();
        this._gameOverContainer.style.display = 'block';
    }
}

export default Minesweeper;
