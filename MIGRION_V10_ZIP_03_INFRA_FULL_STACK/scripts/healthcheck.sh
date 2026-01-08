#!/usr/bin/env bash
set -e
curl -s http://localhost:4000/health | cat
