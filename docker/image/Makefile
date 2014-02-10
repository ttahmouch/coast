.PHONY: build run tty rm rmi

b = -no-cache=true -rm=true
y = -i -t
s = hapi
t = ${s}/${n}
p = ${n}/

build:
	sudo docker build ${b} -t=${t} ${p}
run:
	sudo docker run ${r} ${t}
tty:
	sudo docker run ${y} ${t} /bin/bash
rm:
	sudo docker ps -a | grep "Exit" | awk '{print $$1}' | sudo xargs docker rm
rmi:
	sudo docker images | grep "<none>" | awk '{print $$3}' | sudo xargs docker rmi
