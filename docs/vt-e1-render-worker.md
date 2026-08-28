# VT_E1 Render Worker

The editor always calls same-origin endpoints such as `/api/vt-e1/render`.
The web deployment proxies those requests to a dedicated worker running
`src/server/vt-e1-render-server.mjs`. Do not point browser code at a worker
URL or `localhost:3001`.

## Deploy

1. Deploy `docker/vt-e1-render-worker.Dockerfile` on a host that supports a
   long-running Node process, Chromium, FFmpeg, and a persistent volume.
2. Mount a durable volume at `/var/lib/vt-e1-render`.
3. Configure the worker values in `render-worker.env.example`.
4. Configure the same `VT_E1_RENDER_SHARED_SECRET` and the worker URL in the
   ViewTube web deployment. Do not expose the shared secret to the browser.
5. Verify the worker directly with `/api/vt-e1/render/health` and
   `/api/vt-e1/render/capabilities`, then verify the proxied endpoints through
   `https://viewtube.live/api/vt-e1/render/capabilities`.

## Export Contract

- **Final MP4** is the canonical output: Remotion renders `VTE1Renderer`.
- **MOV** and **WebM** are worker-side FFmpeg transcodes of the canonical MP4.
- **Preview Capture** is browser-only and is never parity-final output.
- **SVG frames** are an explicit utility lane. They do not replace the
  canonical Remotion project renderer.

The worker resumes jobs left in `rendering` after a restart by returning them
to the queue. It uses `PORT` so common hosted platforms can assign the port.
