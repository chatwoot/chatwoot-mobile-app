#!/bin/bash
# This script serves as a wrapper for Node.js to ensure it's properly found
# regardless of environment variables or symlinks

# Full path to node executable
NODE_PATH=/opt/homebrew/bin/node

# Check if it exists, otherwise try to find it
if [ ! -f "$NODE_PATH" ]; then
    # Try to find using which
    NODE_PATH=$(which node)
    
    # If still not found, try common locations
    if [ "$?" -ne 0 ]; then
        for path in /opt/homebrew/Cellar/node/23.11.0/bin/node /usr/local/bin/node /usr/bin/node; do
            if [ -f "$path" ]; then
                NODE_PATH=$path
                break
            fi
        done
    fi
fi

# Execute node with all the arguments
exec "$NODE_PATH" "$@" 