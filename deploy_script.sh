#!/bin/bash
#ssss
#1111
#22222
#test xyzzzzzz
echo "hi"
# Check if branch name is provided as an argument
if [ -z "$1" ]; then
    echo "Please provide the branch name as an argument."
    exit 1
fi

# Check if app name is provided as an argument
if [ -z "$2" ]; then
    echo "Please provide the app name as an argument."
    exit 1
fi

# Assign the arguments to variables
branch_name=$1
app_name=$2

# Change to the project directory, exit if it fails
cd xyz.gammaassets.com/ || exit

# Pull the latest changes
git fetch origin

# Switch to the specified branch
git checkout "$branch_name"

# Pull the latest changes for the branch
git pull origin "$branch_name"

# Run docker compose up with build
docker compose up --build -d "$app_name" &

# Prune all unused Docker objects
docker system prune -af
