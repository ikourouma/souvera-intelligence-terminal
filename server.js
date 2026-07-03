/**
 * Hostinger Node.js entry file — starts Next.js from the monorepo app package.
 * hPanel: Entry file = server.js | Package manager = npm
 */
const http = require('http');
const path = require('path');
const { parse } = require('url');
const next = require('next');

const port = parseInt(process.env.PORT || '3010', 10);
const hostname = '0.0.0.0';
const appDir = path.join(__dirname, 'apps', 'api-gateway');

const app = next({ dev: false, dir: appDir });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    http
      .createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
      })
      .listen(port, hostname, (err) => {
        if (err) throw err;
        console.log(`> Souvera ready on http://${hostname}:${port}`);
      });
  })
  .catch((err) => {
    console.error('Failed to start Next.js:', err);
    process.exit(1);
  });
