import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as cf from "@aws-cdk/aws-cloudfront";
import * as route53 from "@aws-cdk/aws-route53";
import * as acm from "@aws-cdk/aws-certificatemanager";
import * as cloudwatch from "@aws-cdk/aws-cloudwatch";
import * as targets from "@aws-cdk/aws-route53-targets";

export interface FrontendStackProps extends cdk.StackProps {
  domainName: string;
  siteSubDomain: string;
}

export class FrontendStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: FrontendStackProps) {
    super(scope, id, props);
    // The domain must be configured in Route 53 as a hosted zone prior to deployment
    const siteDomain =
      (props.siteSubDomain ? props.siteSubDomain + "." : "") + props.domainName;
    const zone = route53.HostedZone.fromLookup(this, "Zone", {
      domainName: props.domainName,
    });

    // Create identity that will be used in cloudfront
    const oai = new cf.OriginAccessIdentity(
      this,
      `CloudFrontOriginAccessIdentity`,
      {
        comment: `OAI for ${id}`,
      }
    );

    // Create S3 bucket to hold static site
    const hostingBucket = new s3.Bucket(this, "Static hosting bucket", {
      bucketName: siteDomain,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Grant access to cloudfront identity
    hostingBucket.grantRead(oai);

    // TLS certificate
    const certificateArn = new acm.DnsValidatedCertificate(
      this,
      "FrontendCertificate",
      {
        domainName: siteDomain,
        hostedZone: zone,
        region: "us-east-1", // Cloudfront only checks us-east-1 region for certificates.
      }
    ).certificateArn;

    // Specifies you want viewers to use HTTPS & TLS v1.1 to request your objects
    const viewerCertificate = cf.ViewerCertificate.fromAcmCertificate(
      {
        certificateArn: certificateArn,
        env: {
          region: props.env!.region!,
          account: props.env!.account!,
        },
        node: this.node,
        stack: this,
        metricDaysToExpiry: () =>
          new cloudwatch.Metric({
            namespace: "TLS Viewer Certificate Validity",
            metricName: "TLS Viewer Certificate Expired",
          }),
      },
      {
        sslMethod: cf.SSLMethod.SNI,
        securityPolicy: cf.SecurityPolicyProtocol.TLS_V1_1_2016,
        aliases: [siteDomain],
      }
    );

    // Create cloudfront distribution
    const distribution = new cf.CloudFrontWebDistribution(
      this,
      "StaticSiteDistribution",
      {
        viewerCertificate,
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: hostingBucket,
              originAccessIdentity: oai,
            },
            behaviors: [
              {
                isDefaultBehavior: true,
                compress: true,
                allowedMethods: cf.CloudFrontAllowedMethods.GET_HEAD_OPTIONS,
              },
            ],
          },
        ],
        errorConfigurations: [
          {
            errorCode: 404,
            responseCode: 200,
            responsePagePath: "/index.html",
          },
          {
            errorCode: 403,
            responseCode: 200,
            responsePagePath: "/index.html",
          },
        ],
      }
    );

    // Route53 alias record for the CloudFront distribution
    new route53.ARecord(this, "SiteAliasRecord", {
      recordName: siteDomain,
      target: route53.RecordTarget.fromAlias(
        new targets.CloudFrontTarget(distribution)
      ),
      zone,
    });

    // Output useful stuff to file
    new cdk.CfnOutput(this, "Site", {
      value: `https://${siteDomain}`,
    });
    new cdk.CfnOutput(this, "Bucket", {
      value: hostingBucket.bucketName,
    });
    new cdk.CfnOutput(this, "DistributionId", {
      value: distribution.distributionId,
    });
    new cdk.CfnOutput(this, "Certificate", { value: certificateArn });
  }
}
