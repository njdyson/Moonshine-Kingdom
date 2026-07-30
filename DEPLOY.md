# Deploying mk.psybob.uk

This repo (`njdyson/Moonshine-Kingdom`) is what the live site
**mk.psybob.uk** is deployed from. The domain root maps to this repo's
root, so the whole repo is the site: the rules/design HTML pages **and**
the playable online game.

## Two-repo setup (read this first)

The playable game is developed in a **separate** repo,
[`njdyson/mk-online`](https://github.com/njdyson/mk-online) (branch `main`).
That repo commits a ready-to-serve build to its own `dist/`, rebuilt by CI
on every push — so you never need to run `npm build` yourself.

**The game bundle is vendored into THIS repo at `mk-online/dist/`.**
That is the one and only location the live site loads the game from —
`index.html` links it as `mk-online/dist/index.html`, and `.gitignore`
tracks only that folder:

```
mk-online/*
!mk-online/dist/
```

> ⚠️ There is **no** top-level `dist/` in this repo, and nothing references
> one. The build goes into `mk-online/dist/`, not `./dist/`. Putting it at
> the top level would ship a duplicate the site never loads.

There is **no automation** between the two repos. When `mk-online` gets
fixes, someone has to copy its built `dist/` into this repo's
`mk-online/dist/` and push. This file documents that manual sync.

## Sync steps

### Windows (owner's machine)

Run the vendored helper from this repo's root. It builds `mk-online` from
your local clone, mirrors `dist/` in, commits and pushes:

```powershell
./deploy-mk-online.ps1
```

(Edit the `$source` path at the top of that script if your `mk-online`
clone lives somewhere other than `C:\Users\nickj\Desktop\MK Online\mk-online`.)

### Manual / any platform

`mk-online` already commits a built `dist/`, so no build is needed:

```bash
# 1. Get the latest mk-online build
git clone --depth 1 -b main https://github.com/njdyson/mk-online /tmp/mk-online

# 2. Mirror it into THIS repo's mk-online/dist/ (mirror = replace, so a
#    build that drops files removes the stale ones here too)
rm -rf mk-online/dist
mkdir -p mk-online/dist
cp -a /tmp/mk-online/dist/. mk-online/dist/

# 3. Commit and push
git add -A mk-online/dist
git commit -m "Deploy mk-online (source <short-sha>)"
git push origin main
```

## Go live

Pushing to `main` is what publishes. Two mechanisms may be in play:

- **GitHub Actions** (`.github/workflows/deploy.yml`) rsyncs the repo to the
  VPS automatically on every push to `main`.
- **Plesk** git deployment on the server: hit **Pull now**, then **Deploy
  now** on the `mk.psybob.uk` deployment.

Then hard-refresh the game (Ctrl/Cmd + Shift + R).

## Verify a sync worked

```bash
# The hash in mk-online/dist/index.html is authoritative — match it.
grep -o 'assets/index-[A-Za-z0-9]*\.js' mk-online/dist/index.html

# In DevTools → Network, the game's loaded JS should match that hash.
```
