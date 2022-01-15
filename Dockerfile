FROM node:14-bullseye
COPY . /
RUN yarn
EXPOSE 5000
CMD ["yarn", "server"]