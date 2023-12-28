import { CfnOutput, Resource } from "aws-cdk-lib";
import { IEventBus, Rule } from "aws-cdk-lib/aws-events";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";

export interface BaseConnectorProps {
    accountId: string;
    detailType: string;
    source: string;
    name: string;
    eventBus: IEventBus;
}

export class BaseConnector extends Resource {

    protected readonly rule:Rule;
    protected readonly dlq:Queue;

    constructor(scope: Construct, id: string, props: BaseConnectorProps) {
        super(scope, id);
        console.log(`Connector-Rule-${id}`);
        this.rule = new Rule(scope, `Connector-Rule-${id}`, {
            eventBus: props.eventBus,
            eventPattern: {
              source: [props.source],
              detailType: [props.detailType]
            },
        });

        this.dlq = new Queue(this, 'Queue');

        new CfnOutput(scope, `Connector-Rule-${id}-Arn`, {
            value: this.rule.ruleArn,
            description: "Connector Rule Arn"
          });
    
        new CfnOutput(scope, `Connector-DLQ-${id}-Arn`, {
          value: this.dlq.queueArn,
          description: "Connector Dead Letter Queue Arn"
        });
    }

}