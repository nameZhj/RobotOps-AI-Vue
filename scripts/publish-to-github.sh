#!/usr/bin/env bash
set -euo pipefail

REPOSITORY='nameZhj/RobotOps-AI-Vue'
REMOTE_URL="https://github.com/${REPOSITORY}.git"

command -v gh >/dev/null 2>&1 || { echo 'Install GitHub CLI: https://cli.github.com/'; exit 1; }
command -v git >/dev/null 2>&1 || { echo 'Install Git before publishing.'; exit 1; }
gh auth status >/dev/null

read -r -p 'Repository visibility (private/public) [public]: ' VISIBILITY
VISIBILITY="${VISIBILITY:-public}"
case "$VISIBILITY" in
  private) VISIBILITY_FLAG='--private' ;;
  public) VISIBILITY_FLAG='--public' ;;
  *) echo 'Visibility must be private or public.'; exit 1 ;;
esac

if [ ! -d .git ]; then git init -b main; fi
git branch -M main
git add .
if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
  git commit -m 'chore: bootstrap RobotOps AI Vue framework'
fi

if gh repo view "$REPOSITORY" >/dev/null 2>&1; then
  echo "Repository $REPOSITORY already exists; pushing to it."
  if git remote get-url origin >/dev/null 2>&1; then
    git remote set-url origin "$REMOTE_URL"
  else
    git remote add origin "$REMOTE_URL"
  fi
  git push -u origin main
else
  gh repo create "$REPOSITORY" "$VISIBILITY_FLAG" --source . --remote origin --push
fi

echo "Published: https://github.com/${REPOSITORY}"
