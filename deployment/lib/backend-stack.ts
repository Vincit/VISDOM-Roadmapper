import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as iam from "@aws-cdk/aws-iam";
import * as autoscaling from "@aws-cdk/aws-autoscaling";
import * as loadbalancing from "@aws-cdk/aws-elasticloadbalancingv2";
import * as codedeploy from "@aws-cdk/aws-codedeploy";
import * as route53 from "@aws-cdk/aws-route53";
import * as targets from "@aws-cdk/aws-route53-targets";
import * as acm from "@aws-cdk/aws-certificatemanager";
import * as fs from "fs";
import * as secretsmanager from "@aws-cdk/aws-secretsmanager";
import * as rds from "@aws-cdk/aws-rds";

export interface BackendStackProps extends cdk.StackProps {
  domainName: string;
  siteSubDomain: string;
  envVarsSecretARN: string;
}

export class BackendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: BackendStackProps) {
    super(scope, id, props);
    // The domain must be configured in Route 53 as a hosted zone prior to deployment
    const siteDomain =
      (props.siteSubDomain ? props.siteSubDomain + "." : "") + props.domainName;
    const zone = route53.HostedZone.fromLookup(this, "Zone", {
      domainName: props.domainName,
    });

    // Create new VPC with 2 Subnets
    const vpc = new ec2.Vpc(this, "VPC", {
      natGateways: 0,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "asterisk",
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });

