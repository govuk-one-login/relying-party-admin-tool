FROM node:24.22.1-alpine3.24@sha256:06d7adf3e0ef61a13f1d28682726366f97a15aa1888c934d3ecec86c33918b53 as builder

WORKDIR /app

COPY . .

RUN apk add --no-cache git && npm run install-all && npm run build && npm ci --omit=dev

FROM node:24.22.1-alpine3.24@sha256:06d7adf3e0ef61a13f1d28682726366f97a15aa1888c934d3ecec86c33918b53 as final

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
