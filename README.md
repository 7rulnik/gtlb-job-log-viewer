<p align="center">
  <img width="220" src="media/logo.svg" alt="logo"/>
</p>

<h1 align="center">Gitlab CI logs viewer</h1>


> [Browser extension](https://chrome.google.com/webstore/detail/gitlab-ci-logs-viewer/mjjniaplbhdjmhkmfknkbemfjghofaff) for code highlighting raw logs in GItlab CI

If you have large logs Gitlab will show only part of it. Gitlab has a link to the full log but it's completely unusable due of lack ANSI code highlighting and text formatting. This extension parses ANSI codes and shows full logs with code highlighting.

It works with self-hosted Gitlab instances for links like http://*your-gitlab-hostname*/*path-to-project*/-/jobs/*job-number*/raw and with gitlab.com.

## How it looks

<p align="center">
  wihtout extension
  <img width="100%" src="media/before-1280.png" alt="Without extension"/>
</p>

---------

<p align="center">
  with extension
  <img width="100%" src="media/example-1280.png" alt="With extension"/>
</p>


## How to install

[Chrome web store](https://chrome.google.com/webstore/detail/gitlab-ci-logs-viewer/mjjniaplbhdjmhkmfknkbemfjghofaff)

### Manual install

1. Download extension archive [v0.0.1.zip](https://github.com/7rulnik/gitlab-job-log-viewer/releases/download/v0.0.1/v0.0.1.zip)
2. Unarchive it
3. Open [chrome://extensions/](chrome://extensions/)
4. Turn on **Developer mode** in upper right corner
5. Drag and drop unarchived folder

# TODO

- [ ] Publish into diffrent broswer's stores
- [ ] Fix section's durations and add some styles for it
- [ ] Parse links
- [ ] Custom highlight color schemes and fonts
- [ ] Add gif with example
- [ ] Add info about where to find link to full log


