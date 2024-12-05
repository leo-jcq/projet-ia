/**
 * Attends un certain délai.
 * @export
 * @param {number} delay - Le délai à attendre (ms).
 * @return {Promise<undefined>} Une promesse qui se résout après le délai.
 */
export default function wait(delay: number): Promise<undefined> {
    return new Promise((resolve) => setTimeout(resolve, delay));
}
