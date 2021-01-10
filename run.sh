#!/bin/bash

###RUN ON PORT 3000
node index.js -r . -p 3000 --oc 1

###RUN ON PORT 80 + 443 with AutoSSL
#node index.js -r . --oc 1 -p 80 --ssl --sslport 443 --ssldomain www.yourdomain.com