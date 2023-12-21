import * as cdk from 'aws-cdk-lib/core';
import { EventBus, Rule, CfnRule, RuleTargetInput, EventField } from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { LambdaConnector } from './constructs/lambda-connector';
import { CfnOutput } from 'aws-cdk-lib/core';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { Construct } from "constructs";
import { EventBusProps, SubscriptionProps, IEventBus } from '../../src/config';

interface EventBusStackProps extends cdk.StackProps, EventBusProps, SubscriptionProps  {
}

export class EventBusStack extends cdk.Stack {
  
  public readonly eventBusName: CfnOutput;
  public readonly bucketName: CfnOutput;
  public readonly tableName: CfnOutput;
  public readonly logGroupName: CfnOutput;
  public readonly topicName: CfnOutput;
  
  constructor(scope: Construct, id: string, props?: EventBusStackProps) {
    super(scope, id, props);
    const prefix = props?.env;

    // step functions state machine target
    // const stateMachineTarget = new LambdaConnector(this, 'Target', {
    //   logicalEnv: prefix!,
    //   accountId: this.account
    // });

    // cloudwatch log group target
    const logGroup = new LogGroup(this, 'EventbussLogGroup', {
      logGroupName: `/aws/events/${prefix}-events`,
      retention: RetentionDays.ONE_DAY
    });

    // // sns topic
    // const topic = new Topic(this, 'DeletedEntitiesTopic', {
    //   topicName: `${prefix}-deleted-entities`
    // });

    props?.eventbus.forEach((eventBus: IEventBus) => {
       const bus = new EventBus(this, 'EventBus', {
        eventBusName: `${prefix}-${eventBus.name}-event-bus`
      });

      new Rule(this, 'AllEventsBusRule', {
        name: `${prefix}-all-events-rule`,
        eventBus: bus,
        description: 'Rule matching all events',
        eventPattern: {   
          source: [{prefix: ''}]
        },
        targets: [{
          id: `${prefix}-all-events-cw-logs`,
          arn: `arn:aws:logs:${logGroup.stack.region}:${logGroup.stack.account}:log-group:${logGroup.logGroupName}`
        }]
      });
    });


    // rule with step function state machine as a target
    // const eventsRule = new Rule(this, 'EeventsBusRule', {
    //   ruleName: `${prefix}-events-rule`,
    //   description: 'Rule matching events',
    //   eventBus: bus,
    //   eventPattern: {      
    //     detailType: ['Object State Change']
    //   }
    // });

    // eventsRule.addTarget(new targets.SfnStateMachine(stateMachineTarget.stateMachine));

    // rule with cloudwatch log group as a target
    // (using CFN as L2 constructor doesn't allow prefix expressions)


    // rule for deleted entities
    // const deletedEntitiesRule = new Rule(this, 'DeletedEntitiesBusRule', {
    //   ruleName: `${prefix}-deleted-entities-rule`,
    //   description: 'Rule matching events for delete operations',
    //   eventBus: bus,
    //   eventPattern: {      
    //     detailType: ['Object State Change'],
    //     detail: {
    //       operation: ['delete']
    //     }
    //   }
    // });

    // deletedEntitiesRule.addTarget(new targets.SnsTopic(topic, {
    //   message: RuleTargetInput.fromText(
    //     `Entity with id ${EventField.fromPath('$.detail.entity-id')} has been deleted by ${EventField.fromPath('$.detail.author')}`
    //   )
    // }));

    // outputs
    // this.eventBusName = new CfnOutput(this, 'EventBusName', {
    //   value: bus.eventBusName,
    //   description: 'Name of the bus created for events'
    // });

    // this.bucketName = new CfnOutput(this, 'BucketName', {
    //   value: stateMachineTarget.bucket.bucketName,
    //   description: 'Name of the bucket created to store the content of events'
    // });

    // this.tableName = new CfnOutput(this, 'TableName', {
    //   value: stateMachineTarget.table.tableName,
    //   description: 'Name of the table created to store events'
    // });

    // this.logGroupName = new CfnOutput(this, 'LogGroupName', {
    //   value: logGroup.logGroupName,
    //   description: 'Name of the log group created to store all events'
    // });

    // this.topicName = new CfnOutput(this, 'TopicName', {
    //   value: topic.topicName,
    //   description: 'Name of the topic created to publish deleted entities events to'
    // });
  }
}