FROM node:12.16.3
WORKDIR /server

COPY package.json ./
COPY yarn.lock ./

RUN yarn

COPY . ./

ENV SERVER_PORT=5000
EXPOSE 5000

CMD ["yarn", "start-prod"]

