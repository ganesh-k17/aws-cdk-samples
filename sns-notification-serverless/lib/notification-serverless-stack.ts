import { Stack, StackProps, Duration } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as sns from "aws-cdk-lib/aws-sns";
import * as subscriptions from "aws-cdk-lib/aws-sns-subscriptions";
import * as eventsources from "aws-cdk-lib/aws-lambda-event-sources";

interface NotificationServerlessStackProps extends StackProps {
  account: string;
  region: string;
  snsRegions: string[];
}

export class NotificationServerlessStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props: NotificationServerlessStackProps
  ) {
    super(scope, id, props);

    //SQS queue for Cloudwatch Alerts
    const notification_queue = new sqs.Queue(this, "notification_queue", {
      visibilityTimeout: Duration.minutes(5),
      queueName: "notification_queue",
    });

    props.snsRegions.forEach((snsRegion) => {
      let sns_notification_topic = sns.Topic.fromTopicArn(
        this,
        `sns_notification_topic_${snsRegion}`,
        "arn:aws:sns:" +
          snsRegion +
          ":" +
          props.account +
          ":sns_notification_topic"
      );
      sns_notification_topic.addSubscription(
        new subscriptions.SqsSubscription(notification_queue, {})
      );
    });

    const sns_cur2_handler = new lambda.Function(this, "NotificationHandler", {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset("resources/sqs-notification"),
      handler: "handler.main",
      functionName: "Sqs-Notification-Handler",
      timeout: Duration.minutes(5),
      environment: {
        REGION: props.region,
      },
    });

    sns_cur2_handler.addEventSource(
      new eventsources.SqsEventSource(notification_queue)
    );
  }
}
