#!/bin/bash

set -e

# Accept bump type (default to "patch")
BUMP_TYPE=$1
VALID_BUMPS=("major" "minor" "patch", "git")

# Check if bump type is valid; otherwise, default to "patch"
if [[ ! " ${VALID_BUMPS[@]} " =~ " ${BUMP_TYPE} " ]]; then
  echo "⚠️  Unknown or missing bump type: '$BUMP_TYPE'. Defaulting to patch."
  BUMP_TYPE="patch"
fi

# Restore all git changes
git restore -s@ -SW  -- packages playground

# Build all once to ensure things are nice
pnpm build

# Check if Bump Type is git
if [[ "$BUMP_TYPE" == "git" ]]; then
    echo "Bump type is 'git'. Skipping version bump and tag creation."

    if [[ -z "$TAG" ]] ; then
        TAG="latest"
    fi

    echo "Will release packages with tag $TAG"
else
    # Get next version tag
    PACKAGE_VERSION=$(npx tsx scripts/calculateVersion.ts "$BUMP_TYPE")

    echo "Next version: $PACKAGE_VERSION"

    # Create a new tag
    TAG_NAME="v$PACKAGE_VERSION"
    echo "Creating tag: $TAG_NAME"
    git tag -a "$TAG_NAME" -m "Release $TAG_NAME"

    # Check if the version is already set
    $(npx tsx scripts/bump.ts)
fi

# git push origin "$TAG_NAME"

# Release packages
for PKG in packages/* ; do
  pushd $PKG
  # initialise TAG if isn't already set
  if [[ -z "$TAG" ]] ; then
    TAG="latest"
  fi
  echo "⚡ Publishing $PKG with tag $TAG"
  cp $REPO_ROOT/LICENSE .
#   if [[ $PKG != "docs" ]]; then
#     cp $REPO_ROOT/README.md .
#   fi
  pnpm publish --access public --no-git-checks --tag $TAG
  popd > /dev/null
done

# Clean up
echo "Cleaning up..."
git restore -s@ -SW  -- packages playground
