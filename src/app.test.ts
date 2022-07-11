import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { describe, it, expect, afterEach, test } from 'vitest';
import { clearMocks, mockIPC, mockWindows } from '@tauri-apps/api/mocks';
import App from './App.svelte';
import { PhysicalSize } from '@tauri-apps/api/window';

describe('Hello.svelte', () => {
    // TODO: @testing-library/svelte claims to add this automatically but it doesn't work without explicit afterEach
    afterEach(() => {
        cleanup();
        clearMocks();
    });

    it('mounts', () => {
        const { container } = render(App);
        expect(container).toBeTruthy();
        expect(container.innerHTML).toContain('powered by Vite');
    });

    test('window size and close', async () => {
        mockWindows('main', 'second', 'third');

        mockIPC((cmd, args) => {
            if (cmd === 'tauri') {
                if (args?.__tauriModule === 'Window' && args?.message?.cmd === 'manage' && args?.message?.data?.cmd?.type === 'close') {
                    console.log('closing window!');
                }
                if (args?.__tauriModule === 'Window' && args?.message?.cmd === 'manage' && args?.message?.data?.cmd?.type === 'innerSize') {
                    console.log('size requested!');
                    return new PhysicalSize(100, 200);
                }
            }
        });

        expect(window).toHaveProperty('__TAURI_METADATA__');

        const { getCurrent } = await import('@tauri-apps/api/window');

        const win = getCurrent();
        console.log(await win.innerSize());
        await win.close(); // this will cause the mocked IPC handler to log to the console.
    });
});
