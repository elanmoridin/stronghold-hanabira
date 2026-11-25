# Use the official Ubuntu 24.04 LTS as a base image
FROM ubuntu:24.04@sha256:562111b88caa79c71391c0c4d3c2114a7d5c35915c20561fd893cb1e07929e6b

# Set the environment variable to prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Update the package list and install required packages
RUN apt-get update && \
    apt-get install -y gnupg curl wget

# --- Mongo DB (v8) part --- #

# Import the MongoDB public GPG key
RUN curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | \
    gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg \
    --dearmor



# Create the MongoDB source list
RUN echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/8.0 multiverse" | \
    tee /etc/apt/sources.list.d/mongodb-org-8.0.list

# Reload the local package database
RUN apt-get update

# Install the MongoDB packages
# pinned: mongodb-org follows 8.0.x patch releases deliberately (bump here)
RUN apt-get install -y mongodb-org=8.0.38 mongodb-org-database=8.0.38 mongodb-org-server=8.0.38 \
    mongodb-org-mongos=8.0.38 mongodb-org-shell=8.0.38 mongodb-org-tools=8.0.38 \
    mongodb-org-database-tools-extra=8.0.38

# vanilla Mongo 7 by default expects this dir to be present
# Create the default MongoDB data directory and ensure it's writable
RUN mkdir -p /data/db && chown -R mongodb:mongodb /data/db

# at least the log dir is handy
# Create MongoDB data and log directories
RUN mkdir -p /var/log/mongodb && \
    chown -R mongodb:mongodb /var/log/mongodb


# --- nodejs part --- #

# Node 22 LTS copied from the digest-pinned official image (was: nodesource setup_20.x | bash,
# unpinned and piped to a root shell). bookworm glibc 2.36 binaries run fine on noble (2.39).
COPY --from=node:22.23.5-bookworm-slim@sha256:be979e5523c76fa4d5ca4ebd3099078f220aa47ec39c48ad5b5df9314debd6eb /usr/local/bin/node /usr/local/bin/node
COPY --from=node:22.23.5-bookworm-slim@sha256:be979e5523c76fa4d5ca4ebd3099078f220aa47ec39c48ad5b5df9314debd6eb /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/npm
RUN ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm && \
    ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx && \
    node --version && npm --version
    
# Set working directory
WORKDIR /app
    
# Copy package.json and package-lock.json
COPY package*.json ./
    
# Install app dependencies exactly as locked (kuroshiro is locked at 1.1.2)
RUN npm ci --omit=dev --no-audit --no-fund


# Copy the Express app files to the container
COPY . .

# when we have express API listener daemonized to interact with DB
EXPOSE 8000

# start mongo, seed static data, start express server wrapper daemon
CMD ["sh", "-c", "mongod --dbpath /data/db --bind_ip_all --fork --logpath /var/log/mongodb/mongod.log && ./seed_db_wrapper.sh"]
