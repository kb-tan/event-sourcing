import { Stack, StackProps, CfnOutput, Duration, RemovalPolicy, Names } from 'aws-cdk-lib';
import { EventBus, Archive } from 'aws-cdk-lib/aws-events';
import { LambdaConnector, LambdaConnectorProps } from './constructs/lambda-connector';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from "constructs";
import { EventBusProps, IEventBus, IArchive, IConnector, ConnectorTarget } from '../../src/config';
import { SNSConnector, SNSConnectorProps } from './constructs/sns-connector';
import { SQSConnector, SQSConnectorProps } from './constructs/sqs-connector';

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

      eventBus.archives?.forEach((archive: IArchive) => {
        console.log(archive)
        archives.push(new Archive(this, `Archive-${archive.name}`, {
          eventPattern: {
            detailType: [archive.pattern.topic],
            source: [archive.pattern.source],
          },
          sourceEventBus: bus,
          archiveName: archive.name,
          retention: Duration.days(archive.retentionDays),
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
        } else if(sub.target === ConnectorTarget.SQS) {
          const sqsProps = sub.targetParams as SQSConnectorProps;
          new SQSConnector(_this, connectorName, {
            name: sub.name,
            accountId: _this.account,
            detailType: sub.topic,
            eventBus: bus,
            source: sub.source,
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