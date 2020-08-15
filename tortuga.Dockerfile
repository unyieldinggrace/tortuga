FROM node:14

# Create app directory
WORKDIR /usr/src/app

ENV TZ=Australia/Brisbane
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
# COPY ./package*.json ./
COPY ./*.json ./
COPY ./*.js ./
COPY ./datamodel ./datamodel
COPY ./domain ./domain
COPY ./util ./util

RUN npm install

EXPOSE 3000
CMD [ "node", "index.js" ]

