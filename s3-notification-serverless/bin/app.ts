import * as cdk from "aws-cdk-lib";
import { S3NotificationServerless } from "../lib/s3-notification-serverless-stack";

const region = process.env.CDK_DEFAULT_REGION ?? "us-east-1";
const account = process.env.CDK_DEFAULT_ACCOUNT ?? "12121212121";

const env = {
  account: account,
  region: region,
};

const app = new cdk.App();

new S3NotificationServerless(app, "s3-notification-serverless", {
  env: env,
  account: account,
  region: region,
});
