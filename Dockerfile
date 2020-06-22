FROM node:8.12.0-alpine

MAINTAINER I2G

# Set workdir
WORKDIR /app

# Copy app source
COPY . /app
COPY ./config/kubernetes.json /app/config

# Install npm package
RUN apk add git
COPY package.json /app
RUN mkdir /app/data
RUN npm install

# Set Environment
ENV NODE_ENV=kubernetes

EXPOSE 80

#CMD ["/bin/sh", "startup.sh"]
CMD ["node", "app.js"]
