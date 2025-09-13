printf "\nBuilding Lambda packages...\n"
for dir in ./cdk/lambda/*/*/; do
if [ -d "$dir" ]; then
    printf "\nBuilding $dir package\n"
    (cd "$dir" && npm run build)
fi
done

printf "\nCleaning Lambda packages...\n"
for dir in ./cdk/lambda/*/*/; do
if [ -d "$dir" ]; then
    printf "\nCleaning $dir package\n"
    (cd "$dir" && rm *.js && rm *.d.ts)
    (cd "$dir/route" && rm *.js && rm *.d.ts)
fi
done