#!/usr/bin/env bash
set -euo pipefail

SUITE_REPO="nicknguyen-cs/contentstack-suite-skills"
LOCAL_SKILLS=".agents/skills"
TMP_DIR=$(mktemp -d)

trap 'rm -rf "$TMP_DIR"' EXIT

usage() {
  echo "Usage: $0 <push|pull> [skill-name...]"
  echo ""
  echo "  push  — Copy skills from .agents/skills/ → suite repo (commits & pushes)"
  echo "  pull  — Copy skills from suite repo → .agents/skills/"
  echo ""
  echo "  If skill names are given, only those skills are synced."
  echo "  If omitted, all skills are synced."
  echo ""
  echo "Examples:"
  echo "  $0 push                              # push all skills"
  echo "  $0 push contentstack-launch          # push one skill"
  echo "  $0 pull lytics-cdp-api lytics-jstag  # pull two skills"
  exit 1
}

[ $# -lt 1 ] && usage

ACTION="$1"
shift
FILTER=("$@")

get_skills() {
  local dir="$1"
  if [ ${#FILTER[@]} -gt 0 ]; then
    for s in "${FILTER[@]}"; do echo "$s"; done
  else
    ls -1 "$dir"
  fi
}

case "$ACTION" in
  push)
    echo "Cloning $SUITE_REPO..."
    gh repo clone "$SUITE_REPO" "$TMP_DIR/suite" -- -q

    skills=$(get_skills "$LOCAL_SKILLS")
    for skill in $skills; do
      if [ ! -d "$LOCAL_SKILLS/$skill" ]; then
        echo "SKIP: $skill not found in $LOCAL_SKILLS"
        continue
      fi
      echo "PUSH: $skill"
      rm -rf "$TMP_DIR/suite/$skill"
      cp -r "$LOCAL_SKILLS/$skill" "$TMP_DIR/suite/$skill"
    done

    # Update README skill table from local skills
    cp "$TMP_DIR/suite/README.md" "$TMP_DIR/suite/README.md"

    cd "$TMP_DIR/suite"
    git add -A
    if git diff --cached --quiet; then
      echo "No changes to push."
    else
      echo ""
      echo "Changes to push:"
      git diff --cached --stat
      echo ""
      read -p "Commit and push? [y/N] " -n 1 -r
      echo
      if [[ $REPLY =~ ^[Yy]$ ]]; then
        git commit -m "Sync skills from ff project"
        git push
        echo "Pushed."
      else
        echo "Aborted."
      fi
    fi
    ;;

  pull)
    echo "Cloning $SUITE_REPO..."
    gh repo clone "$SUITE_REPO" "$TMP_DIR/suite" -- -q

    skills=$(get_skills "$TMP_DIR/suite")
    for skill in $skills; do
      src="$TMP_DIR/suite/$skill"
      # Skip non-directories (README, etc.)
      [ ! -d "$src" ] && continue
      echo "PULL: $skill"
      rm -rf "$LOCAL_SKILLS/$skill"
      cp -r "$src" "$LOCAL_SKILLS/$skill"
    done

    echo "Done. Review changes with: git diff .agents/skills/"
    ;;

  *)
    usage
    ;;
esac
