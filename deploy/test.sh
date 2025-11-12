#!/bin/bash
if ! [ $1 ]; then
    echo Provide the tag name.
    exit 1
fi

for((;;)); do
    echo -n Waiting for changes...
    watch -n 1 -d -t -g stat "tags/$1.mts" \| shasum > /dev/null
    clear
    deploy/build.sh "$1" || exit $?
    deno run -A ./runner/bot/sandbox/engineInstance.mts "$1" "$(cat dist/o.js)" "${*:2}"
done
