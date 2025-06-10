git checkout main

sudo docker compose down
sudo docker rmi freecodecamp-exercisetracker-api freecodecamp-exercisetracker-db

git pull

sudo docker compose up -d

sleep 2

response=$(curl --silent https://exercisetracker.profresor.net/api/hello)

if [ "$response" == '{"greeting":"hello API"}' ]; then
    echo "SUCCESS: API is working!"
else
    echo "ERROR: API is not working!"
fi