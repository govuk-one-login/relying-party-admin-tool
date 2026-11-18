FROM node:24.22.2-alpine3.24@sha256:a34ab6d7f6f4813f4d0c5469d74685604b962fbdbf5793a7bc7b4998ecb867c8 as builder

WORKDIR /app

COPY . .

RUN apk add --no-cache git && npm run install-all && npm run build && npm ci --omit=dev

FROM node:24.22.2-alpine3.24@sha256:a34ab6d7f6f4813f4d0c5469d74685604b962fbdbf5793a7bc7b4998ecb867c8 as final

RUN apk add --no-cache tini
RUN apk add --no-cache curl

WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules/ node_modules
COPY --from=builder /app/dist/ dist

ENV NODE_ENV "production"
ENV PORT 6001
EXPOSE $PORT

HEALTHCHECK CMD curl --fail http://localhost:6001/healthcheck || exit 1

USER node

ENTRYPOINT ["tini", "--"]

CMD ["npm", "start"]
