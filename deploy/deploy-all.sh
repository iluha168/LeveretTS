set -e

for f in $(ls tags/*.mts); do
    echo Deploying $f
    deploy/deploy.sh $(basename $f .mts) ${@:1}
done