printf "\nInstalling CDK dependencies...\n"
(cd ./cdk && npm install)

printf "\nBuilding shared-types package...\n"
(cd ./shared-types && npm install && npm run build)

printf "\nBuilding shared-utils package...\n"
(cd ./shared-utils && npm install && npm run build)
      
printf "\nInstalling Lambda dependencies...\n"
for dir in ./cdk/lambda/*/*/; do
if [ -d "$dir" ]; then
    printf "\nInstalling dependencies for $dir \n"
    (cd "$dir" && npm install)
fi
done

printf "\nInstalling frontend dependencies...\n"
(cd ./frontend && npm install)