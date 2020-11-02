FROM node:14
WORKDIR /scoring-app/server
COPY ./package.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "run", "start"]
