const core = require("@actions/core");
const fs = require("node:fs");
const path = require("node:path");

function getFilenameFromUrl(url) {
  const u = new URL(url);
  const pathname = u.pathname;
  const pathClips = pathname.split("/");
  const filenameWithArgs = pathClips[pathClips.length - 1];
  return filenameWithArgs.replace(/\?.*/, "");
}

const FetchFailure = Symbol("FetchFailure");

async function tryFetch(url, retryTimes, failOnNon200) {
  let result;
  for (let i = 0; i <= retryTimes; i++) {
    result = await fetch(url)
      .then((res) => {
        if (failOnNon200 && !res.ok) {
          // This will be catched and returns "FetchFailure"
          throw new Error(`HTTP ${res.status} ${res.statusText}`);
        }
        return res.arrayBuffer();
      })
      .then((x) => x.arrayBuffer())
      .then((x) => new Uint8Array(x))
      .catch((err) => {
        console.error(
          `${i === 0 ? "" : `[Retry ${i}/${retryTimes}]`
          }Fail to download file ${url}: ${err}`
        );
        if (i === retryTimes) {
          core.setFailed(`Fail to download file ${url}: ${err}`);
        }
        return FetchFailure;
      });
    if (result !== FetchFailure) return result;
  }
  return FetchFailure;
}

async function main() {
  try {
    const text = core.getInput("url");
    const target = core.getInput("target");
    const filename = core.getInput("filename");
    let autoMatch = core.getInput("auto-match");
    if (["false", "0"].includes(autoMatch.toLowerCase().trim())) {
      autoMatch = false;
    } else {
      autoMatch = true;
    }

    let failOnNon200 = core.getInput("fail-on-non-200").toLowerCase().trim();
    // only when failOnNon200 specified as "true" or "1" will fetch fail on non-200
    if (["true", "1"].includes(failOnNon200)) {
      failOnNon200 = true;
    } else {
      failOnNon200 = false;
    }

    const retryTimesValue = core.getInput("retry-times");
    const retryTimes = Number(retryTimesValue);
    if (Number.isNaN(retryTimes)) {
      core.setFailed(`Invalid value for "retry-times": ${retryTimesValue}`);
      return;
    }
    const url = (() => {
      if (!autoMatch) return text;
      // if (autoMatch) {
      const match = text.match(/\((.*)\)/);
      if (match === null) return "";
      return match[1] || "";
      // }
    })();
    if (url.trim() === "") {
      core.setFailed("Failed to find a URL.");
      return;
    }
    console.log(`URL found: ${url}`);
    let finalFilename = filename ? String(filename) : getFilenameFromUrl(url);
    if (finalFilename === "") {
      core.setFailed(
        "Filename not found. Please indicate it in the URL or set `filename` in the workflow."
      );
      return;
    }

    try {
      fs.mkdirSync(target, {
        recursive: true,
      });
    } catch (e) {
      core.setFailed(`Failed to create target directory ${target}: ${e}`);
      return;
    }
    const body = await tryFetch(url, retryTimes);
    if (body === FetchFailure) return;
    console.log("Download completed.");

    fs.writeFileSync(path.join(target, finalFilename), body);
    console.log("File saved.");
    core.setOutput("filename", finalFilename);
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
