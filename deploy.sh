#!/bin/bash
ssh root@xxx.xxx.xxx.xxx "cd ws-monitoring && git pull && npm install && pm2 reload ws-monitoring";