# Docker 0.7.6

FROM ubuntu:latest
MAINTAINER Tony J. Tahmouch <tony@hapi.co>

# Install NodeJS Dependencies, NodeJS, Git, and SSH
RUN apt-get update
RUN apt-get install -q -y python-software-properties software-properties-common python g++ make
RUN add-apt-repository ppa:chris-lea/node.js
RUN apt-get update
RUN apt-get install -q -y nodejs git openssh-server

# Create Git User with Git Shell
RUN groupadd git
RUN useradd --gid git --shell /usr/bin/git-shell --home /home/git --create-home git

# Bootstrap Git Remote and SSH
ADD etc/ssh/sshd_config.awk /etc/ssh/
ADD git-shell-commands/ /home/git/git-shell-commands/
ADD bin/ /opt/bin/
RUN git --bare init /home/git/default.git
RUN mkdir -p /var/run/sshd && mkdir -p /home/git/.ssh && touch /home/git/.ssh/authorized_keys
RUN cp /etc/ssh/sshd_config /etc/ssh/sshd_config.old && chmod a-w /etc/ssh/sshd_config.old
RUN cat /etc/ssh/sshd_config.old | awk -f /etc/ssh/sshd_config.awk > /etc/ssh/sshd_config
EXPOSE 22

CMD "/opt/bin/entry"
