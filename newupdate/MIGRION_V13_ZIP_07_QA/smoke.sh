#!/usr/bin/env bash
set -e
echo "API health:"
curl -s http://localhost:4000/health | cat
echo ""
