FROM mhart/alpine-node:8.5

RUN mkdir -p /usr/src/app
ADD . /usr/src/app
WORKDIR /usr/src/app
RUN npm i

EXPOSE 3000
EXPOSE 4000
CMD npm start
