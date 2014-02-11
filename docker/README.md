# Introduction

The intention of this project is to create Dockerfiles that prepare Docker images for Heroku-style Git application
deployment. The current base use case includes NodeJS application deployment.

## Layout

- image/base/Dockerfile is a simple Dockerfile for an image with Git and SSHD prepackaged.
- image/base/bin/entry is an entry point, bourne shell script for a running Docker container. It's purpose is to allow
  for the injection of an SSH Public Key into a container to allow for SSH authention without password. It starts the
  SSH Daemon.
- image/base/git-shell-commands/ is a directory of bourne shell scripts that the git user has access to from the
  git-shell when they are logged in with SSH Public Key Authentication.
- image/base/git-shell-commands/git allows the git user to create git bare remotes with git --add <project.git> and list
  all created remotes with git --list.c
- image/base/git-shell-commands/help allows the git user to see what commands are allowed in the git-shell.
- image/base/git-shell-commands/key allows the git user to add more SSH (D)RSA Public Keys to the containers with
  key --add <public key>
- image/base/hooks/ is a directory of Git Hooks that every git bare remote will have packaged.
- image/base/hooks/post-receive is a bourne shell script that checks out the bare git remote into a temporary directory,
  and invokes Make at the root of the directory. It is assumed that all projects pushed to the default remote use Make
  as their deployment system to keep things platform-agnostic.
- image/base/ssh is a directory that contains an AWK script for modifying the SSH Daemon configuration to make SSH more
  secure.
- image/base/ssh/sshd_config.awk changes the default, Ubuntu configuration with things such as turning off root login,
  turning off password authentication, turning off TCP/X11 forwarding, allowing only users in the git group to login,
  and setting the log level to VERBOSE.
- image/base/ssh/sshd_config.man is just a verbose man page that describes all keywords meant to be used in the SSH
  Daemon configuration file.
- image/node/Dockerfile is a simple Dockerfile for an image that extends the base image with NodeJS runtime additions.
- image/Makefile is a simple Make wrapper for basic Docker commands. The images may be built simply by invoking
  "make build n=base" or "make build n=node" and they may be run with "make run n=base" or "make run n=node".
  However, realistic run commands would look something like 'make run n=node r="-d -p 2222:22 -e SSHKEY='ssh-rsa ...'"'.
