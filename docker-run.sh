#!/bin/bash
docker run --rm -p 3000:3000 -v /var/run/docker.sock:/var/run/docker.sock -v /var/log/:/var/log/:ro -it elestio/ws-monitoring

#you can specify a security token like this
#docker run --rm -p 3000:3000 -e token=MyRandomString -v /var/run/docker.sock:/var/run/docker.sock -v /var/log/:/var/log/:ro -it elestio/ws-monitoring