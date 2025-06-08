# Exercise Tracker Microservice

My solution for one of the tasks from [freecodecamp](https://www.freecodecamp.org/learn/back-end-development-and-apis/back-end-development-and-apis-projects/exercise-tracker)freecodecamp. This task involved creation of a simple exercise tracker  microservice according to the given guidelines that can be found in the above link. The solution is currently available on my [website](https://exercisetracker.profresor.net).

## Requirements

The only requirement is Docker, which can be installed from [official website](https://www.docker.com/products/docker-desktop/)

## Setup

First, creation of your own <i>.env</i> file is required based on [<i>sample.env</i>](https://github.com/MrResor/freecodecamp-exercisetracker/blob/main/sample.env) file.

Finally, micro service can be run using the following command run from the project main directory:
```
sudo docker compose up -d
```

As the result, the microservice will be available at 127.0.0.1:10003.

NOTE: [<i>compose.yaml</i>](https://github.com/MrResor/freecodecamp-exercisetracker/blob/main/compose.yaml) should be updated with volume paths that correspond to the file layout on your machine.

## Description

The documentation of the application endpoints can be found under [<i>/api/docs</i>](https://exercisetracker.profresor.net/api/docs).
