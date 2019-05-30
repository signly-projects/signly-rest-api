# Signly Content App in NodeJS

## Install in Ubuntu 18.04

---

### Install Node.js

#### Install PPA

`cd ~ && curl -sL https://deb.nodesource.com/setup_10.x -o nodesource_setup.sh`

#### Run the setup script

`sudo bash nodesource_setup.sh`

#### Install the Node.js package with apt

`sudo apt install nodejs`

#### Check installed version

`nodejs -v`

#### (Additional) Install build essencials - needed for some npm packages to work

`sudo apt install build-essential`

---

### Install Yarn

#### Importing the repository’s GPG key

`curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -`

#### Add the Yarn APT repository

`echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list`

#### Update the package list and install Yarn

`sudo apt update && sudo apt install yarn`

---

## Clone Signly Content App repository

### Make sure you have git installed

`sudo apt update && sudo apt install git`

### Clone repo

`git clone git@ssh.dev.azure.com:v3/signly/SignlyBrowserExtension/signly-content-nodejs`

---

## Setup Node.js evironment

### Rename .env.example to .env

`mv .env.example .env`

### Change content depending on current environment

#### Local development - uses local mongoDB

`NODE_ENV=dev_local`

#### Remote development - uses remote CosmosDB for mongoDB *signly-dev*

`NODE_ENV=dev`

#### Remote staging - uses remote CosmosDB for mongoDB *sigly-stag*

`NODE_ENV=stag`

#### Remote production - uses remote CosmosDB for mongoDB *sigly-prod*

`NODE_ENV=prod`

#### Testing - uses local mongoDB *sigly-test*

`NODE_ENV=test`

---

## Run Singly Node.js App

### Yarn install to fetch node modules

`yarn install`

### Decrypt environment configurations

`yarn dec-config`

---

## Testing with Jest

### Running tests

`yarn test`

### Running tests in watch mode

`yarn test:watch`

## Errors

### In Ubuntu you might get an error running jest tests in watch mode. Run the following command to solve the issue

`echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p`
