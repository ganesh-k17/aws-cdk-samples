import { Stack, StackProps, Duration } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as sns from "aws-cdk-lib/aws-sns";
// import * as iam from "aws-cdk-lib/aws-iam";
// import * as ssm from "aws-cdk-lib/aws-ssm";
import * as subscriptions from "aws-cdk-lib/aws-sns-subscriptions";
import * as eventsources from "aws-cdk-lib/aws-lambda-event-sources";
import * as s3 from "aws-cdk-lib/aws-s3";
import { aws_s3_notifications } from "aws-cdk-lib";
import { S3ToSns } from "@aws-solutions-constructs/aws-s3-sns";

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

    // //Workflow Lambda Policy and Attachment (This is for if the lambda needs any of the activities/)
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

    const bucket = new s3.Bucket(this, "sns-notification-bucket");

    // Subscribe the S3 bucket to the SNS topic
    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new aws_s3_notifications.SnsDestination(sns_notification_topic)
    );

    //**This would create s3 and sns automatically (but all with new resources.) */
    // new S3ToSns(this, "S3ToSNSPattern", {
    //   bucketProps: {
    //     bucketName: bucket.bucketName,
    //   },
    //   topicProps: {
    //     topicName: "sns-notification-topic",
    //   },
    // });
  }
}
