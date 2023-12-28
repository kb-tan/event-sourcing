import { Duration } from 'aws-cdk-lib';
import { Topic, SubscriptionProtocol as proto } from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';
import { BaseConnector, BaseConnectorProps } from './base-connector';
import {
    EmailSubscription,
    EmailSubscriptionProps,
    SqsSubscription,
    SqsSubscriptionProps,
    LambdaSubscription,
    LambdaSubscriptionProps
 } from 'aws-cdk-lib/aws-sns-subscriptions';
import { LambdaFunction, SnsTopic } from 'aws-cdk-lib/aws-events-targets';


export interface SNSConnectorProps extends BaseConnectorProps {
    protocol: proto.EMAIL | proto.SQS | proto.LAMBDA;
    subscription: string;
}

export class SNSConnector extends BaseConnector {
    constructor(scope: Construct, id: string, props: SNSConnectorProps) {
        super(scope, id, props);
        const targetTopic = new Topic(this, `Connector-SNS-${id}`);

        if(proto.EMAIL === props.protocol) {
            targetTopic.addSubscription(new EmailSubscription(props.subscription));
        } else if(proto.LAMBDA === props.protocol) {
            throw new Error("Unsupported SNS type");
//            targetTopic.addSubscription(new LambdaSubscription());
        } else if(proto.SQS === props.protocol) {
            throw new Error("Unsupported SNS type");
//            targetTopic.addSubscription(new SqsSubscription());
        }

        this.rule.addTarget(new SnsTopic(targetTopic, {
            deadLetterQueue: this.dlq, // Optional: add a dead letter queue
            maxEventAge: Duration.hours(2), // Optional: set the maxEventAge retry policy
            retryAttempts: 2, // Optional: set the max number of retry attempts
        }));  
    }

}