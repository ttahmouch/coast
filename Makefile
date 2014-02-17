.PHONY: all

all:
	npm install
	forever stopall
	forever start --minUptime 1000 --spinSleepTime 1000 index.js --hapi=api/api.js --port=8080
	forever list
