var fs = require("fs");

const manifestPath = "./build/manifest.json";
const manifest = require('./public/manifest.json');
const assetManifest = require("./build/asset-manifest.json");

const cssEntrypoints = assetManifest.entrypoints.filter((file) =>
  file.endsWith(".css")
);
const jsEntrypoint = assetManifest.entrypoints.filter((file) =>
  file.endsWith(".js")
);

const contentScripsOtps = {
  content_scripts: [
    {
      matches: ["*://*/*/-/jobs/*/raw", "*://*/*/*/*/*/*/*/job.log*", "https://storage.googleapis.com/gitlab-gprd-artifacts/*/job.log*", "file:///*job.log"],
      css: cssEntrypoints,
      js: jsEntrypoint,
    },
  ],
};

const extendedManifest = {
  ...manifest,
  ...contentScripsOtps,
};

console.log("New manifest will be:");
const json = JSON.stringify(extendedManifest, null, "  ");
console.log(json);

fs.writeFileSync(manifestPath, json);
