FROM node:8.12.0

MAINTAINER I2G

# Set workdir
WORKDIR /app
# Copy app source
COPY . /app
RUN mkdir -p /opt/data /opt/wi-backend/wi-images /opt/wi-backend/server/export/exported-files /tmp/wiLog /opt/uploads
# Install npm package
COPY package.json /app
RUN npm install

# Set Environment
ENV NODE_ENV=kubernetes

EXPOSE 3000

CMD ["node", "app.js"]
