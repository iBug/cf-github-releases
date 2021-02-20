import { DOMAIN, REPOSITORY, DEFAULT_TAG, SITE_NAME } from "./config";
import { listFilesHTML, createHTMLResponse } from "./ui";

addEventListener("fetch", (event) => event.respondWith(fetchAndStream(event.request)));

async function fetchAndStream(request) {
  let url = new URL(request.url);
  if (typeof DOMAIN !== "undefined" && url.hostname !== DOMAIN) {
    // Pass through
    return fetch(request);
  }

  let newUrl, tag, filename;
  let pathParts = url.pathname.split("/");
  if (pathParts.length === 2) {
    if (pathParts[1] === "") {
      // Hmmm, front page?
      return createHTMLResponse(501, "Not Implemented");
    }
    // One slash
    tag = DEFAULT_TAG;
    filename = pathParts[1];
  } else if (pathParts.length === 3) {
    // Two slashes
    tag = pathParts[1];
    if (pathParts[2] === "") {
      //return createHTMLResponse(501, "Not Implemented");

      // Fetch GitHub API and list files
      let apiUrl = `https://api.github.com/repos/${REPOSITORY}/releases/tags/${tag}`;
      console.log(apiUrl);
      let response = await fetch(apiUrl, { headers: { "User-Agent": `Repository ${REPOSITORY}` } });
      if (response.status !== 200) {
        console.log(response.status);
        console.log(response.body.read());
        return createHTMLResponse(503, "Unavailable");
      }
      let data = await response.json();
      return new Response(listFilesHTML(data), { status: 200, headers: { "Content-Type": "text/html" } });
    }
    filename = pathParts[pathParts.length - 1];
  } else {
    return createHTMLResponse(400, "Bad Request");
  }
  newUrl = `https://github.com/${REPOSITORY}/releases/download/${tag}/${filename}`;
  let response = await fetch(newUrl, { method: request.method });
  if (response.status !== 200) {
    return createHTMLResponse(404, "Not Found");
  }
  let { readable, writable } = new TransformStream();
  response.body.pipeTo(writable);
  return new Response(readable, response);
}
