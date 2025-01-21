for f in $(ls tags); do
    echo Deploying $f
    deploy/deploy.sh tags/$f || exit $?
done