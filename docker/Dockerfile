FROM ubuntu:latest
#Create app directory
RUN apt-get update && apt-get install -y node mongodb

RUN mkdir -p /usr/src/ssa_dev_help
WORKDIR /usr/src/ssa_dev_help
#Install app dependencies
COPY package.json  /usr/src/ssa_dev_help
#Bundle app source
COPY . /usr/src/ssa_dev_help
EXPOSE 8080
CMD [ "npm", "start" ]
