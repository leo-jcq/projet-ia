import {
    DEFAULT_DELAY,
    DEFAULT_DIFFICULTY,
    DEFAULT_NB_GAMES,
    MAX_DELAY,
    MIN_DELAY,
    MIN_NB_GAMES
} from '@/constants/defaults';
import Difficulty from '@/enums/Difficulty';
import MinesweeperBot from './MinesweeperBot';

/**
 * Classe représentant le jeu du démineur.
 * @export
 * @class Minesweeper
 */
export default class Minesweeper {
    /**
     * La grille de jeu.
     * @private
     * @type {MinesweeperBot}
     * @memberof Minesweeper
     */
    private _bot: MinesweeperBot;

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

    /**
     * L'input pour le délais
     * @private
     * @type {HTMLInputElement}
     * @memberof Minesweeper
     */
    private readonly _delayInput: HTMLInputElement;

    /**
     * Le label pour le délais
     * @private
     * @type {HTMLElement}
     * @memberof Minesweeper
     */
    private readonly _delayLabel: HTMLElement;

    /**
     * L'input pour montrer toute la résolution.
     * @private
     * @type {HTMLInputElement}
     * @memberof Minesweeper
     */
    private readonly _showFullInput: HTMLInputElement;

    /**
     * L'input pour le nombre d'itérations
     * @private
     * @type {HTMLInputElement}
     * @memberof Minesweeper
     */
    private readonly _nbGamesInput: HTMLInputElement;

    /**
     * L'input pour montrer toutes les parties.
     * @private
     * @type {HTMLInputElement}
     * @memberof Minesweeper
     */
    private readonly _showAllGames: HTMLInputElement;

    /**
     * Le bouton pour créer une nouvelle partie.
     * @private
     * @type {HTMLElement}
     * @memberof Minesweeper
     */
    private readonly _resetBtn: HTMLElement;

    /**
     * Le bouton pour démarrer une nouvelle partie.
     * @private
     * @type {HTMLElement}
     * @memberof Minesweeper
     */
    private readonly _startGameBtn: HTMLElement;

    /**
     * Le message de status de la partie.
     * @private
     * @type {HTMLElement}
     * @memberof Minesweeper
     */
    private readonly _statusMessage: HTMLElement;

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
        this._resetBtn = document.getElementById('reset')!;
        this._startGameBtn = document.getElementById('start-game')!;
        this._statusMessage = document.getElementById('status-message')!;

        // Difficulté
        this._difficultySelect = document.getElementById('difficulty-select') as HTMLSelectElement;
        this._difficultySelect.value = DEFAULT_DIFFICULTY;

        // Délais
        this._delayInput = document.getElementById('delay-input') as HTMLInputElement;
        this._delayInput.value = DEFAULT_DELAY.toString();
        this._delayInput.min = MIN_DELAY.toString();
        this._delayInput.max = MAX_DELAY.toString();
        this._delayLabel = document.getElementById('delay-input-label')!;
        this.displayDelay();

        // Montrer tout
        this._showFullInput = document.getElementById('show-full-input') as HTMLInputElement;

        // Nombre de parties
        this._nbGamesInput = document.getElementById('nb-games-input') as HTMLInputElement;
        this._nbGamesInput.value = DEFAULT_NB_GAMES.toString();
        this._nbGamesInput.min = MIN_NB_GAMES.toString();

        // Montrer toutes les parties
        this._showAllGames = document.getElementById('show-all-games-input') as HTMLInputElement;

        // Bot
        this._bot = new MinesweeperBot(
            this.getCurrentDifficulty(),
            parseInt(this._delayInput.value),
            this._showFullInput.checked,
            this._gameGrid,
            this._history
        );
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

    private getCurrentNbGames(): number {
        let nbGames = parseInt(this._nbGamesInput.value);

        if (isNaN(nbGames) || nbGames < MIN_NB_GAMES) {
            nbGames = DEFAULT_NB_GAMES;
            this._nbGamesInput.value = DEFAULT_NB_GAMES.toString();
        }

        return nbGames;
    }

    /**
     * Initialise les écouteurs d'événements.
     * @private
     * @memberof Minesweeper
     */
    private initEventListeners(): void {
        this._difficultySelect.addEventListener('change', this.newGame.bind(this));
        this._delayInput.addEventListener('input', this.handleDelayChange.bind(this));
        this._showFullInput.addEventListener('change', this.handleShowFullChange.bind(this));
        this._resetBtn.addEventListener('click', this.newGame.bind(this));
        this._startGameBtn.addEventListener('click', this.startGame.bind(this));
    }

