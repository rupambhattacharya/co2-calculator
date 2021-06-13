# Co2 Calculator

This project comprises of a tool that returns the amount of CO2-equivalent that will be caused owing to traveling between two cities using a given transportation method.

It accepts 3 parameters - the starting city with the parameter --start, the destination city with the parameter --end and the mode of transportation with the parameter --transportation-method. Currently the tool supports the following transportation methods - small-diesel-car, small-petrol-car, small-plugin-hybrid-car, small-electric-car, medium-diesel-car, medium-petrol-car, medium-plugin-hybrid-car, medium-electric-car, large-diesel-car, large-petrol-car, large-plugin-hybrid-car and large-electric-car.
## Install

The project uses npm to take care of the dependencies. Npm would install all the required packages to run the tool.

```shell
npm install
```
## Run Unit Tests & Linting

The project uses Jest to take care of the unit tests and ES Lint Airbnb style to take care of the linting to take care of the best practice coding styles.

The unit tests would run with the following command :
```shell
npm run test
```

The linting would run with the following command :
```shell
npm run lint
```
A precommit hook has been added which would take care of unit tests and linting before the commit is pushed to the repository.

## Running the tool

The tool uses api key from https://openrouteservice.org/ to get latitude and longitude and get the distance between two cities. User needs to request an api key, create a .env file in the root directory and store the api key with the variable name ORS_TOKEN.

```shell
ORS_TOKEN= secret-api-key;
```
Dotenv package takes care of getting the api key from environment variable.

An example of a command to run the tool may look like :
```shell
node handler.js --start Hamburg --end Munich --transportation-method medium-diesel-car
```

It would output the amount of CO2-equivalent in console log.
```shell
Your trip caused 135.59 kg of CO2-equivalent.
```
## Build Pipeline

We could potentially use technologies like serverless to deploy the lambda to AWS or other cloud environments. 

Tools like Gitlab CI or Jenkins could be used to deploy to cloud on every commit. We can set up separate environments in the CI file and run the install, lint, test and deployment scripts.