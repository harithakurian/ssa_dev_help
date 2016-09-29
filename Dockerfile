FROM ubuntu:latest
#Create app directory
RUN apt-get update && apt-get install -y nodejs npm mongodb
RUN mkdir -p /usr/src/ssa_dev_help
WORKDIR /usr/src/ssa_dev_help
COPY . /usr/src/ssa_dev_help
ADD start.sh /tmp/
RUN chmod +x /tmp/start.sh
EXPOSE 8080
CMD /tmp/start.sh
