# Cloudflare Worker for GitHub Releases

Build a serverless download site with GitHub Releases and Cloudflare Workers

## Features

- Based on GitHub Releases, so no total size limit or bandwidth limit. 
  - GitHub Releases limits size of single files to 2 GB each
- Custom domain with Cloudflare Workers
- One level of directory structure is supported via different release tags.
- Minimalist UI with Bootstrap and Font Awesome

Preview:

![Screenshot](https://raw.githubusercontent.com/iBug/image/master/cloudflare/cf-github-releases.png)

## Setup

### Install Wrangler

See [Cloudflare's documentation](https://developers.cloudflare.com/workers/cli-wrangler/install-update) for more information.

### `wrangler.toml`

Copy `wrangler.example.toml` to `wrangler.toml` and fill in your own information into the variables. Refer to [Cloudflare's documentation](https://developers.cloudflare.com/workers/cli-wrangler/configuration) for more information.

### `config.js`

Copy `config.example.js` to `config.js` and fill in your own information as guided.

## License

The MIT License
