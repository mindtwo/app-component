#!/bin/bash

set -e

# Restore all git changes
git restore -s@ -SW  -- packages examples docs

# Build all once to ensure things are nice
pnpm build

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
#   pnpm publish --access public --no-git-checks --tag $TAG
  popd > /dev/null
done
