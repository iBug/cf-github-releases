import { SITE_NAME, HEAD, DEFAULT_TAG } from "./config";

function formatDate(timestamp) {
  return new Date(timestamp).toISOString().replace("T", " ").split(".")[0];
}

// Credits: https://stackoverflow.com/a/14919494/5958455
function humanFileSize(bytes, si = false, dp = 1) {
  const thresh = si ? 1000 : 1024;
  if (Math.abs(bytes) < thresh) {
    return bytes + " B";
  }
  const units = si
    ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  let u = -1;
  const r = 10 ** dp;
  do {
    bytes /= thresh;
    u++;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);
  return bytes.toFixed(dp) + " " + units[u];
}

function getItemIcon(basename) {
  let icon;
  if (basename === "$folder") {
    icon = "folder-open";
  } else if (basename === "$folderDefault") {
    icon = "box-open";
  } else if (/\.(jpe?g|png|bmp|tiff?|gif|webp|tga|cr2|nef|ico)$/i.test(basename)) {
    icon = "file-image";
  } else if (/\.(md|markdown|txt|ini|conf|cfg|pub)$/i.test(basename)) {
    icon = "file-alt";
  } else if (/\.(mp4|mkv|wmv|flv|hls|ogv|avi)$/i.test(basename)) {
    icon = "file-video";
  } else if (/\.(mp3|wav|wma|flac|ogg|aac|m4a)$/i.test(basename)) {
    icon = "file-audio";
  } else if (/\.(zip|tgz|gz|tar|7z|rar|xz|bz2)$/i.test(basename)) {
    icon = "file-archive";
  } else if (/\.(docx?)$/i.test(basename)) {
    icon = "file-word";
  } else if (/\.(xlsx?)$/i.test(basename)) {
    icon = "file-excel";
  } else if (/\.(pp[st]x?)$/i.test(basename)) {
    icon = "file-powerpoint";
  } else if (/\.(pdf)$/i.test(basename)) {
    icon = "file-pdf";
  } else if (/\.([ch](?:pp)?|html|css|js|json)$/i.test(basename)) {
    icon = "file-code";
  } else if (/\.(csv)$/i.test(basename)) {
    icon = "file-csv";
  } else if (/\.(sig|asc)$/i.test(basename)) {
    icon = "file-signature";
  } else if (/\.(exe)$/i.test(basename)) {
    icon = "window-maximize";
  } else {
    icon = "file";
  }

  return makeIconHTML(`fas fa-lg fa-fw fa-${icon}`);
}

const makeIconHTML = (classes) => `<i class="${classes}" aria-hidden="true"></i>`;

export function listFilesHTML(repository, data) {
  let description = "",
    tbody = "",
    tag = data["tag_name"],
    displayName = data["name"];

  if (data["body"]) {
    // render Markdown?
    description = `<p class="lead">${data["body"]}</p>`;
  }

  for (let item of data["assets"]) {
    let name = item["name"];
    let size = item["size"];
    let sizeHuman = humanFileSize(size);
    let sizeActual = size.toLocaleString() + (size === 1 ? " byte" : " bytes");
    let updated = formatDate(item["updated_at"]);
    tbody += `<tr>
    <td><a href="/${tag}/${name}">${getItemIcon(name)} ${name}</a></td>
    <td><span title="${sizeActual}">${sizeHuman}</span></td>
    <td><time>${updated}</time></td>
    </tr>`;
  }

  return makeHTML(
    displayName,
    `<div class="container-fluid container-md">
      <div class="py-5 text-center">
        <h1>${displayName}</h1>
        ${description}
      </div>
    </div>
    <div class="container-fluid container-md table-responsive">
      <table class="table table-hover border bg-white text-nowrap">
        <thead class="thead-light"><tr><th>File</th><th>Size</th><th>Updated</th></tr></thead>
        <tbody>
          <tr><td colspan="2">
            <a href="../">${makeIconHTML("fas fa-lg fa-fw fa-level-up-alt")} Parent directory</a>
          </td><td>
            <a href="https://github.com/${repository}/releases/edit/${tag}">${makeIconHTML("fas fa-fw fa-edit")} Edit on GitHub</a>
          </td></tr>
          ${tbody}
        </tbody>
      </table>
    </div>`
  );
}

export function listReleasesHTML(data) {
  let tbody = "";
  data.sort((a, b) =>
    new Intl.Collator(undefined, { numeric: true, sensitivity: "base" }).compare(a["tag_name"], b["tag_name"])
  );
  for (let item of data) {
    let tag = item["tag_name"],
      name = item["name"],
      publishTime = formatDate(item["published_at"]);

    let prependItem = false, iconHTML = "";
    if (tag === DEFAULT_TAG) {
      // The default tag goes in the first place
      iconHTML = getItemIcon("$folderDefault");
      prependItem = true;
    } else {
      iconHTML = getItemIcon("$folder");
    }

    let newItem = `<tr>
      <td><a href="/${tag}/">${iconHTML} ${tag}</a></td>
      <td>${name}</td>
      <td><time>${publishTime}</time></td>
      </tr>`;
    if (prependItem) {
      tbody = newItem + tbody;
    } else {
      tbody += newItem;
    }
  }

  return makeHTML(
    "Home",
    `<div class="container-fluid container-md">
      <h1 class="py-5 text-center">${SITE_NAME}</h1>
    </div>
    <div class="container-fluid container-md table-responsive">
      <table class="table table-hover border bg-white text-nowrap">
        <thead class="thead-light"><tr><th>Release</th><th>Name</th><th>Created</th></tr></thead>
        <tbody>${tbody}</tbody>
      </table>
    </div>`
  );
}

const makeHTML = (title, body) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <title>${title} - ${SITE_NAME}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/css/bootstrap.min.css" integrity="sha256-DF7Zhf293AJxJNTmh5zhoYYIMs2oXitRfBjY+9L//AY=" crossorigin="anonymous">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@5.15.4/css/all.min.css" integrity="sha256-mUZM63G8m73Mcidfrv5E+Y61y7a12O5mW4ezU3bxqW4=" crossorigin="anonymous">
  ${HEAD}
</head>
<body class="bg-light">${body}</body>
<!-- Powered by iBug/cf-github-releases: https://github.com/iBug/cf-github-releases -->
</html>`;

export function createHTMLResponse(code, text) {
  text = `${code} ${text}`;
  body = `<center><h1>${text}</h1></center><hr><center>${SITE_NAME}</center></body></html>`;
  return new Response(makeHTML(text, body), { status: code, headers: { "Content-Type": "text/html" } });
}
