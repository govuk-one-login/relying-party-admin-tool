FROM node:24.15.0-alpine3.22@sha256:b689d4005875ae167178471a7a622ec2909459a3bbb32277260be1971af7a99f

ENV NODE_ENV "development"
ENV PORT 6001

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
COPY src src
COPY tsconfig.json tsconfig.json

RUN npm ci
RUN npm run copy-assets

WORKDIR /app

EXPOSE $PORT

CMD npm run dev
