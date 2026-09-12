// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EDITOR_FRONTEND_STORAGE_KEY } from '../features/editor/editorFrontendMode';

vi.mock('../features/editor/VT_E1.jsx', () => ({
  default: () => <div data-testid="canonical-vt-e1">VT_E1</div>,
}));

vi.mock('../features/editor/mobile', () => ({
  useEditorState: () => ({
    state: {
      project: {
        tracks: [],
        clips: [],
        transitions: [],
        durationSec: 30,
      },
    },
    dispatch: vi.fn(),
  }),
  ResponsiveEditorShell: ({ mode, desktop }: { mode: string; desktop: React.ReactNode }) => (
    <div data-testid="responsive-shell" data-shell-mode={mode}>
      {desktop}
    </div>
  ),
}));

import EditorV1Page from './EditorV1Page';

let host: HTMLDivElement;
let root: Root;

function click(element: Element | null) {
  expect(element).not.toBeNull();
  act(() => {
    element?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

function buttonWithText(text: string): HTMLButtonElement | null {
  return Array.from(host.querySelectorAll('button')).find((button) =>
    button.textContent?.includes(text),
  ) ?? null;
}

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState({}, '', '/editor');
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  document.body.innerHTML = '';
  window.localStorage.clear();
  window.history.replaceState({}, '', '/');
});

describe('EditorV1Page dual frontend menu', () => {
  it('switches Current Main to Linked Branch, forces the classic desktop host, and persists the preference', async () => {
    await act(async () => {
      root.render(<EditorV1Page />);
      await Promise.resolve();
    });

    const page = host.querySelector('[data-editor-frontend]');
    expect(page?.getAttribute('data-editor-frontend')).toBe('current-main');
    expect(host.querySelector('[data-shell-mode]')?.getAttribute('data-shell-mode')).toBe('auto');
    expect(buttonWithText('Editor UI')).not.toBeNull();

    click(buttonWithText('Editor UI'));
    const linkedOption = buttonWithText('Linked Branch');
    expect(linkedOption?.getAttribute('aria-checked')).toBe('false');

    click(linkedOption);

    expect(page?.getAttribute('data-editor-frontend')).toBe('linked-classic');
    expect(host.querySelector('[data-shell-mode]')?.getAttribute('data-shell-mode')).toBe('desktop');
    expect(window.localStorage.getItem(EDITOR_FRONTEND_STORAGE_KEY)).toBe('linked-classic');
    expect(buttonWithText('Editor UI')?.textContent).toContain('LINKED');
  });

  it('restores the saved Linked Branch preference and keeps the switcher available in that frontend', async () => {
    window.localStorage.setItem(EDITOR_FRONTEND_STORAGE_KEY, 'linked-classic');

    await act(async () => {
      root.render(<EditorV1Page />);
      await Promise.resolve();
    });

    expect(host.querySelector('[data-editor-frontend]')?.getAttribute('data-editor-frontend')).toBe('linked-classic');
    expect(host.querySelector('[data-shell-mode]')?.getAttribute('data-shell-mode')).toBe('desktop');

    const switcher = buttonWithText('Editor UI');
    expect(switcher).not.toBeNull();
    expect(switcher?.textContent).toContain('LINKED');

    click(switcher);
    const currentOption = buttonWithText('Current Main');
    expect(currentOption).not.toBeNull();
    expect(currentOption?.getAttribute('aria-checked')).toBe('false');
  });

  it('honors the direct QA query override without deleting the stored preference', async () => {
    window.localStorage.setItem(EDITOR_FRONTEND_STORAGE_KEY, 'linked-classic');
    window.history.replaceState({}, '', '/editor?editorStyle=current');

    await act(async () => {
      root.render(<EditorV1Page />);
      await Promise.resolve();
    });

    expect(host.querySelector('[data-editor-frontend]')?.getAttribute('data-editor-frontend')).toBe('current-main');
    expect(window.localStorage.getItem(EDITOR_FRONTEND_STORAGE_KEY)).toBe('linked-classic');
    expect(buttonWithText('Editor UI')?.textContent).toContain('CURRENT');
  });
});
