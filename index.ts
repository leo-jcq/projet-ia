import { createInterface } from 'readline';
import Grid, { ActionType, Difficulty } from './src/model/Grid';

// Création de l'interface pour lire les entrées utilisateur
const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

/**
 * Fonction pour poser une question à l'utilisateur.
 * @param {string} text - Prompt de la question.
 * @return {Promise<string>} La réponse de l'utilisateur.
 */
async function ask(text: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(text, (answer: string) => {
            resolve(answer);
        });
    });
}

/**
 * Fonction pour poser une question à l'utilisateur et vérifier la réponse.
 * @template T - Type de la réponse. 
 * @param {string} text - Prompt de la question.
 * @param {(value: string) => value is T} callback - Fonction de vérification de la réponse.
 * @return {Promise<T>} La réponse de l'utilisateur.
 */
async function askVerif<T extends string = string>(
    text: string,
    callback: (value: string) => value is T
): Promise<T> {
    // Initialisation des variables
    let value: string;
    let ok = false;

    while (!ok) {
        // Demande de la valeur
        value = await ask(text);
        // Vérification de la valeur
        ok = callback(value);
        if (!ok) {
            console.log('Valeur invalide !');
        }
    }

    return value! as T;
}

/**
 * Vérifie si une valeur est une difficulté.
 * @param {string} value - La valeur à vérifier.
 * @return {value is Difficulty} `true` si la valeur est une difficulté, sinon `false`.
 */
function isDifficulty(value: string): value is Difficulty {
    return value === Difficulty.Easy || value === Difficulty.Medium || value === Difficulty.Hard;
}

/**
 * Vérifie si une valeur est un nombre.
 * @param {string} value - La valeur à vérifier.
 * @return {value is `${number}`} `true` si la valeur est un nombre, sinon `false`.
 */
function isNumber(value: string): value is `${number}` {
    return value !== '' && !isNaN(Number(value));
}

/**
 * Vérifie si une valeur est un type d'action.
 * @param {string} value - La valeur à vérifier.
 * @return {value is ActionType} `true` si la valeur est un type d'action, sinon `false`.
 */
function isActionType(value: string): value is ActionType {
    return value === ActionType.Discover || value === ActionType.Mark;
}

/**
 * Fonction principale.
 */
async function main() {
    // Choix de la difficulté
    const difficulty = await askVerif<Difficulty>(
        `Entrez la difficulté : (${Difficulty.Easy} | ${Difficulty.Medium} | ${Difficulty.Hard}) : `,
        isDifficulty
    );

    // Initialisation de la grille
    const grid = new Grid(difficulty);
    let game = true;

    while (!grid.isEnd && game) {
        try {
            // Affichage de la grille
            console.clear();
            console.log(grid.toString());

            // Demande de la ligne, de la colonne et du type d'action
            const rowString = await askVerif(`Entrez la ligne [1, ${grid.size}] : `, isNumber);
            let row = Number(rowString);
            row--;

            const colString = await askVerif(`Entrez la colonne [1, ${grid.size}] : `, isNumber);
            let column = Number(colString);
            column--;

            const type = await askVerif<ActionType>(
                `Entrez l'action : (${ActionType.Discover} | ${ActionType.Mark}) : `,
                isActionType
            );

            // Exécution de l'action
            grid.action({ coordinates: { row, column }, type });
        } catch (error) {
            console.error(error);
            game = false;
            rl.close();
        }
    }

    // Message de fin de partie
    if (game) {
        console.log(grid.toString());
        if (grid.isWin) {
            console.log('Gagné !');
        } else {
            console.log('Perdu !');
        }
    }
    // Fermeture de l'interface
    rl.close();
}

console.clear();
main();