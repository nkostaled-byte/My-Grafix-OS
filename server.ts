import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

// Load environment variables (only VITE_* vars matter here — this server
// no longer talks to Supabase, R2, or Resend directly. All business logic
// lives in the Cloudflare Worker at VITE_WORKER_BASE_URL.)
dotenv.config();

const app = express();
const PORT = 3000;

// ==================================================
// DEV SERVER & STATIC SPA SERVING
// ==================================================
// This file's ONLY job is to serve the built frontend. Every API call the
// frontend makes goes directly to the Cloudflare Worker (VITE_WORKER_BASE_URL),
// never to this server. Do not add /api/* routes here — that recreates a
// second backend that will silently diverge from the real one.

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[Dev] Vite middleware loaded.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('[Prod] Static SPA file serving loaded.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
