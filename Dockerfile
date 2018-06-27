FROM mhart/alpine-node:10

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
EXPOSE 3000
EXPOSE 4000
