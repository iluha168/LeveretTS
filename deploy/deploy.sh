#!/bin/bash
OUT_PATH=dist/o.js

set -e

if ! [ $1 ]; then
    echo Provide the tag name.
    exit 1
fi

function step {
    echo -n $1...
    if ERRLOG=$(${@:2} 2> /dev/stdout); then
        echo \ ok
    else
        code="$?"
        echo \ error
        echo "${@:2}" > /dev/stderr
        echo "$ERRLOG" > /dev/stderr
        exit "$code"
    fi
}

cd tags
step Typecheck deno check $1.mts
step Transpiling deno run -WRE npm:typescript/tsc --noCheck --outDir ../dist
cd ..

step Bundling deno run -A https://deno.land/x/esbuild/mod.js\
    --minify --bundle --outfile=$OUT_PATH --allow-overwrite\
    dist/tags/$1.mjs

echo "$(cat deploy/credits.mts $OUT_PATH)" > $OUT_PATH 

# Skip deploy by passing any second argument
if ! [ $2 ]; then
    step Deploying deno run -NER deploy/index.mts $1 $OUT_PATH
fi