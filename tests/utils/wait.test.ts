import wait from '@/utils/wait';
import { describe, expect, it } from 'vitest';

describe('wait', () => {
    // Définition d'une marge d'erreur pour les tests de délai
    const ERROR_MARGIN = 20;

    it('should return a promise with undefined', async () => {
        // Arrange
        const delay = 100;

        // Act
        const result = wait(delay);
        const awaitedResult = await result;

        // Assert
        expect(result).toBeInstanceOf(Promise);
        expect(awaitedResult).toBeUndefined();
    });

    it('should resolve after the specified delay', async () => {
        // Arrange
        const delay = 200;

        // Act
        const startTime = Date.now();
        await wait(delay);
        const elapsedTime = Date.now() - startTime;

        // Assert
        expect(elapsedTime).toBeGreaterThanOrEqual(delay);
        expect(elapsedTime).toBeLessThan(delay + ERROR_MARGIN);
    });

    it('should work with zero delay', async () => {
        // Arrange
        const delay = 0;

        // Act
        const startTime = Date.now();
        await wait(delay);
        const elapsedTime = Date.now() - startTime;

        // Assert
        expect(elapsedTime).toBeLessThan(ERROR_MARGIN);
    });
});
