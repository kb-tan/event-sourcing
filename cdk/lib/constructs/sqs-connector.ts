import { Duration } from 'aws-cdk-lib';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';
import { BaseConnector, BaseConnectorProps } from './base-connector';
import { SqsQueue} from 'aws-cdk-lib/aws-events-targets';

export interface SQSConnectorProps extends BaseConnectorProps {
}

export class SQSConnector extends BaseConnector {
    constructor(scope: Construct, id: string, props: SQSConnectorProps) {
        super(scope, id, props);
        const targetQueue = new Queue(this, `Connector-SQS-${id}`);
        this.rule.addTarget(new SqsQueue(targetQueue, {
            deadLetterQueue: this.dlq, // Optional: add a dead letter queue
            maxEventAge: Duration.hours(2), // Optional: set the maxEventAge retry policy
            retryAttempts: 2, // Optional: set the max number of retry attempts
        }));  
    }

}