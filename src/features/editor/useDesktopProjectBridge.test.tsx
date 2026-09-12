// @vitest-environment jsdom
import React, { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import {
  EDITOR_PROJECT_BRIDGE_STORAGE_KEY,
  parseEditorProjectBridgeSnapshot,
  writeEditorProjectBridgeSnapshot,
} from './editorProjectBridge';
import type { DesktopProjectRecord, MobileBridgeProject } from './editorDesktopProjectAdapter';
import { useDesktopProjectBridge } from './useDesktopProjectBridge';

const desktopProject: DesktopProjectRecord = {
  schemaVersion: 'EditorProjectV2',
  meta: { durationSec: 30, aspectRatio: '16:9', projectName: 'Desktop' },
  tracks: [
    { id: 'v1', name: 'V1', kind: 'visual', visible: true },
  ],
  layers: [
    { id: 'layer-1', trackId: 'v1', type: 'text', visible: true },
  ],
  clips: [
    { id: 'clip-1', trackId: 'v1', layerId: 'layer-1', start: 0, end: 4 },
  ],
  transitions: [],
  seamLinks: [],
};

const mobileProject: MobileBridgeProject = {
  ...desktopProject,
  durationSec: 30,
  tracks: [
    {
      id: 'v1',
      name: 'V1',
      kind: 'video',
      desktopKind: 'visual',
      desktopVisible: true,
    },
  ],
  clips: [
    { id: 'clip-1', trackId: 'v1', layerId: 'layer-1', start: 2, end: 6 },
  ],
};

function Harness({ publishDelayMs = 0 }: { publishDelayMs?: number }) {
  const [project, setProject] = useState<DesktopProjectRecord>(desktopProject);
  useDesktopProjectBridge({ project, setProject, publishDelayMs });

  return (
    <div>
      <output data-testid="start">{String(project.clips[0]?.start ?? '')}</output>
      <output data-testid="schema">{String(project.schemaVersion ?? '')}</output>
      <button
        type="button"
        onClick={() => setProject((current) => ({
          ...current,
          clips: current.clips.map((clip) => clip.id === 'clip-1' ? { ...clip, start: 5, end: 9 } : clip),
        }))}
      >
        Move
      </button>
    </div>
  );
}

afterEach(() => {
  window.localStorage.clear();
  document.body.innerHTML = '';
});

describe('useDesktopProjectBridge', () => {
  it('restores a newer mobile snapshot into the canonical desktop project without dropping desktop-only fields', async () => {
    writeEditorProjectBridgeSnapshot('mobile', mobileProject, 100);
    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = createRoot(host);

    await act(async () => {
      root.render(<Harness publishDelayMs={50} />);
      await Promise.resolve();
    });

    expect(host.querySelector('[data-testid="start"]')?.textContent).toBe('2');
    expect(host.querySelector('[data-testid="schema"]')?.textContent).toBe('EditorProjectV2');

    act(() => root.unmount());
  });

  it('publishes desktop edits back through the versioned bridge', async () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = createRoot(host);

    await act(async () => {
      root.render(<Harness publishDelayMs={0} />);
      await new Promise((resolve) => window.setTimeout(resolve, 5));
    });

    const button = host.querySelector('button');
    expect(button).not.toBeNull();

    await act(async () => {
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await new Promise((resolve) => window.setTimeout(resolve, 5));
    });

    const snapshot = parseEditorProjectBridgeSnapshot(
      window.localStorage.getItem(EDITOR_PROJECT_BRIDGE_STORAGE_KEY),
    );
    expect(snapshot?.source).toBe('desktop');
    expect(snapshot?.project.clips[0]).toMatchObject({ start: 5, end: 9 });

    act(() => root.unmount());
  });
});
