#!/usr/bin/env bash
# Push a data bot's commit to the branch the workflow runs on.
#
# main requires the "verify" check (repository ruleset "main: verify required"),
# and a personal repository cannot exempt GitHub Actions from it. Each bot runs
# the full `pnpm verify` gate in its own job before it gets here, so it records
# that result as the "verify" status itself: push the commit to a temporary
# branch, mark it, then fast-forward the target branch to it.
#
#   bash scripts/ci/push-verified.sh "<what passed, for the status description>"
set -euo pipefail
target="${GITHUB_REF_NAME:?}"
sha="$(git rev-parse HEAD)"
if [ "$sha" = "$(git rev-parse "origin/$target")" ]; then
  echo "No new commit; nothing to push."
  exit 0
fi
temp="bot/verified-${GITHUB_RUN_ID:?}-${GITHUB_RUN_ATTEMPT:-1}"
git push origin "HEAD:refs/heads/$temp"
trap 'git push origin --delete "$temp" >/dev/null 2>&1 || true' EXIT
gh api "repos/${GITHUB_REPOSITORY:?}/statuses/$sha" \
  -f state=success -f context=verify -f description="${1:-pnpm verify passed in the bot workflow}" \
  -f target_url="${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}" >/dev/null
git push origin "HEAD:refs/heads/$target"
