# Local security backports

- `deepmerge` 4.3.1: filter `__proto__` from both merge inputs to prevent prototype poisoning (GHSA-gcqx-w48m-w2h4). The source and both distributed bundles carry the same change. Remove the overrides and this copy when a compatible upstream fix is available.
- `src-tauri/vendor/glib` 0.18.5: backport the mutable output pointer fix from https://github.com/gtk-rs/gtk-rs-core/pull/1343 (RUSTSEC-2024-0429). Remove the Cargo patch when the Tauri GTK dependency chain supports a fixed release.

Both copies retain their upstream licenses and version numbers. Version-based scanners may continue reporting these advisories until upstream dependencies are upgraded.
