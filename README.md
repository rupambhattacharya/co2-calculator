# Escenic Adapter

this project has 2 lambda functions, one to fetch data from escenic the other to push the content in canonical format to ContentPlatforms API

It contains a definition of a CICD pipeline that can be created with the aws CLI.

## Build Pipeline

The build pipeline is created over Jenkins. The Jenkinsfile tells us how the build pipeline should look like and what commands need to be run to successfuly deploy this project. The main pipeline definition for this project is set up using Jenkins UI and the UI simply picks up the Jenkinsfile from this project structure and deploys the code according to the steps there.

The pipeline deploys to 3 different environments

- dev (automatic)
- int (with manual approval)
- prod (with manual approval)

It contains a definition of a CICD pipeline that can be created with the aws CLI.

## Run Unit Tests

The unit tests would run with the following command :
npm test tests/escenicEtl.spec.js