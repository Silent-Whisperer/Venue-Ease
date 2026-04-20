import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import {join} from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();

/**
 * Configure trusted hostnames for Angular SSR to prevent 'Bad Request' errors 
 * during local development (SSRF protection bypass).
 */
process.env['ALLOWED_HOSTS'] = 'localhost,127.0.0.1,127.0.0.1.nip.io,::1,::ffff:127.0.0.1';

// Prevent process from exiting on unhandled rejections or non-critical errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Unhandled Rejection] at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception] caught:', err);
  if (err.message?.includes('EADDRINUSE')) process.exit(1);
});

const angularApp = new AngularNodeAppEngine();

/**
 * Server-side proxy to handle external API requests and bypass CORS.
 */
app.get('/api/sports-proxy', async (req, res): Promise<void | express.Response> => {
  const targetUrl = req.query['url'] as string;
  
  if (!targetUrl) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    // Basic validation to ensure it's calling allowed sports APIs
    if (!targetUrl.startsWith('https://serpapi.com') && !targetUrl.startsWith('https://www.thesportsdb.com')) {
      return res.status(403).json({ error: 'Forbidden API target' });
    }

    const response = await fetch(targetUrl);
    
    if (!response.ok) {
      return res.status(response.status).json({ error: `Downstream API error: ${response.statusText}` });
    }

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error('[Server Proxy Error]:', error);
    return res.status(500).json({ error: 'Internal proxy failure' });
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
