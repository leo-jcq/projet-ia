import Difficulty from '@/enums/Difficulty';
import DijkstraBot from './DijkstraBot';

const DEFAULT_DIFFICULTY = Difficulty.Easy;
const DEFAULT_DELAY = 500;
const MIN_DELAY = 0;
const MAX_DELAY = 2000;

/**
 * Classe représentant le jeu du démineur.
 * @export
 * @class Minesweeper
 */
export default class Minesweeper {
    /**
     * La grille de jeu.
     * @private
     * @type {DijkstraBot}
     * @memberof Minesweeper
     */
    private _bot: DijkstraBot;

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

    private readonly _delayInput: HTMLInputElement;

    private readonly _delayLabel: HTMLElement;

    /**
     * Le bouton pour créer une nouvelle partie.
     * @private
     * @type {HTMLElement}
     * @memberof Minesweeper
     */
    private readonly _newGameBtn: HTMLElement;

    /**
     * Le bouton pour démarrer une nouvelle partie.
     * @private
     * @type {HTMLElement}
     * @memberof Minesweeper
     */
    private readonly _startGameBtn: HTMLElement;

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

    private _isSolving: boolean;

    /**
     * Crée une instance de {@link Minesweeper}.
     * @memberof Minesweeper
     */
    public constructor() {
        this._gameGrid = document.getElementById('game-grid')!;
        this._difficultySelect = document.getElementById('difficulty-select') as HTMLSelectElement;
        this._difficultySelect.value = DEFAULT_DIFFICULTY;

        this._delayInput = document.getElementById('delay-input') as HTMLInputElement;
        this._delayInput.value = DEFAULT_DELAY.toString();
        this._delayInput.min = MIN_DELAY.toString();
        this._delayInput.max = MAX_DELAY.toString();
        this._delayLabel = document.getElementById('delay-input-label')!;
        this.handleDelayChange();

        this._newGameBtn = document.getElementById('new-game')!;
        this._startGameBtn = document.getElementById('start-game')!;
        this._gameOverContainer = document.getElementById('game-over')!;
        this._gameOverMessage = document.getElementById('game-over-message')!;
        this._gameOverBtn = document.getElementById('game-over-btn')!;

        this._bot = new DijkstraBot(this.getCurrentDifficulty(), this._gameGrid);

        this._isSolving = false;

        // Bindings
        this.startGame = this.startGame.bind(this);

        // Inits
        this.initEventListeners();
        this._gameGrid.style.setProperty('--grid-size', this._bot.grid.size.toString());
        this._bot.display();
    }

    /**
     * Récupère la difficultée sélectionnée.
     * @private
     * @return {Difficulty} La difficultée sélectionnée.
     * @memberof Minesweeper
     */
    private getCurrentDifficulty(): Difficulty {
        switch (this._difficultySelect.value) {
            case Difficulty.Easy:
            case Difficulty.Medium:
            case Difficulty.Hard:
                break;

            default:
                this._difficultySelect.value = DEFAULT_DIFFICULTY;
                break;
        }

        return this._difficultySelect.value as Difficulty;
    }

    private getCurrentDelay(): number {
        // Récupération du délais
        let delay = parseInt(this._delayInput.value);

        // Vérification de la valeur
        if (isNaN(delay) || delay < MIN_DELAY || delay > MAX_DELAY) {
            delay = DEFAULT_DELAY;
            this._delayInput.value = delay.toString();
        }

        this._delayLabel.textContent = `Délais : ${delay}ms`;
        return delay;
    }

    /**
     * Initialise les écouteurs d'événements.
     * @private
     * @memberof Minesweeper
     */
    private initEventListeners(): void {
        // Nouvelle partie
        this._newGameBtn.addEventListener('click', this.newGame.bind(this));
        this._difficultySelect.addEventListener('change', this.newGame.bind(this));
        this._delayInput.addEventListener('input', this.handleDelayChange.bind(this));
        this._startGameBtn.addEventListener('click', this.startGame.bind(this));
        this._gameOverBtn.addEventListener('click', this.newGame.bind(this));
    }

    /**
     * Démarre une nouvelle partie.
     * @private
     * @memberof Minesweeper
     */
    private newGame(): void {
        this._bot = new DijkstraBot(this.getCurrentDifficulty(), this._gameGrid);
        document.getElementById('game-over')!.style.display = 'none';
        this._gameGrid.style.setProperty('--grid-size', this._bot.grid.size.toString());
        this._bot.display();
    }

    private handleDelayChange(): void {
        this._delayInput.innerHTML = `Délais : ${this.getCurrentDelay()}ms`;
    }

    /**
     * Commence la partie
     * @private
     * @memberof Minesweeper
     */
    private async startGame(): Promise<void> {
        if (!this._isSolving) {
            // Résolution
            this._isSolving = true;
            await this._bot.solve(this.getCurrentDelay());
            this._isSolving = false;

            this._bot.grid.discoverMines();

            // Affichage du message de fin
            if (this._bot.grid.isEnd) {
                if (this._bot.grid.isWin) {
                    this._gameOverMessage.textContent = 'Gagné';
                } else {
                    this._gameOverMessage.textContent = 'Perdu';
                }
            } else {
                this._gameOverMessage.textContent = 'Impossible de résoudre complètement la grille';
            }
            this._gameOverContainer.style.display = 'block';

            this._bot.display();
        }
    }
}
