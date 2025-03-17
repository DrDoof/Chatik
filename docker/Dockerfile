FROM node:18-alpine

ARG CHATIK_VERSION=0.1.0

LABEL org.opencontainers.image.title "Official Chatik image"
LABEL org.opencontainers.image.description "Official Docker image for Chatik."
LABEL org.opencontainers.image.authors "Chatik"
LABEL org.opencontainers.image.url "https://github.com/DrDoof/Chatik"
LABEL org.opencontainers.image.source "https://github.com/DrDoof/Chatik"
LABEL org.opencontainers.image.version "${CHATIK_VERSION}"
LABEL org.opencontainers.image.licenses "MIT"

#ENV NODE_ENV production
ENV NODE_ENV=development

ENV CHATIK_HOME "/var/opt/chatik"
VOLUME "${CHATIK_HOME}"

ENV PATH="${LOUNGE_HOME}/node_modules/.bin:${PATH}"

# Expose HTTP.
ENV PORT 9000
EXPOSE ${PORT}

WORKDIR ${CHATIK_HOME}
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .

COPY docker/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

# Install Chatik.
RUN apk --update --no-cache --virtual build-deps add python3 build-base git && \
    ln -sf python3 /usr/bin/python && \
    yarn install --frozen-lockfile && \
    yarn build && \
    yarn cache clean
#    yarn --non-interactive --frozen-lockfile global add thelounge@${THELOUNGE_VERSION} && \
#    yarn --non-interactive cache clean && \

RUN  apk del --purge build-deps && \
    rm -rf /root/.cache /tmp /usr/bin/python && \
    ln -s ${CHATIK_HOME}/index.js /usr/bin/chatik

ENV NODE_ENV=production

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["chatik","start"]