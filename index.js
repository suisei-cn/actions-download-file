const core = require("@actions/core");
const github = require("@actions/github");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

function getFilenameFromUrl(url) {
  const u = new URL(url);
  const pathname = u.pathname;
  const pathClips = pathname.split("/");
  const filenameWithArgs = pathClips[pathClips.length - 1];
  return filenameWithArgs.replace(/\?.*/, "");
}

async function main() {
  try {
    // const text = core.getInput("url");
    var text =
      "cc(https://suisei.outv.im/clips/output-oIfwhsO-0Pk-2529.8-2542.3.mp3)cc";
    // const target = core.getInput("target");
    var target = "src/kmm";
    // const autoMatch = core.getInput("auto-match");
    var autoMatch = "true";
    if (["false", "0"].includes(autoMatch.toLowerCase().trim())) {
      autoMatch = false;
    } else {
      autoMatch = true;
    }
    const url = (() => {
      if (!autoMatch) return text;
      if (autoMatch) {
        const match = text.match(/\((.*)\)/);
        if (match === null) return "";
        return match[1] || "";
      }
    })();
    if (url.trim() === "") {
      core.setFailed("Failed to find a URL.");
      return;
    }
    console.log(`URL found: ${url}`);
    try {
      fs.mkdirSync(target, {
        recursive: true,
      });
    } catch (e) {
      core.setFailed(`Failed to create target directory ${target}: ${e}`);
      return;
    }
    const body = await fetch(url)
      .then((x) => x.buffer())
      .catch((err) => {
        core.setFailed(`Fail to download file ${url}: ${err}`);
        return undefined;
      });
    if (body === undefined) return;
    console.log("Download completed.");
    const filename = getFilenameFromUrl(url);
    fs.writeFileSync(path.join(target, filename), body);
    console.log("File saved.");
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
