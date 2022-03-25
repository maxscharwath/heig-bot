FROM node:16
WORKDIR /usr/src/app
COPY package*.json ./
COPY tsconfig.json ./
RUN yarn install
COPY ./src ./src
RUN yarn build
CMD [ "node", "./src/index.js" ]
