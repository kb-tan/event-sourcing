import { Code, Runtime, Function } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { CfnOutput, Duration, Resource } from "aws-cdk-lib";
import * as fs from 'fs';
import { BaseConnector, BaseConnectorProps } from "./base-connector";

export interface LambdaConnectorProps extends BaseConnectorProps {
  lambdaSourcePath: string;
}

export class LambdaConnector extends BaseConnector {


  constructor(scope: Construct, id: string, props: LambdaConnectorProps) {
    super(scope, id, props);

    const lambda = new Function(scope, `Connector-Lambda-${id}`, {
      runtime: Runtime.NODEJS_16_X,
      handler: 'index.handler',
      code: Code.fromInline(fs.readFileSync(props.lambdaSourcePath, 'utf8')),
    });
      
    this.rule.addTarget(new LambdaFunction(lambda, {
      deadLetterQueue: this.dlq,
      maxEventAge: Duration.hours(2),
      retryAttempts: 2,
    }));

    new CfnOutput(scope, `Connector-Lambda-${id}-Arn`, {
      value: lambda.functionArn,
      description: "Connector Lambda Arn"
    });
  }
}