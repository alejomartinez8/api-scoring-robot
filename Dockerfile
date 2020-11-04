FROM node:14
WORKDIR /usr/src/scoring-app/server
COPY ./package.json ./
RUN npm install
COPY . .
EXPOSE 5050
CMD ["npm", "run", "start"]
