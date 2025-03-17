#!/bin/sh

if [ "$1" = "chatik" ] && [ "$(id -u)" = '0' ]; then
    find "${CHATIK_HOME}" \! -user node -exec chown node '{}' +
    exec su node -c "$*"
fi

exec "$@"
