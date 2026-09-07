# Build stage
FROM node:22.17.0-alpine AS build
RUN mkdir -p /app
WORKDIR /app

# Install tools including mysql-client
RUN apk add --update --no-cache \
    git \
    nano \
    openssh-client \
    mysql-client \
    && rm -rf /var/cache/apk/*

# Setup SSH (Bitbucket host fingerprint)
RUN mkdir -p /root/.ssh && chmod 700 /root/.ssh
COPY id_rsa /root/.ssh/id_rsa
# RUN chmod 600 /root/.ssh/id_rsa \
#     && ssh-keyscan -t rsa bitbucket.org >> /root/.ssh/known_hosts \
#     && echo "StrictHostKeyChecking no" >> /etc/ssh/ssh_config

COPY package*.json ./
RUN npm install 
COPY . .

# Production stage
FROM node:22.17.0-alpine AS production
WORKDIR /app

# Create app user
RUN addgroup -S mpuser && adduser -S mpuser -G mpuser

# Copy app from build stage
COPY --chown=mpuser:mpuser --from=build /app /app
RUN mkdir -p logs && chown -R mpuser:mpuser logs

# ✅ Install mysql-client in production stage too (optional)
RUN apk add --no-cache mysql-client

USER mpuser
EXPOSE 4000
CMD ["node", "index.js"]
