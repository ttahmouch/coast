# Docker 0.7.6
# Image hapi/base

FROM ubuntu:latest
MAINTAINER Tony J. Tahmouch <tony@hapi.co>

# Install Git and SSH
RUN apt-get update && \
    apt-get install -q -y git \
                          openssh-server \
                          make

# Create Git Shell User
RUN groupadd git && \
    useradd --gid git \
            --shell /usr/bin/git-shell \
            --home /home/git \
            --create-home \
            git

# Prepare SSH
ADD ssh/sshd_config.awk /etc/ssh/
RUN mkdir -p /var/run/sshd && \
    mkdir -p /home/git/.ssh && \
    touch /home/git/.ssh/authorized_keys && \
    chgrp git /home/git/.ssh/authorized_keys && \
    chmod g+rw /home/git/.ssh/authorized_keys && \
    cp /etc/ssh/sshd_config /etc/ssh/sshd_config.old && \
    chmod a-w /etc/ssh/sshd_config.old && \
    cat /etc/ssh/sshd_config.old | awk -f /etc/ssh/sshd_config.awk > /etc/ssh/sshd_config
EXPOSE 22

# Prepare Git
ADD git-shell-commands/ /home/git/git-shell-commands/
ADD hooks/ /home/git/.git-templates/hooks/
RUN git config --global init.templatedir '/home/git/.git-templates' && \
    git --bare init /home/git/app.git && \
    chgrp -hR git /home/git/app.git && \
    chmod -R g+rwx /home/git/app.git

# Bootstrap
ADD bin/ /opt/bin/
CMD "/opt/bin/entry"
