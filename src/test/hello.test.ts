import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { describe, it, expect, afterEach, test, vi, beforeEach } from 'vitest';
import { clearMocks, mockIPC, mockWindows } from '@tauri-apps/api/mocks';
import Hello from '../components/Hello.svelte';
import { invoke } from '@tauri-apps/api';

describe('Hello.svelte', () => {
    beforeEach(() => {
        mockIPC((cmd, args) => {
            if (cmd === 'add') {
                return (args.a as number) + (args.b as number);
            } else if (cmd == 'test') {
                return 'invoke worked';
            }
        });
    });

    afterEach(() => {
        cleanup();
        clearMocks();
    });

    // I obviously have no idea how to do testing in Svelte, but this is nothing more than a PoC

    it('mounts', async () => {
        const spy = vi.spyOn(window, '__TAURI_IPC__');

        const { container } = render(Hello, { count: 4 });
        expect(container).toBeTruthy();

        await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));

        expect(container.innerHTML).toContain('4 x 2 = 8');

        await waitFor(() => expect(container.innerHTML).toContain('invoke worked'));

        expect(invoke('add', { a: 12, b: 15 })).resolves.toBe(27);
        expect(spy).toHaveBeenCalledTimes(2);
    });

    it('updates on button click', async () => {
        render(Hello, { count: 4 });
        const btn = screen.getByRole('button');
        const div = screen.getByText('4 x 2 = 8');
        await fireEvent.click(btn);
        expect(div.innerHTML).toBe('4 x 3 = 12');
        await fireEvent.click(btn);
        expect(div.innerHTML).toBe('4 x 4 = 16');
    });
});
