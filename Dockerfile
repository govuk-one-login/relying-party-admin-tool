FROM node:24.15.0-alpine3.22@sha256:b689d4005875ae167178471a7a622ec2909459a3bbb32277260be1971af7a99f AS builder

WORKDIR /build

COPY tsconfig.json tsconfig.json
COPY package.json package.json
COPY package-lock.json package-lock.json
COPY src src

WORKDIR /build/src
RUN npm ci && npm run build && npm ci --omit=dev

FROM node:24.15.0-alpine3.22@sha256:b689d4005875ae167178471a7a622ec2909459a3bbb32277260be1971af7a99f AS final

WORKDIR /app

COPY --chown=node:node --from=builder /build/package*.json ./
COPY --chown=node:node --from=builder /build/node_modules/ node_modules
COPY --chown=node:node --from=builder /build/dist/ dist

RUN apk add --no-cache tini
RUN apk add --no-cache curl

ENV NODE_ENV="production"
ENV PORT=6001
EXPOSE $PORT

HEALTHCHECK CMD curl --fail http://localhost:6001/healthcheck || exit 1

USER node

ENTRYPOINT ["tini", "--"]

CMD ["npm", "start"]
