FROM node:8.12.0-alpine

MAINTAINER I2G

# Set workdir
WORKDIR /app

# Copy app source
COPY . /app

# Install npm package
COPY package.json /app
RUN npm install

# Set Environment
ENV NODE_ENV=production

EXPOSE 80

CMD ["node", "app.js"]
