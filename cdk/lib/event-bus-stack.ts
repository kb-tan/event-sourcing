import { Stack, StackProps, CfnOutput, Duration, RemovalPolicy, Names } from 'aws-cdk-lib';
import { EventBus, Archive } from 'aws-cdk-lib/aws-events';
import { LambdaConnector, LambdaConnectorProps } from './constructs/lambda-connector';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from "constructs";
import { EventBusProps, IEventBus, IReplay, IConnector, ConnectorTarget } from '../../src/config';
import { SNSConnector, SNSConnectorProps } from './constructs/sns-connector';

export class EventBusStack extends Stack {
 
  public readonly eventBusName: CfnOutput;
  public readonly bucketName: CfnOutput;
  public readonly tableName: CfnOutput;
  public readonly logGroupName: CfnOutput;
  public readonly topicName: CfnOutput;
  
  constructor(scope: Construct, id: string, busProps: EventBusProps, props?: StackProps) {
    super(scope, id, props);
    const connectors:Construct[] = [];
    const archives:Archive[] = [];
    const _this = this;
    
    const logGroup = new LogGroup(this, 'EventBusLogGroup', {
      logGroupName: `/aws/events/events-${Names.uniqueId(this)}`,
      retention: RetentionDays.ONE_DAY,
      removalPolicy: RemovalPolicy.DESTROY
    });

    busProps?.eventbus.forEach((eventBus: IEventBus) => {
      const bus = new EventBus(this, `EventBus${eventBus.name}`, {
        eventBusName: `${eventBus.name}`
      });

      eventBus.replays?.forEach((replay: IReplay) => {
        console.log(replay)
        archives.push(new Archive(this, `Archive-${replay.name}`, {
          eventPattern: {
            detailType: [replay.pattern.topic],
            source: [replay.pattern.source],
          },
          sourceEventBus: bus,
          archiveName: replay.name,
          retention: Duration.days(replay.retentionDays),
        }));
      });

      eventBus.connectors?.forEach((sub: IConnector) => {
        let target;
        const connectorName = `Connector${sub.name}`
        if(sub.target === ConnectorTarget.LAMBDA) {
          new LambdaConnector(_this, connectorName, {
            name: sub.name,
            accountId: _this.account,
            detailType: sub.topic,
            eventBus: bus,
            source: sub.source,
            lambdaSourcePath: (sub.targetParams as LambdaConnectorProps).lambdaSourcePath
          });
        } else if(sub.target === ConnectorTarget.SNS) {
          const snsProps = sub.targetParams as SNSConnectorProps;
          new SNSConnector(_this, connectorName, {
            name: sub.name,
            accountId: _this.account,
            detailType: sub.topic,
            eventBus: bus,
            source: sub.source,
            protocol: snsProps.protocol,
            subscription: snsProps.subscription,
          })
        }
      }) 
    });

    busProps?.eventbus.forEach((eventBus: IEventBus, idx: number) => {
      new CfnOutput(this, `EventBusName${idx}`, {
        value: eventBus.name,
        description: 'Event bus name'
      })
    });

    // connectors.forEach((connector: Construct, idx: number) => {
    //   new CfnOutput(this, `ConnectorName${idx}`, {
    //     value: connector.node.addr,
    //     description: 'Connector arn'
    //   });
    // });

    // archives.forEach((archive:Archive) => {
    //   new CfnOutput(this, `Archive ${archive.archiveName} name`, {
    //     value: archive.archiveName,
    //     description: 'Archive name'
    //   });
    // })

  }
}