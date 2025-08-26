#!/bin/bash

set -e

# Restore all git changes
git restore -s@ -SW  -- packages playground

# Build all once to ensure things are nice
# pnpm build

# Get next version tag
PACKAGE_VERSION=$(npx tsx scripts/calculateVersion.ts)

echo "Next version: $PACKAGE_VERSION"

# Check if the version is already set
$(npx tsx scripts/bump.ts "$PACKAGE_VERSION")

# Create a new tag
TAG_NAME="v$PACKAGE_VERSION"
echo "Creating tag: $TAG_NAME"
git tag -a "$TAG_NAME" -m "Release $TAG_NAME"

# Release packages
for PKG in packages/* ; do
  pushd $PKG
  # initialise TAG if isn't already set
  if [[ -z "$TAG" ]] ; then
    TAG="latest"
  fi
  echo "⚡ Publishing $PKG with tag $TAG"
#   cp $REPO_ROOT/LICENSE .
#   if [[ $PKG != "docs" ]]; then
#     cp $REPO_ROOT/README.md .
#   fi
  pnpm publish --access public --no-git-checks --tag $TAG
  popd > /dev/null
done
