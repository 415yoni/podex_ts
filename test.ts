//import { describe, it, expect } from 'vitest';
import { Cache} from './pokecache';
import{PokeAPI} from './state'

//import { vi } from 'vitest';

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('PokeAPI Caching', () => {
    beforeEach(() => {
        // Mock fetch before each test
        global.fetch = vi.fn();
    });

    afterEach(() => {
        // Clean up after each test
        vi.restoreAllMocks();
    });

    it('should cache fetch results', async () => {
        // Setup the mock to return what you want
        (global.fetch as any).mockResolvedValue({
            json: () => Promise.resolve({ mockData: true })
        });

        const api = new PokeAPI(60000);
        
        // Your test logic stays the same
        await api.fetchLocation('test');
        expect(global.fetch).toHaveBeenCalledTimes(1);
        
        await api.fetchLocation('test');
        expect(global.fetch).toHaveBeenCalledTimes(1);
    });
});