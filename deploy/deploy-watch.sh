#!/bin/bash
if ! [ $1 ]; then
    echo Provide the tag name.
    exit 1
fi

for((;;)); do
    clear
    echo -n Waiting for changes...
    watch -n 1 -d -t -g stat "tags/$1.mts" \| shasum > /dev/null
    echo \ Tag changed!
    deploy/deploy.sh "$1" || exit $?
    echo Success
    sleep 1
done