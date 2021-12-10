#!/bin/bash
# User data for when creating a new EC2 instance for NodeJS and CodeDeploy

# Output userdata logs
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

# Download node & install with yum:
curl --silent --location https://rpm.nodesource.com/setup_14.x | bash -
yum -y install nodejs
1
npm install -g pm2
npm install -g yarn
