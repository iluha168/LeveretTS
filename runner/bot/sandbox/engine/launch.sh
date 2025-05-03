#!/bin/bash
set -e

source ~/.nvm/nvm.sh
nvm use v20.9.0
npx tsx index.mts
