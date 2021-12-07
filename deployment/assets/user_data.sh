#!/bin/bash
# User data for when creating a new EC2 instance for NodeJS and CodeDeploy


# Output userdata logs
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

# Install CodeDeploy agent:
yum -y update
yum install -y ruby
yum install -y aws-cli
cd /home/ec2-user
aws s3 cp s3://aws-codedeploy-us-east-2/latest/install . --region us-east-2
chmod +x ./install
./install auto

# Download node & install with yum:
curl --silent --location https://rpm.nodesource.com/setup_14.x | bash -

yum -y install nodejs
npm i cross-env -g
