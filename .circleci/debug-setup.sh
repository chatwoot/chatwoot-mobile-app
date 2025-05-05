#!/bin/bash
# Debug script to determine why Ruby setup is running
echo "======== CircleCI Debug Info ========"
echo "Current directory: $(pwd)"
echo "Files in .circleci:"
ls -la .circleci/
echo "Environment variables:"
printenv | grep -E "CIRCLE|CI|NODE"
echo "==================================="