FROM node:14

WORKDIR /home/app

COPY . .

RUN yarn 

ENTRYPOINT [ "yarn", "start" ]

