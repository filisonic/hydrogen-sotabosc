import engineUrl from 'littlejsengine/dist/littlejs.min.js?url';
import gameUrl from '~/lib/city/room/room-game.js?url';

/**
 * The document inside the room iframe (`CityRoom.jsx`): LittleJS plus the room script, nothing else.
 *
 * A resource route rather than a page, so it gets no site chrome and its own narrow
 * content security policy. The engine sizes its canvas to the window and listens on
 * `document`, which is fine in here and would not be on the site itself.
 */
export function loader({ request }) {
  const origins = new Set(["'self'"]);
  for (const url of [engineUrl, gameUrl]) {
    const origin = new URL(url, request.url).origin;
    if (origin !== new URL(request.url).origin) origins.add(origin);
  }

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Sotabosc room</title>
<style>html,body{margin:0;height:100%;overflow:hidden;background:#1a140f}</style>
</head>
<body>
<script src="${engineUrl}"></script>
<script src="${gameUrl}"></script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Security-Policy': [
        "default-src 'none'",
        `script-src ${[...origins].join(' ')}`,
        "style-src 'unsafe-inline'",
        "img-src 'self' data: blob:",
        "frame-ancestors 'self'",
      ].join('; '),
      'Cache-Control': 'public, max-age=300',
    },
  });
}
