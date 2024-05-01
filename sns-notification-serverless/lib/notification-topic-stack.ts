import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as sns from "aws-cdk-lib/aws-sns";
import * as iam from "aws-cdk-lib/aws-iam";

interface SNSNotificationTopicProps extends StackProps {
  account: string;
  region: string;
}

export class SNSNotificationTopicStack extends Stack {
  constructor(scope: Construct, id: string, props: SNSNotificationTopicProps) {
    super(scope, id, props);

    const sns_notification_topic = new sns.Topic(
      this,
      `sns_notification_topic`,
      {
        topicName: "sns_notification_topic",
      } as sns.TopicProps
    );

    sns_notification_topic.addToResourcePolicy(
      new iam.PolicyStatement({
        sid: "s3_publish",
        effect: iam.Effect.ALLOW,
        principals: [new iam.AnyPrincipal()],
        actions: ["SNS:Publish"],
        resources: [sns_notification_topic.topicArn],
        conditions: {
          ArnLike: {
            "AWS:SourceArn": ["arn:aws:s3:*:*:*"], // It allows all the s3 bucket to subscribe this topic
          },
        },
      })
    );
  }
}