    /**
     * Démarre une nouvelle partie.
     * @private
     * @memberof Minesweeper
     */
    private newGame(): void {
        this._bot.stopSolving();
        this._bot = new MinesweeperBot(
            this.getCurrentDifficulty(),
            parseInt(this._delayInput.value),
            this._showFullInput.checked,
            this._gameGrid,
            this._history
        );
        this._gameGrid.style.setProperty('--grid-size', this._bot.grid.size.toString());
        this._statusMessage.style.display = 'none';
        this._history.textContent = '';
        this._bot.display();
    }

    /**
     * Gère le changement de l'input pour le délais.
     * @private
     * @memberof Minesweeper
     */
    private handleDelayChange(): void {
        // Récupération du délais
        let delay = parseInt(this._delayInput.value);

        // Vérification de la valeur
        if (isNaN(delay) || delay < MIN_DELAY || delay > MAX_DELAY) {
            delay = DEFAULT_DELAY;
            this._delayInput.value = delay.toString();
        }

        this.displayDelay();
        this._bot.delay = delay;
    }

    /**
     * Affiche le délais actuel.
     * @private
     * @memberof Minesweeper
     */
    private displayDelay(): void {
        this._delayLabel.textContent = `Délais : ${this._delayInput.value}ms`;
    }

    /**
     * Gère le changement de l'input pour montrer toute la résolution.
     * @private
     * @memberof Minesweeper
     */
    private handleShowFullChange(): void {
        this._bot.showFullSolving = this._showFullInput.checked;
    }

    /**
     * Commence la partie
     * @private
     * @memberof Minesweeper
     */
    private async startGame(): Promise<void> {
        if (this._isSolving) {
            return;
        }

        // Initialisation
        this._statusMessage.style.display = 'none';
        const nbGames = this.getCurrentNbGames();
        const difficulty = this.getCurrentDifficulty();
        let nbWins = 0;
        let nbErrors = 0;
        this.printStatusMessage(nbGames, nbWins, nbErrors, 0);

        this._isSolving = true;
        console.log(this._showAllGames.checked)
        if (this._showAllGames.checked) {
            for (let i = 1; i <= nbGames; i++) {
                // Résolution de la grille
                this._bot.display();
                this._history.textContent = '';
                await this._bot.solve();

                // Ajout du résultat
                if (this._bot.grid.isEnd) {
                    if (this._bot.grid.isWin) {
                        nbWins++;
                    }
                } else {
                    nbErrors++;
                }

                // Affichage du status
                this.printStatusMessage(nbGames, nbWins, nbErrors, i);

                // Création d'une nouvelle grille
                this._bot = new MinesweeperBot(
                    difficulty,
                    parseInt(this._delayInput.value),
                    this._showFullInput.checked,
                    this._gameGrid,
                    this._history
                );
            }
        } else {
            // Lancement de la résolution principale (affichée)
            const mainPromise = this._bot.solve();

            // Créations des grilles en arrière plan
            const bots = Array.from(
                { length: nbGames - 1 },
                () => (this._bot = new MinesweeperBot(difficulty, 0, false))
            );
            const solvePromises: Promise<void>[] = [];

            // Lancement des résolutions
            for (let i = 0; i < bots.length; i++) {
                solvePromises.push(bots[i].solve());
            }

            // Attente des résolutions
            for (let i = 0; i < solvePromises.length; i++) {
                // Attente de la résolution
                await solvePromises[i];
                // Ajout du résultat
                const bot = bots[i];
                if (bot.grid.isEnd) {
                    if (bot.grid.isWin) {
                        nbWins++;
                    }
                } else {
                    nbErrors++;
                }
            }

            // Résolution de la grille principale
            await mainPromise;

            // Ajout du résultat
            if (this._bot.grid.isEnd) {
                if (this._bot.grid.isWin) {
                    nbWins++;
                }
            } else {
                nbErrors++;
            }
        }
        this._isSolving = false;

        this.printStatusMessage(nbGames, nbWins, nbErrors, nbGames);
    }

    private printStatusMessage(nbGames: number, nbWins: number, nbErrors: number, current: number) {
        this._statusMessage.style.display = 'block';
        this._statusMessage.textContent = `Résolus : ${current}/${nbGames}, victoires : ${nbWins}, erreurs : ${nbErrors}`;
    }
}
