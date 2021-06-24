FROM node:14
WORKDIR /server
EXPOSE 8080

COPY package.json ./
COPY yarn.lock ./

RUN yarn

COPY . ./

CMD ["yarn", "start-prod"]

