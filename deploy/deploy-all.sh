for f in $(ls tags/*.mts); do
    echo Deploying $f
    deploy/deploy.sh tags/$f || exit $?
done