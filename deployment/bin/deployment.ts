#!/usr/bin/env node

import { FrontendStack } from "./../lib/frontend-stack";
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { BackendStack } from "../lib/backend-stack";

/* If you don't specify 'env', this stack will be environment-agnostic.
 * Account/Region-dependent features and context lookups will not work,
 * but a single synthesized template can be deployed anywhere. */
/* Uncomment the next line to specialize this stack for the AWS Account
 * and Region that are implied by the current CLI configuration. */
// env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
/* Uncomment the next line if you know exactly what Account and Region you
 * want to deploy the stack to. */
// env: { account: '123456789012', region: 'us-east-1' },
/* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: "eu-central-1",
};

const app = new cdk.App();
new BackendStack(app, "BackendStack", {
  env,
  domainName: "roadmapper.vincit.fi",
  siteSubDomain: "api.test",
  envVarsSecretARN:
    "arn:aws:secretsmanager:eu-central-1:700730411200:secret:staging/backendEnvVariables-bVfwWm",
});

new FrontendStack(app, "FrontendStack", {
  env,
  domainName: "roadmapper.vincit.fi",
  siteSubDomain: "test",
});
