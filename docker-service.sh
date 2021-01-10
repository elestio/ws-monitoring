#!/bin/bash
docker run -d --restart always --name ws-monitoring -p 3000:3000 -v /var/run/docker.sock:/var/run/docker.sock -it elestio/ws-monitoring