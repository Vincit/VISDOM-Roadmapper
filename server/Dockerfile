FROM node:12.16.3
WORKDIR /server

COPY package.json ./
COPY yarn.lock ./

RUN yarn

COPY . ./

CMD ["yarn", "start"]

