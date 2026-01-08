#!/usr/bin/env bash
set -e
cp -n ../01_WEB/.env.example ../01_WEB/.env || true
cp -n ../02_API/.env.example ../02_API/.env || true
echo "Env files ready."
