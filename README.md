
# VISDOM Roadmapper

VISDOM Roadmap planning and visualization tool helps the project’s product
owner (PO) to visualize business value impact of added future features, and
ease planning of the upcoming product version. VISDOM roadmap visualizations
are based on expert evaluations and collaboration, so that the chosen roadmap
always represents authentic wishes and needs for the product.

# Local development & testing

[Docker](https://docs.docker.com/get-docker/) is recommended for running a
local postgres database.



1. Set up environment variables for frontend and backend. Create
   **/server/.env** and **/frontend/.env** files, and consult
   **server/dotenv.example** and **frontend/dotenv.example** respectively as
   examples.

2. Install yarn (`npm install --global yarn `) and install required packages
   by simply running `yarn` in **/frontend** and **/backend** respectively.

3. Start your development database by running the following steps in **/server**:
    - `yarn start-db` to start the database service
    - optionally, `yarn seed-db` to use test data from `src/seeds/testdata.ts`

4. Start your backend by running `yarn start` in **/server**

5. Start your front-end by running `yarn start` in **/frontend**

6. Front end should now be available in `http://localhost:3000` and backend in
   `http://localhost:5000`



# Deployment

An AWS CDK deployment script can be found in the **/deployment** folder. AWS
CLI is required to deploy this template. [Instructions for setting up AWS
CLI.](https://docs.aws.amazon.com/cdk/latest/guide/work-with.html#work-with-prerequisites)

1. Acquire and set up a hosted zone for your desired domain in AWS Route 53

2. Set up AWS Simple Email Service (SES) in your region.

3.
    Create a key-value secret in AWS Secrets Manager with your backend
    environment variables. To reference which environment variables are
    needed, consult **server/dotenv.example** .

    **The variabes `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`,
    are only needed in local testing to access AWS SES.**

4. Edit **deployment/bin/deployment.ts** variables to deploy to your desired
   AWS region, domain & subdomain, and enter your backend environment
   variables secret ARN that was created in step 2. Optionally change names,
   scaling limits, instance types etc. that are configured for AWS services in
   **deployment/lib/backend-stack.ts**

5. Run `cdk diff` to confirm the changes your deployment is going to cause,
   and run `cdk deploy --all` to begin deployment

6. The AWS CodeDeploy should now receive backend deployments for example via
   the AWS CLI command:
   ```console
   aws deploy create-deployment \
     --application-name BackendCodeDeploy \
     --deployment-group-name BackendDeploymentGroup \
     --github-location repository=${{ github.repository }},commitId=${{ github.sha }}
   ```
   Frontend deployments are done by syncing the static build
   to the s3 hosting bucket (edit in the name used for your bucket / domain
   name)
   ```console
   aws s3 sync ./frontend/build/ s3://test.roadmapper.vincit.fi/ --delete
   ```



## Continuous integration & Continuous Delivery

The automatic testing github action is defined in
**.github/workflows/main.yml** The continuous deployment action is defined in
**.github/workflows/codedeploy-cd.yml**

CD Configuration step-by-step:

1. Edit **scripts/start_server** with your region (`AWS_REGION`), your backend
   environment variables secret name (`AWS_SECRET1_ID`) and your backend RDS
   credentials secret name (`AWS_SECRET1_ID`)

2. <br/>

    2.1. Edit the deployment trigger or branch to match the branch that
    you want to be automatically deployed. Default: `branches: [sandbox]`

    2.2. Edit **.github/workflows/codedeploy-cd.yml** step `Build & Generate
    frontend deployment package` with the desired frontend environment
    variables that get built into the static react frontend. At least
    `REACT_APP_API_BASE_URL` must be configured.

    2.3. Edit the command in step `Sync frontend files to s3 static hosting
    bucket` with your correct frontend S3 hosting bucket name.

    2.4. Edit the command in step `Execute CodeDeploy backend deployment` with
    your CodeDeploy application name and deployment group name if modified
    from the defaults during **Deployment - step 3**

3. Create an AWS IAM User with the `AmazonS3FullAccess` and
   `AWSCodeDeployRole` policies. This account is used by github to access AWS
   for the deployment. Generate programmatic access keys for the user and
   specify them in the github secrets `AWS_ACCESS_KEY_ID` and
   `AWS_SECRET_ACCESS_KEY`

4. Everything should be configured now. Pushing a commit should trigger an
   automatic deployment. Verify that everything works as it should by creating
   a push to your continuous delivery branch, and monitor your github actions
   progress as well as AWS CodeDeploy deployment status. Also test the site to
   verify configuration is correct.

# Integrations in Roadmapper

VISDOM Roadmap tool supports importing tasks from JIRA, Trello, and GitLab.
To configure a integration, navigate to the settings page of a Roadmap project 
and fill in the required data. Since the process of setting up a integration 
varies a bit for each source, the following tables detail where the required 
data can be retrieved at.

| Source | Host | Consumer & Private Key Location |
| ------ | ------ | ------ |
| JIRA | JIRA URL | Board settings |

| Source | Key Location | Consumer Key | Private Key |
| ------ | ------ | ------ | ------ |
| Trello | https://trello.com/app-key | Developer API Key | OAuth Secret |

| Source | Project ID | Key Location | Consumer Key | Private Key |
| ------ | ------ | ------ | ------ | ------ |
| GitLab | Top of the repository front page | Application details page | Application ID | Application Secret |

- For GitLab, an Application needs to be added for Roadmapper at 
https://gitlab.com/-/profile/applications
  - Redirect URI: `roadmapper_base_url`**/oauth/redirect**
  - Confidental: **No**
  - Scopes: **read_api**

Once keys are set up in the Roadmap tool, the integration needs to be 
authorized. Follow the instructions in the Roadmap tool for this step.

Once the integration is authorized, tasks can be imported from the source.
A board may need to be selected in the settings page, if multiple are available. 

Additionally, the source columns or labels can be mapped to the task states used
in the Roadmap tool. 
- If so, the task state is derived from the configuration when importing tasks. 
However, the Roadmap tool only updates task states that have progressed. For 
example, if imported task’s state is "in progress" and the source’s has been 
moved back to "not started", the state will remain in "in progress" on a 
re-import.
