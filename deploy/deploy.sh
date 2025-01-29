#!/bin/bash
OUT_PATH=dist/o.js

set -e

deno check -q $1
rm -rf dist
deno run -WRE npm:typescript/tsc --noResolve --noCheck --module commonjs --lib esnext --target esnext --outDir dist $1
deno run -A https://deno.land/x/esbuild/mod.js dist/* --minify --outfile=$OUT_PATH --allow-overwrite 2> /dev/null

deno run -NER deploy/index.mts $(basename -- "$1" ".${1#*.}") $OUT_PATH