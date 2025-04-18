import {
    DEFAULT_DELAY,
    DEFAULT_DIFFICULTY,
    DEFAULT_MODE,
    DEFAULT_NB_GAMES,
    MAX_DELAY,
    MIN_DELAY,
    MIN_NB_GAMES
} from '@/constants/defaults';
import { RESET_TEXT, START_TEXT } from '@/constants/literals';
import Difficulty from '@/enums/Difficulty';
import Mode from '@/enums/Mode';
import Step from '@/enums/Step';
import InstantMinesweeperBot from './InstantMinesweeperBot';
import MinesweeperBot from './MinesweeperBot';

/**
 * Classe représentant le jeu du démineur.
 * @export
 * @class Minesweeper
 */
export default class Minesweeper {
    /**
     * Le bot.
     * @private
     * @type {(MinesweeperBot | InstantMinesweeperBot)}
     * @memberof Minesweeper
     */
    private _bot: MinesweeperBot | InstantMinesweeperBot;

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
     * Sélecteur du mode.
     * @private
     * @type {HTMLSelectElement}
     * @memberof Minesweeper
     */
    private readonly _modeSelect: HTMLSelectElement;

    /**
     * Le bouton pour créer une nouvelle partie.
     * @private
     * @type {HTMLButtonElement}
     * @memberof Minesweeper
     */
    private readonly _mainBtn: HTMLButtonElement;

    /**
     * Le message de status de la partie.
     * @private
     * @type {HTMLElement}
     * @memberof Minesweeper
     */
    private readonly _statusMessage: HTMLElement;

    /**
     * L'étape du jeu.
     * @private
     * @type {Step}
     * @memberof Minesweeper
     */
    private _step: Step;

    /**
     * Crée une instance de {@link Minesweeper}.
     * @memberof Minesweeper
     */
    public constructor() {
        this._gameGrid = document.getElementById('game-grid')!;
        this._history = document.getElementById('history')!;
        this._mainBtn = document.getElementById('main-btn') as HTMLButtonElement;
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

        // Mode
        this._modeSelect = document.getElementById('mode-select') as HTMLSelectElement;
        this._modeSelect.value = DEFAULT_MODE;

        // Bot
        this._bot = new MinesweeperBot(
            this.getCurrentDifficulty(),
            parseInt(this._delayInput.value),
            this._showFullInput.checked,
            this._gameGrid,
            this._history
        );
        this._step = Step.Start;

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

    /**
     * Récupère le nombre de parties à lancer.
     * @private
     * @return {number} Le nombre de parties à lancer.
     * @memberof Minesweeper
     */
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
        this._difficultySelect.addEventListener('input', this.newGame.bind(this));
        this._delayInput.addEventListener('input', this.handleDelayChange.bind(this));
        this._showFullInput.addEventListener('change', this.handleShowFullChange.bind(this));
        this._modeSelect.addEventListener('change', this.handleModeChange.bind(this));
        this._mainBtn.addEventListener('click', this.handleMainBtnClick.bind(this));
    }

    /**
     * Gère une click sur le bouton principal.
     * @private
     * @memberof Minesweeper
     */
    private handleMainBtnClick(): void {
        switch (this._step) {
            case Step.Start:
                this._mainBtn.textContent = RESET_TEXT;
                this.startGame();
                break;

            case Step.Solved:
                this._mainBtn.textContent = START_TEXT;
                this.newGame();
                break;

            default:
                break;
        }
    }

    /**
     * Initialise un nouveau bot.
     * @private
     * @param {Difficulty} difficulty - La difficultée de la grille.
     * @memberof Minesweeper
     */
    private initNewBot(difficulty: Difficulty): void {
        // Si mode visuel
        if (this._modeSelect.value === Mode.Visual) {
            // Création d'un bot classique
            this._bot = new MinesweeperBot(
                difficulty,
                parseInt(this._delayInput.value),
                this._showFullInput.checked,
                this._gameGrid,
                this._history
            );
            // Affichage du bot
            this._bot.display();
        } else {
            // Sinon mode performance
            // Création d'un bot instantané
            this._bot = new InstantMinesweeperBot(difficulty);
            // Réinitialisation de la grille affichée
            this._gameGrid.innerHTML = '';
        }
        // Vidage de l'historique
        this._history.textContent = '';
    }

    /**
     * Démarre une nouvelle partie.
     * @private
     * @memberof Minesweeper
     */
    private newGame(): void {
        // Arrêt de la résolution en cours
        this._bot.stopSolving();
        this._step = Step.Start;
        // Initialisation du nouveau bot
        this.initNewBot(this.getCurrentDifficulty());
        this._gameGrid.style.setProperty('--grid-size', this._bot.grid.size.toString());
        // Vidage des champs
        this._statusMessage.textContent = '';
        this._history.textContent = '';
        // Activation des boutons/inputs/selects
        this._difficultySelect.disabled = false;
        this._nbGamesInput.disabled = false;
        this._showAllGames.disabled = false;
        this._modeSelect.disabled = false;
        this._mainBtn.disabled = false;
    }

