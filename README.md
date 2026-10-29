# fishing-game

Port fishing-source-code-cpp to a esm javascript library

## Release workflow

The GitHub Actions workflow builds a release after a push to `main` when
`status.json` contains `"needsUpdate": true`.

Before releasing:

1. Update the version in `package.json`.
2. Set `needsUpdate` to `true` in `status.json`.
3. Push the changes to `main`.

The workflow bundles the JavaScript once, generates icons, packages the Electron
application for Windows, macOS, and Linux, and publishes the artifacts to a
versioned GitHub Release. It also builds and deploys the browser version to
GitHub Pages and attaches the browser HTML page to the Release. After a
successful release it resets `status.json` so a later push does not publish the
same version again.

Linux releases include AppImage, deb, rpm, and tar.gz packages.
