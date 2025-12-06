import swaggerUiDist from 'swagger-ui-dist';
import { join } from 'node:path';
import { promises as fs } from 'fs';
import { swaggerSpec } from '~~/server/utils/swagger';
import type { H3Event } from 'h3';

export default defineEventHandler(async (event: H3Event) => {
  const { req, res } = event.node;

  // Serve Swagger JSON if requested
  if (req.url?.endsWith('swagger.json')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return swaggerSpec;
  }

  // Serve Swagger UI HTML
  const swaggerDistPath = swaggerUiDist.getAbsoluteFSPath();
  const [css, bundle, preset] = await Promise.all([
    fs.readFile(join(swaggerDistPath, 'swagger-ui.css'), 'utf-8'),
    fs.readFile(join(swaggerDistPath, 'swagger-ui-bundle.js'), 'utf-8'),
    fs.readFile(join(swaggerDistPath, 'swagger-ui-standalone-preset.js'), 'utf-8'),
  ]);

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Swagger UI</title>
        <style>${css}</style>
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script>${bundle}</script>
        <script>${preset}</script>
        <script>
          window.onload = () => {
            SwaggerUIBundle({
              url: '/api/docs/swagger.json',
              dom_id: '#swagger-ui',
              presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
              layout: "BaseLayout"
            });
          };
        </script>
      </body>
    </html>
  `);
});