    // Create a service role for the EC2 instances to use
    const ec2Role = new iam.Role(this, "ec2Role", {
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
    });
    ec2Role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMManagedInstanceCore")
    );
    ec2Role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3FullAccess")
    );
    ec2Role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSESFullAccess")
    );

    // Create a service role for the CodeDeploy instances to use
    const codeDeployRole = new iam.Role(this, "codeDeployRole", {
      assumedBy: new iam.ServicePrincipal("codedeploy.amazonaws.com"),
    });
    codeDeployRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSCodeDeployRole"
      )
    );

    // Security group for the load balancer
    const loadbalancerSg = new ec2.SecurityGroup(this, "loadbalancerSg", {
      vpc,
      allowAllOutbound: true,
      description: "Load Balancer Security Group",
    });
    loadbalancerSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80));
    loadbalancerSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443));

    // Security group for the ec2 instances
    const instanceSg = new ec2.SecurityGroup(this, "instanceSg", {
      vpc,
      allowAllOutbound: true,
      description: "EC2 instance security group",
    });

    // Security group for the rds database
    const databaseSg = new ec2.SecurityGroup(this, "rdsSg", {
      vpc,
      allowAllOutbound: true,
      description: "RDS database security group",
    });
    databaseSg.addIngressRule(instanceSg, ec2.Port.allTraffic());

    // Allow incoming traffic from load balancer security group
    instanceSg.addIngressRule(loadbalancerSg, ec2.Port.tcp(80));

    // Allow SSH access on EC2 instances
    instanceSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22));

    // Create a machine image to use in new EC2 instances
    const machineImage = new ec2.AmazonLinuxImage({
      generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      cpuType: ec2.AmazonLinuxCpuType.X86_64,
    });

    // Auto scaling group
    const asg = new autoscaling.AutoScalingGroup(this, "BackendASG", {
      vpc,
      machineImage,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MICRO
      ),
      maxCapacity: 1,
      minCapacity: 1,
      role: ec2Role,
      securityGroup: instanceSg,
    });

    // Add user_data.sh to run when new instances are created
    const bootScript = fs.readFileSync("assets/user_data.sh", "utf-8");
    asg.addUserData(bootScript);

    // TLS certificate
    const certificateArn = new acm.DnsValidatedCertificate(
      this,
      "BackendCertificate",
      {
        domainName: siteDomain,
        hostedZone: zone,
        region: this.region,
      }
    ).certificateArn;

    // Application load balancer
    const loadBalancer = new loadbalancing.ApplicationLoadBalancer(
      this,
      "BackendLoadbalancer",
      {
        vpc,
        securityGroup: loadbalancerSg,
        internetFacing: true,
      }
    );

    // Load balancer target group pointed at our auto scaling group
    const targetGroup = new loadbalancing.ApplicationTargetGroup(
      this,
      "lbTargetGroup",
      {
        vpc,
        targetGroupName: "EC2TargetGroup",
        protocol: loadbalancing.ApplicationProtocol.HTTP,
        port: 80,
        loadBalancingAlgorithmType:
          loadbalancing.TargetGroupLoadBalancingAlgorithmType.ROUND_ROBIN,
        healthCheck: {
          enabled: true,
        },
        targets: [asg],
      }
    );

    // Load balancer listeners
    const httpsListener = loadBalancer.addListener("lbHttpsListener", {
      protocol: loadbalancing.ApplicationProtocol.HTTPS,
      port: 443,
      open: true,
      certificates: [
        {
          certificateArn,
        },
      ],
      sslPolicy: loadbalancing.SslPolicy.TLS11,
    });
    httpsListener.addTargetGroups("RouteToEC2TargetGroup", {
      targetGroups: [targetGroup],
    });

    // Redirect HTTP traffic to HTTPS
    loadBalancer.addRedirect({
      sourcePort: 80,
      sourceProtocol: loadbalancing.ApplicationProtocol.HTTP,
      targetPort: 443,
      targetProtocol: loadbalancing.ApplicationProtocol.HTTPS,
    });

    // Codedeploy application
    const codeDeploy = new codedeploy.ServerApplication(this, "EC2CodeDeploy", {
      applicationName: "BackendCodeDeploy",
    });

    const deploymentGroup = new codedeploy.ServerDeploymentGroup(
      this,
      "BackendDeploymentGroup",
      {
        application: codeDeploy,
        deploymentGroupName: "BackendDeploymentGroup",
        autoScalingGroups: [asg],
        installAgent: true,
        ec2InstanceTags: new codedeploy.InstanceTagSet({
          Name: ["CodeDeploy instance"],
        }),
        role: codeDeployRole,
        deploymentConfig: codedeploy.ServerDeploymentConfig.ONE_AT_A_TIME,
      }
    );

    // Route53 alias record for the CloudFront distribution
    new route53.ARecord(this, "SiteAliasRecord", {
      recordName: siteDomain,
      target: route53.RecordTarget.fromAlias(
        new targets.LoadBalancerTarget(loadBalancer)
      ),
      zone,
    });

    // Environment variables secret has to be created manually beforehand, ARN supplied via props.envVarsSecretARN
    const envVars = secretsmanager.Secret.fromSecretCompleteArn(
      this,
      "staging/backendEnvVariables",
      props.envVarsSecretARN
    );
    envVars.grantRead(ec2Role);

    // RDS Database
    const db = new rds.DatabaseInstance(this, "BackendPostgresDb", {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_11_9,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.BURSTABLE3,
        ec2.InstanceSize.MICRO
      ),
      credentials: rds.Credentials.fromGeneratedSecret("pgadmin", {
        secretName: "staging/backendRdsCredentials",
        excludeCharacters: "!&*^#@()+.?/:\\",
      }),
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC, // Important to strictly restrict access with the security group
      },
      securityGroups: [databaseSg],
      removalPolicy: cdk.RemovalPolicy.SNAPSHOT,
      storageType: rds.StorageType.IO1,
      allocatedStorage: 100,
      maxAllocatedStorage: 500,
    });
    db.secret!.grantRead(ec2Role);

    // Output useful stuff to file
    new cdk.CfnOutput(this, "CDApplicationName", {
      value: codeDeploy.applicationName,
    });
    new cdk.CfnOutput(this, "CDDeploymentGroupName", {
      value: deploymentGroup.deploymentGroupName,
    });
    new cdk.CfnOutput(this, "BackendDomain", {
      value: siteDomain,
    });
    new cdk.CfnOutput(this, "RdsCredsSecretName", {
      value: db.secret!.secretName,
    });
  }
}
