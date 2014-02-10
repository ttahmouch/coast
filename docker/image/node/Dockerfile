# Docker 0.7.6
# Image hapi/node

FROM hapi/base
MAINTAINER Tony J. Tahmouch <tony@hapi.co>

# Install NodeJS and Dependencies
RUN apt-get update && \
    apt-get install -q -y python-software-properties \
                          software-properties-common \
                          python \
                          g++ \
                          make && \
    add-apt-repository ppa:chris-lea/node.js && \
    apt-get update && \
    apt-get install -q -y nodejs

# Prepare NodeJS
EXPOSE 80 443

# Bootstrap
CMD "/opt/bin/entry"
