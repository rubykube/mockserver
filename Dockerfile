FROM node:10

WORKDIR /home/node

EXPOSE 9001
EXPOSE 9002

COPY . .

RUN npm install

CMD [ "node", "src/index.js" ]
