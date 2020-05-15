ARG BASE=node:lts-alpine
FROM $BASE

WORKDIR /source/onenation

COPY package*.json /source/onenation/

RUN cd /source/onenation && npm i --only=production

COPY . .

ENV PORT=8000

EXPOSE 8000
CMD ["sh", "-c", "node app.js"]