    /**
     * Gère le changement de l'input pour le délais.
     * @private
     * @memberof Minesweeper
     */
    private handleDelayChange(): void {
        // Si on est en mode performance
        if (this._bot instanceof InstantMinesweeperBot) {
            return;
        }

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
     * Gère le changement de mode.
     * @private
     * @memberof Minesweeper
     */
    private handleModeChange(): void {
        // Vérification du mode
        switch (this._modeSelect.value) {
            case Mode.Visual:
            case Mode.Performance:
                break;

            default:
                this._modeSelect.value = DEFAULT_MODE;
                break;
        }
        const mode = this._modeSelect.value as Mode;

        // Nouvelle partie
        this.newGame();

        // Activation/désactivation des boutons/inputs
        if (mode === Mode.Visual) {
            this._delayInput.disabled = false;
            this._showFullInput.disabled = false;
            this._showAllGames.disabled = false;
        } else {
            this._delayInput.disabled = true;
            this._showFullInput.disabled = true;
            this._showAllGames.disabled = true;
        }
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
        if (this._bot instanceof MinesweeperBot) {
            this._bot.showFullSolving = this._showFullInput.checked;
        }
    }

    /**
     * Commence la partie
     * @private
     * @memberof Minesweeper
     */
    private async startGame(): Promise<void> {
        // Initialisation
        this._step = Step.Solving;
        const nbGames = this.getCurrentNbGames();
        const difficulty = this.getCurrentDifficulty();
        let nbWins = 0;
        let nbErrors = 0;
        let totalTime = 0;

        // Désactivation
        this._difficultySelect.disabled = true;
        this._nbGamesInput.disabled = true;
        this._showAllGames.disabled = true;
        this._modeSelect.disabled = true;
        this._mainBtn.disabled = true;

        // Affichage du message
        this.printStatusMessage(nbGames, nbWins, nbErrors, 0);

        // Résolution une par une
        if (this._showAllGames.checked || this._modeSelect.value === Mode.Performance) {
            // Résolution grille par grille
            for (let i = 1; i <= nbGames; i++) {
                try {
                    // Résolution de la grille
                    const solveTime = await this._bot.solve();

                    // Ajout du résultat
                    if (this._bot.grid.isWin) {
                        totalTime += solveTime;
                        nbWins++;
                    }
                } catch (e) {
                    console.error(e);
                    nbErrors++;
                }

                // Affichage du status
                this.printStatusMessage(nbGames, nbWins, nbErrors, i);

                // Création d'une nouvelle grille
                this.initNewBot(difficulty);
            }
        } else {
            // Résolution avec toutes les grilles en même temps
            // Lancement de la résolution principale (affichée)
            const mainPromise = this._bot.solve();

            // Créations des grilles en arrière plan
            const bots = Array.from(
                { length: nbGames - 1 },
                () => (this._bot = new MinesweeperBot(difficulty, 0, false))
            );
            bots.push(this._bot as MinesweeperBot);

            // Lancement des résolutions
            const solvePromises: Promise<number>[] = [];
            for (let i = 0; i < bots.length - 1; i++) {
                solvePromises.push(bots[i].solve());
            }
            solvePromises.push(mainPromise);

            // Parcours des promesses
            for (let i = 0; i < solvePromises.length; i++) {
                try {
                    // Attente de la résolution
                    const solveTime = await solvePromises[i];
                    // Ajout du résultat
                    const bot = bots[i];
                    if (bot.grid.isWin) {
                        totalTime += solveTime;
                        nbWins++;
                    }
                } catch (e) {
                    console.error(e);
                    nbErrors++;
                }
            }
        }

        // Affichage du message de fin
        this.printStatusMessage(nbGames, nbWins, nbErrors, nbGames, totalTime);
        this._mainBtn.disabled = false;
        this._step = Step.Solved;
    }

    /**
     * Affiche le message de statut de résolution.
     * @private
     * @param {number} nbGames - Le nombre de grilles à résoudre.
     * @param {number} nbWins - Le nombre de victoires.
     * @param {number} nbErrors - Le nombre d'erreurs.
     * @param {number} current - Le numéro de la grille courante.
     * @memberof Minesweeper
     */
    private printStatusMessage(
        nbGames: number,
        nbWins: number,
        nbErrors: number,
        current: number,
        totalTime?: number
    ) {
        const winPercentage = Math.round((nbWins * 100 / nbGames) * 100) / 100;
        this._statusMessage.textContent = `Résolus : ${current}/${nbGames}, victoires : ${nbWins} (${winPercentage}%), erreurs : ${nbErrors}`;

        // Affichage du temps si mode performance
        if (totalTime && this._modeSelect.value === Mode.Performance) {
            const meanTime = Math.round((totalTime / nbWins) * 100) / 100;
            this._statusMessage.textContent += `, temps total : ${totalTime}ms (${meanTime}ms par grille en moyenne)`;
        }
    }
}
