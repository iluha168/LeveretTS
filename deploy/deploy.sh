#!/bin/bash
OUT_PATH=dist/o.js

deno check -q $1 &&\
deno run -WRE npm:typescript/tsc --noResolve --noCheck --module commonjs --lib esnext --target esnext --outDir dist $1 &&\
deno run -A https://deno.land/x/esbuild/mod.js dist/* --minify --outfile=$OUT_PATH --allow-overwrite 2> /dev/null || exit 1

COMPILED=$(cat $OUT_PATH)
echo ${COMPILED:0:-10} | deno run -NER deploy/index.mts $(basename -- "$1" ".${1#*.}")

rm -rf dist