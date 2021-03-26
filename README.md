# Rent Movies Node.JS

To run this project, you'll need: [Node.JS](https://nodejs.org/en/) LTS, [Yarn](https://yarnpkg.com/) or Npm, [Docker](https://docs.docker.com/engine/) withdocker-compose installed.

First install dependencies running the following commands on projet root:
```
yarn or npm install
```
Create an .env in the root of the project based on .env.example.

Start docker databse with:
```
docker-compose up -d
```
To start projet or run test, use the following commands respectively:
```
yarn dev 
yarn test
```

There is a insomnia.json on project root, you can import this file into [Insomnia](https://insomnia.rest/download) and try the API.

