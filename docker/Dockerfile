FROM node:18-alpine

ARG CHATIK_VERSION=0.1.0

LABEL org.opencontainers.image.title "Official Chatik image"
LABEL org.opencontainers.image.description "Official Docker image for Chatik."
LABEL org.opencontainers.image.authors "Chatik"
LABEL org.opencontainers.image.url "https://github.com/DrDoof/Chatik"
LABEL org.opencontainers.image.source "https://github.com/DrDoof/Chatik"
LABEL org.opencontainers.image.version "${CHATIK_VERSION}"
LABEL org.opencontainers.image.licenses "MIT"

ENV NODE_ENV production

ENV THELOUNGE_HOME "/var/opt/thelounge"
VOLUME "${THELOUNGE_HOME}"

# Expose HTTP.
ENV PORT 9000
EXPOSE ${PORT}

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["thelounge", "start"]

COPY docker/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

# Install thelounge.
RUN apk --update --no-cache --virtual build-deps add python3 build-base git && \
    ln -sf python3 /usr/bin/python 

WORKDIR ${THELOUNGE_HOME}

RUN git clone --depth=1 https://github.com/DrDoof/Chatik.git . && \
    yarn add npm-run-all webpack webpack-cli typescript --dev && \
    yarn add ts-node @babel/register @babel/core esbuild-register sucrase @swc/register --dev && \
    yarn add webpack webpack-cli copy-webpack-plugin fork-ts-checker-webpack-plugin mini-css-extract-plugin vue-loader --dev && \
    yarn install --frozen-lockfile && \
    yarn build && \
    yarn cache clean
#    yarn --non-interactive --frozen-lockfile global add thelounge@${THELOUNGE_VERSION} && \
#    yarn --non-interactive cache clean && \

RUN  apk del --purge build-deps && \
    rm -rf /root/.cache /tmp /usr/bin/python
