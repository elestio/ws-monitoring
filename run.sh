###RUN ON PORT 3000
node node_modules/@elestio/cloudgate/cloudgate.js ../../../ -p 3000

###RUN ON PORT 80 + 443 with AutoSSL
#node node_modules/@elestio/cloudgate/cloudgate.js ../../../ -p 80 --ssl --sslport 443 --ssldomain www.yourdomain.com