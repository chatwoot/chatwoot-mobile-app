#!/bin/bash
# This script will be sourced before any job is run in CircleCI
# Its purpose is to intercept and prevent the automatic Ruby setup

# Create a dummy function to intercept RVM setup
function rvm() {
  echo "RVM setup intercepted and skipped"
}

# Create a dummy function to intercept bundle install
function bundle() {
  echo "Bundle install intercepted and skipped"
}

export -f rvm
export -f bundle

# Export a flag to indicate we don't want Ruby
export SKIP_RUBY_SETUP=true

echo "Ruby setup has been disabled by pre-start.sh"