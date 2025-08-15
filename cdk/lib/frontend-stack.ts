import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as path from 'path';
import * as fs from 'fs';
import { Distribution, ViewerProtocolPolicy, OriginAccessIdentity } from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { Construct } from 'constructs';
import { CfnOutput, RemovalPolicy } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';

export class FrontendStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const websiteBucket = new s3.Bucket(this, 'paycom-lunch-reviews-frontent', {
            autoDeleteObjects: true,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: RemovalPolicy.DESTROY
        });

        const originAccessIdentity = new OriginAccessIdentity(this, 'OAI', {
            comment: `OAI for ${id}`
        });

        websiteBucket.addToResourcePolicy(new iam.PolicyStatement({
            actions: ['s3:GetObject', 's3:ListBucket'],
            resources: [websiteBucket.arnForObjects('*'), websiteBucket.bucketArn],
            principals: [new iam.CanonicalUserPrincipal(originAccessIdentity.cloudFrontOriginAccessIdentityS3CanonicalUserId)]
        }));

        const distribution = new Distribution(this, 'CloudfrontDistribution', {
            defaultBehavior: {
                origin: new S3Origin(websiteBucket, {
                    originAccessIdentity,
                    originPath: '',
                }),
                viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            },
            defaultRootObject: 'index.html',
            errorResponses: [
                {
                    httpStatus: 404,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html',
                }
            ]
        });

        const assetsPath = path.join(__dirname, '../assets/');
        if (fs.existsSync(assetsPath)) {
            new s3deploy.BucketDeployment(this, 'DeployWebsite', {
                sources: [s3deploy.Source.asset(assetsPath)],
                destinationBucket: websiteBucket,
                distribution,
                distributionPaths: ['/*']
            })
        }

        new CfnOutput(this, 'CloudFrontURL', {
            value: distribution.domainName,
            description: 'The distribution URL',
            exportName: 'CloudfrontURL',
        });

        new CfnOutput(this, 'BucketName', {
            value: websiteBucket.bucketName,
            description: 'The name of the S3 bucket',
            exportName: 'BucketName',
        });
    }
}