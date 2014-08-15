.PHONY: all

all:
	npm install
	forever stopall
	forever start --minUptime 1000 --spinSleepTime 1000 -a -l ${HOME}/temp/log -m 5 \
            index.js --dir=api/ --debug
	forever list
