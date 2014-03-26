# Docker 0.7.6
# Image hapi/hapi

FROM hapi/node
MAINTAINER Tony J. Tahmouch <tony@hapi.co>

# Prepare Hapi
ADD ./ /home/git/app/
RUN rm -rfv /home/git/app/.git/ && \
    npm install forever -g && \
    usermod -s /bin/bash git && \
    su git -c "cd /home/git/app/ && \
               git init && \
               git config user.email 'git@hapi.co' && \
               git config user.name 'git' && \
               git add --all && \
               git commit -m 'Initial Commit.' && \
               git remote add origin /home/git/app.git/ && \
               git push origin master" && \
    usermod -s /usr/bin/git-shell git

# Bootstrap
CMD "/opt/bin/entry"
