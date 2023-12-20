import { Code, Runtime, Function } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { EventPattern, Rule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Duration } from "aws-cdk-lib/core";
import { Queue } from "aws-cdk-lib/aws-sqs";


export interface LambdaConnectorProps {
  logicalEnv: string;
  accountId: string;
  eventType: string;
  pattern: EventPattern;
}

const lambdaCode = (eventType: string) => (`export const handler = function(event, context, callback) {
    console.log("Received event: ", event);
    const busEvent = event as ${eventType};
    callback(null, busEvent);
 }`);

export class LambdaConnector extends Construct {

  public readonly lambda: Function;

  constructor(scope: Construct, id: string, props: LambdaConnectorProps) {
    super(scope, id);
    const prefix = props.logicalEnv;

    this.lambda = new Function(this, 'connector', {
      functionName: `${prefix}-connector-${props.eventType}`,
      runtime: Runtime.NODEJS_16_X,
      handler: 'index.handler',
      code: Code.fromInline(lambdaCode(props.eventType)),
    });

    const rule = new Rule(this, 'connector-rule', {
        eventPattern: {
          source: props.pattern.source,
          detailType: props.pattern.detailType
        },
      });
      
      const dlq = new Queue(this, 'Queue');
      
      rule.addTarget(new LambdaFunction(this.lambda, {
        deadLetterQueue: dlq, // Optional: add a dead letter queue
        maxEventAge: Duration.hours(2), // Optional: set the maxEventAge retry policy
        retryAttempts: 2, // Optional: set the max number of retry attempts
      }));
  }
}