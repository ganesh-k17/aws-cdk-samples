import * as cdk from "aws-cdk-lib";
import { NotificationServerlessStack } from "../lib/notification-serverless-stack";
import { SNSNotificationTopicStack } from "../lib/notification-topic-stack";

const region = process.env.CDK_DEFAULT_REGION ?? "us-west-2";
const account = process.env.CDK_DEFAULT_ACCOUNT ?? "121212121212";

const env = {
  account: account,
  region: region,
};

const app = new cdk.App();

const regions: string[] = ["us-east-1", "us-west-2"]; //["us-east-1", "us-west-2", "eu-west-1", "eu-west-2", "eu-west-3", "eu-north-1"];

regions.forEach((snsRegion) => {
  new SNSNotificationTopicStack(app, `NotificationSNS-${snsRegion}`, {
    env: {
      account: account,
      region: snsRegion,
    },
    account: account,
    region: snsRegion,
  });
});

new NotificationServerlessStack(app, "sns-notification-serverless", {
  env: env,
  account: account,
  region: region,
  snsRegions: regions,
});
