import { DEFAULT_DELAY, DEFAULT_DIFFICULTY, MAX_DELAY, MIN_DELAY } from '@/constants/defaults';
import Difficulty from '@/enums/Difficulty';
import DijkstraBot from './DijkstraBot';


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
     * L'élément HTML contenant l'hitorique des actions
     * @readonly
     * @private
     * @type {HTMLElement}
     * @memberof Minesweeper
     */
    private readonly _history: HTMLElement;

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
     * Le message de fin de partie.
     * @private
     * @type {HTMLElement}
     * @memberof Minesweeper
     */
    private readonly _gameOverMessage: HTMLElement;

    /**
     * Indique si le jeu est en train d'être résolu.
     * @private
     * @type {boolean}
     * @memberof Minesweeper
     */
    private _isSolving: boolean;

    /**
     * Crée une instance de {@link Minesweeper}.
     * @memberof Minesweeper
     */
    public constructor() {
        this._gameGrid = document.getElementById('game-grid')!;
        this._history = document.getElementById('history')!;
        this._newGameBtn = document.getElementById('new-game')!;
        this._startGameBtn = document.getElementById('start-game')!;
        this._gameOverMessage = document.getElementById('game-over-message')!;

        // Difficultée
        this._difficultySelect = document.getElementById('difficulty-select') as HTMLSelectElement;
        this._difficultySelect.value = DEFAULT_DIFFICULTY;

        // Délais
        this._delayInput = document.getElementById('delay-input') as HTMLInputElement;
        this._delayInput.value = DEFAULT_DELAY.toString();
        this._delayInput.min = MIN_DELAY.toString();
        this._delayInput.max = MAX_DELAY.toString();
        this._delayLabel = document.getElementById('delay-input-label')!;
        this.handleDelayChange();

        this._bot = new DijkstraBot(this.getCurrentDifficulty(), this._gameGrid, this._history);

        this._isSolving = false;

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
    }

    /**
     * Démarre une nouvelle partie.
     * @private
     * @memberof Minesweeper
     */
    private newGame(): void {
        this._bot.stopSolving();
        this._bot = new DijkstraBot(this.getCurrentDifficulty(), this._gameGrid, this._history);
        this._gameGrid.style.setProperty('--grid-size', this._bot.grid.size.toString());
        this._gameOverMessage.style.display = 'none';
        this._history.textContent = '';
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
        this._gameOverMessage.style.display = 'none';
        if (!this._isSolving) {
            // Résolution
            this._isSolving = true;
            await this._bot.solve(this.getCurrentDelay());
            this._isSolving = false;

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
            this._gameOverMessage.style.display = 'block';

            this._bot.display();
        }
    }
}
