#!/bin/bash
set -e

source ~/.nvm/nvm.sh
nvm use v24.7.0
node index.mts
