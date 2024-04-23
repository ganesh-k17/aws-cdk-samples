import { Stack, StackProps, Duration } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as sns from "aws-cdk-lib/aws-sns";
// import * as iam from "aws-cdk-lib/aws-iam";
// import * as ssm from "aws-cdk-lib/aws-ssm";
import * as subscriptions from "aws-cdk-lib/aws-sns-subscriptions";
import * as eventsources from "aws-cdk-lib/aws-lambda-event-sources";

interface S3NotificationServerlessProps extends StackProps {
  account: string;
  region: string;
}

export class S3NotificationServerless extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props: S3NotificationServerlessProps
  ) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'AwsQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    // SNS TOPIC FOR PUBLISH
    const sns_notification_topic = new sns.Topic(
      this,
      "sns-notification-topic",
      {
        topicName: "sns-notification-topic",
      }
    );

    //SQS queue for Cloudwatch Alerts
    const sns_notification_queue = new sqs.Queue(
      this,
      "sns-notification-queue",
      {
        visibilityTimeout: Duration.minutes(5),
        queueName: "sns-notification-queue",
      }
    );

    //Subscribe queue to topic
    sns_notification_topic.addSubscription(
      new subscriptions.SqsSubscription(sns_notification_queue, {})
    );

    const sns_notification_handler = new lambda.Function(
      this,
      "SnsnotificationHandler",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset("handlers/sns-notification"),
        handler: "handler.main",
        functionName: "Notification-SNS-Handler",
        timeout: Duration.minutes(5),
        environment: {
          REGION: props.region,
        },
      }
    );

    // //Workflow Lambda Policy and Attachment
    // const sns_notification_policy = new iam.PolicyStatement({
    //   actions: [
    //     "ssm:GetParameter",
    //     "s3:PutObject",
    //     "dynamodb:Query",
    //     "dynamodb:PutItem",
    //     "dynamodb:DeleteItem",
    //     "dynamodb:Scan",
    //     "secretsmanager:GetSecretValue",
    //   ],
    //   resources: ["*"],
    // });

    // sns_notification_handler.role?.attachInlinePolicy(
    //   new iam.Policy(this, "sns-comrade-workflow-policy", {
    //     statements: [sns_notification_policy],
    //   })
    // );

    sns_notification_handler.addEventSource(
      new eventsources.SqsEventSource(sns_notification_queue)
    );
  }
}

// import * as cdk from 'aws-cdk-lib';
// import { Construct } from 'constructs';
// // import * as sqs from 'aws-cdk-lib/aws-sqs';

// export class S3NotificationServerlessStack extends cdk.Stack {
//   constructor(scope: Construct, id: string, props?: cdk.StackProps) {
//     super(scope, id, props);

//     // The code that defines your stack goes here

//     // example resource
//     // const queue = new sqs.Queue(this, 'S3NotificationServerlessQueue', {
//     //   visibilityTimeout: cdk.Duration.seconds(300)
//     // });
//   }
// }
