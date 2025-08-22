printf "\nInstalling CDK dependencies..."
(cd ./cdk && npm install)

printf "\nBuilding shared-utils package..."
(cd ./shared-utils && npm install && npm run build)
      
printf "\nInstalling Lambda dependencies..."
for dir in ./cdk/lambda/*/*/; do
if [ -d "$dir" ]; then
    echo "Installing dependencies for $dir"
    (cd "$dir" && npm install)
fi
done

printf "\nInstalling frontend dependencies..."
(cd ./frontend && npm install)