# Docker 0.10.0, build dc9c28f
# Image paasta/hapi

FROM paasta/base
MAINTAINER Tony J. Tahmouch <tony@hapi.co>

# Prepare Application
ADD ./ /root/app/
RUN su - root -c "cd app/ && \
                  rm -rfv .git/ && \
                  git init && \
                  git config user.email 'root@hapi.co' && \
                  git config user.name 'root' && \
                  git add --all && \
                  git commit -m 'Initial Commit.' && \
                  git remote add origin ${HOME}/app.git/ && \
                  git push origin master"

# Bootstrap
CMD ["/usr/bin/supervisord"]
