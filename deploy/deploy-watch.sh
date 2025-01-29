#!/bin/bash
if ! [ $1 ]; then
    echo Provide path to the tag source.
fi

for((;;)); do
    clear
    echo Waiting for changes...
    watch -n 1 -d -t -g stat "$1" \| shasum > /dev/null
    echo Tag changed! Deploying...
    deploy/deploy.sh "$1" || exit $?
    echo Success
    sleep 1
done