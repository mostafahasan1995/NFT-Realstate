# ---- Build ----
FROM node:18-alpine AS build
ARG DIST=.

# OS deps
RUN apk add --update --no-cache --virtual .gyp \
        dumb-init \
        python3 \
        make \
        g++

# Folder structure
WORKDIR /home/node/app

# App deps
COPY package*.json *yarn* nx.json ./
RUN npm install -g nx
RUN npm install

# App
COPY . $DIST

# Build the application
RUN nx run api:build

# ---- Release ----
FROM node:18-alpine AS release
ARG DIST=.
ARG PORT=3333
ENV NODE_ENV production

# OS deps
RUN apk add --update --no-cache dumb-init

WORKDIR /home/node/app

# App
COPY --from=build /home/node/app .

ENV APP_PATH="$DIST/main.js $PORT"
CMD ["dumb-init", "node", "./dist/apps/api/main.js"]
