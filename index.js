const DOMAIN = undefined; // Your domain, e.g. my.example.com
const REPOSITORY = "octocat/hello-world";
const DEFAULT_TAG = "default";
const SITE_NAME = "My Worker Download Center";
const HEAD = `<style>html,body{font-family:-apple-system,BlinkMacSystemFont,roboto,segoe ui,helvetica neue,lucida grande,microsoft yahei,Arial,sans-serif;}
pre,code{font-family:Roboyo Mono,Consolas,monospace;}</style>
<!-- Place any <head> elements here -->`;

addEventListener("fetch", event => {
  return event.respondWith(fetchAndStream(event.request));
})

// Credits: https://stackoverflow.com/a/14919494/5958455
function humanFileSize(bytes, si=false, dp=1) {
  const thresh = si ? 1000 : 1024;
  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }
  const units = si 
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] 
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10**dp;
  do {
    bytes /= thresh;
    u++;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);
  return bytes.toFixed(dp) + ' ' + units[u];
}

function makeFileListHTML(data) {
  let s = "", tag = data["tag_name"];
  for (let item of data["assets"]) {
    let name = item["name"];
    let size = item["size"];
    let sizeHuman = humanFileSize(size);
    let sizeActual = size.toLocaleString() + (size === 1 ? " byte" : " bytes");
    let updated = item["updated_at"];
    s += `<tr><td><a href="/${tag}/${name}">${name}</a></td><td><span title="${sizeActual}">${sizeHuman}</span></td><td>${updated}</td></tr>`;
  }
  let html = `<!DOCTYPE html>
<html>
<head><title>${tag} - ${SITE_NAME}</title>${HEAD}</head>
<body>
<h1>Files in <code>${tag}</code></h1>
<table>
<thead><tr><th>File</th><th>Size</th><th>Updated</th></tr></thead>
<tbody>${s}</tbody>
</table>
</body>
</html>`;
  return html;
}

function createHTMLResponse(code, text) {
  text = `${code} ${text}`;
  return new Response(`<!DOCTYPE html>
<html>
<head>
<title>${text} - ${SITE_NAME}</title>
${HEAD}
</head>
<body>
<center><h1>${text}</h1></center>
<hr>
<center>${SITE_NAME}</center>
</body>
</html>
`, {status: code, headers: {"Content-Type": "text/html"}});
}

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
    tag = "DEFAULT_TAG";
    filename = pathParts[1];
  } else if (pathParts.length === 3) {
    // Two slashes
    tag = pathParts[1];
    if (pathParts[2] === "") {
      //return createHTMLResponse(501, "Not Implemented");
      
      // Fetch GitHub API and list files
      let apiUrl = `https://api.github.com/repos/${REPOSITORY}/releases/tags/${tag}`;
      console.log(apiUrl);
      let response = await fetch(apiUrl, {headers: {"User-Agent": `Repository ${REPOSITORY}`}});
      if (response.status !== 200) {
        console.log(response.status);
        console.log(response.body.read());
        return createHTMLResponse(503, "Unavailable");
      }
      let data = await response.json();
      return new Response(makeFileListHTML(data), {status: 200, headers: {"Content-Type": "text/html"}});
    }
    filename = pathParts[pathParts.length - 1];
  } else {
    return createHTMLResponse(400, "Bad Request");
  }
  newUrl = `https://github.com/${REPOSITORY}/releases/download/${tag}/${filename}`;
  let response = await fetch(newUrl);
  if (response.status !== 200) {
    return createHTMLResponse(404, "Not Found");
  }
  let {readable, writable} = new TransformStream();
  response.body.pipeTo(writable);
  return new Response(readable, response);
}
