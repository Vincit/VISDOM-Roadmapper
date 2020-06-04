FROM node:12.16.3
WORKDIR /server
ENV PATH /server/node_modules/.bin:$PATH

COPY package.json ./
COPY yarn.lock ./

RUN yarn

COPY . ./

CMD ["yarn", "start"]

