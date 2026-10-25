#!/usr/bin/env bash
# Cloudflare Pages build, run from a checkout of the vault repo after this
# repo has been cloned into .site/ (see README "Deploying").
# Output directory: .site/public
set -euo pipefail

site="$(cd "$(dirname "$0")/.." && pwd)"
vault="$(cd "$site/.." && pwd)"

# Pages picks up functions/ (the password check) from the project root
rm -rf "$vault/functions"
cp -r "$site/functions" "$vault/functions"

# Copy notes in next to the site's own homepage
tar -C "$vault" \
  --exclude=./.git --exclude=./.github --exclude=./.obsidian \
  --exclude=./.site --exclude=./functions --exclude=./.gitignore \
  -cf - . | tar -C "$site/content" -xf -

cd "$site"
npm ci --no-audit --no-fund
npx quartz build
