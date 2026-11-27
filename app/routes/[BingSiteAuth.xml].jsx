// Bing Webmaster Tools ownership file. Served as a route because public/ non-image files 404 on Oxygen.
const BODY = `<?xml version="1.0"?>
<users>
	<user>4EA2BE4A971D4781C023A7F24F13C436</user>
</users>
`;

export function loader() {
  return new Response(BODY, {
    headers: {'Content-Type': 'application/xml', 'Cache-Control': 'max-age=86400'},
  });
}
