import { SITE_NAME, HEAD, DEFAULT_TAG } from "./config";

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
  } else {
    icon = "file";
  }

  return makeIconHTML(`fas fa-lg fa-fw fa-${icon}`);
}

const makeIconHTML = (classes) => `<i class="${classes}" aria-hidden="true"></i>`;

export function listFilesHTML(data) {
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
    let updated = new Date(item["updated_at"]).toUTCString();
    tbody += `<tr>
    <td><a href="/${tag}/${name}">${getItemIcon(name)} ${name}</a></td>
    <td><span title="${sizeActual}">${sizeHuman}</span></td>
    <td>${updated}</td>
    </tr>`;
  }

  return makeHTML(
    tag,
    `<div class="container">
      <div class="py-5 text-center">
        <h1>${displayName} - ${SITE_NAME}</h1>
        ${description}
      </div>
      <div class="row"><div class="col col-md-12">
        <table class="table table-hover border bg-white">
          <thead class="thead-light"><tr><th>File</th><th>Size</th><th>Updated</th></tr></thead>
          <tbody>
            <tr><td colspan="3">
              <a href="../"><i class="fas fa-lg fa-fw fa-level-up-alt" aria-hidden="true"></i> Parent directory</a>
            </td></tr>
            ${tbody}
          </tbody>
        </table>
      </div></div>
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
      publishTime = new Date(item["published_at"]).toUTCString();
    if (tag === DEFAULT_TAG) {
      // The default tag goes in the first place
      let iconHTML = getItemIcon("$folderDefault");
      tbody =
        `<tr>
      <td><a href="/${tag}/">${iconHTML} ${tag}</a></td>
      <td>${name}</td>
      <td>${publishTime}</td>
      </tr>` + tbody;
    } else {
      let iconHTML = getItemIcon("$folder");
      tbody += `<tr>
      <td><a href="/${tag}/">${iconHTML} ${tag}</a></td>
      <td>${name}</td>
      <td>${publishTime}</td>
      </tr>`;
    }
  }

  return makeHTML(
    "Home",
    `<div class="container">
      <h1 class="py-5 text-center">${SITE_NAME}</h1>
      <div class="row"><div class="col col-md-12">
        <table class="table table-hover border bg-white">
          <thead class="thead-light"><tr><th>Release</th><th>Name</th><th>Created</th></tr></thead>
          <tbody>${tbody}</tbody>
        </table>
      </div></div>
    </div>`
  );
}

const makeHTML = (title, body) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <title>${title} - ${SITE_NAME}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css" integrity="sha256-T/zFmO5s/0aSwc6ics2KLxlfbewyRz6UNw1s3Ppf5gE=" crossorigin="anonymous">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@5.15.2/css/all.min.css" integrity="sha256-0fuNgzfNIlaClbDtmYyFxY8LTNCDrwsNshywr4AALy0=" crossorigin="anonymous">
  ${HEAD}
</head>
<body class="bg-light">${body}</body>
</html>`;

export function createHTMLResponse(code, text) {
  text = `${code} ${text}`;
  body = `<center><h1>${text}</h1></center><hr><center>${SITE_NAME}</center></body></html>`;
  return new Response(makeHTML(text, body), { status: code, headers: { "Content-Type": "text/html" } });
}
