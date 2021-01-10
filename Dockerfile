#this version use the binary so nothing else is needed
#alpine won't work without a trick, more details here: https://github.com/vercel/pkg/issues/726
FROM ubuntu

# Create app directory
WORKDIR /usr/src/app

# Install app binaries
COPY ./binaries/* ./

EXPOSE 3000
CMD ./ws-monitoring --oc 1