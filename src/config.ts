import * as fs from 'fs';
import * as path from 'path';
import { YAMLMap, parseDocument } from 'yaml';
import { compile } from 'json-schema-to-typescript'
import { LambdaConnectorProps } from '../cdk/lib/constructs/lambda-connector'
import { SNSConnectorProps } from '../cdk/lib/constructs/sns-connector'
import * as ejs from 'ejs';

export interface ITopic {
    name: string;
    schemaFile: string;
}

export interface IArchive {
    name: string;
    retentionDays: number;
    pattern: {
        source: string;
        topic: string;
    }
}

export interface IEventBus {
    name: string;
    topics: ITopic[];
    archives: IArchive[];
    connectors: IConnector[];
}

export enum ConnectorTarget {
    EMAIL = 'email',
    LAMBDA = 'lambda',
    SNS = 'sns',
    SQS = 'sqs',
    SAGEMAKER = 'sagemaker'
}

export interface IConnector {
    name: string;
    eventBusName: string;
    source: string;
    topic: string;
    target: ConnectorTarget;
    targetParams: LambdaConnectorProps | SNSConnectorProps;
}

export interface EventBusProps {
    eventbus: IEventBus[];
}

export interface ConnectorProps {
    connectors: IConnector[];
}

interface YamlFile {
    filename: string;
    contents: string;
}
  

const loadYamlFile = (filename: string): YamlFile => {
    const contents = fs.readFileSync(
      path.join(__dirname, filename),
      'utf8',
    );
    return { contents, filename };
};

const looselyParseYaml = ({ yamlFile }: { yamlFile: YamlFile; }): YAMLMap<any, any> => {
    return parseDocument(yamlFile.contents).contents as YAMLMap;
};

export const parseConfig = (path: string): EventBusProps => {
    const parsedNode = looselyParseYaml({yamlFile: loadYamlFile(path)});

    // TODO: add field validator
    // return ((JSON.parse(parsedNode.toString())));
    return (constructEventBusProp(JSON.parse(parsedNode.toString())));
//     WIP: field validator
//     return {
//         ...parseEventBus(parsedNode.get("eventbus")),
//         ...parseSubscription(parsedNode.get("subscriptions"))
//     }
}

//TODO: refactor
const compileTopicType = (topic: ITopic, evtBusName: string) => {
    const json = JSON.parse(fs.readFileSync(path.join(__dirname, 'schema', topic.schemaFile), 'utf8'));
    json.properties['source'] = evtBusName;
    json.properties['detailType'] = topic.name;
    json.properties['eventBusName'] = evtBusName;
    json['required'] = json['required'].concat(['source', 'detailType', 'eventBusName']);
    fs.mkdir(`../types/${evtBusName}`, { recursive: true }, (err) => {
        compile(json, topic.name, {additionalProperties: false})
            .then(ts => fs.writeFileSync(`../types/${evtBusName}/${topic.name}.d.ts`, ts))
        if (err) throw err;
    });
}

//TODO: refactor
const generateSchemaIndex = (topics: Array<{
        topic: string;
        evtBusName: string;
    }>) => {
    const everyType: string = topics.map((data) => (data.topic)).join(' | ')
    const templateFile = path.join(__dirname, 'schema', 'index.d.ts.ejs');
    ejs.renderFile(templateFile, { topics, everyType } , {}, (err, str) => {
        fs.writeFileSync(path.join(__dirname, '..', 'types', 'index.d.ts'), str)
    })
}

//TODO: refactor 
export const constructEventBusProp = (prop: EventBusProps & ConnectorProps): EventBusProps => {

    const schemaMeta:Array<{ 
        topic: string;
        evtBusName: string;
    }> = [];

    for(const idx in prop.eventbus) {
        const evtBus = prop.eventbus[idx];
        const topics: ITopic[] = evtBus.topics;
        const busName = evtBus.name;

        topics.forEach((topic: ITopic) => {
            compileTopicType(topic, busName);
            schemaMeta.push({topic:topic.name, evtBusName: busName})
        })

        const subs = prop.connectors.filter((sub: IConnector) => {
            return(sub.eventBusName === busName);
        });
        
        if(evtBus.connectors === undefined) {
            evtBus.connectors = [];
        }
        evtBus.connectors = [...evtBus.connectors, ...subs];
    }
    generateSchemaIndex(schemaMeta);
    
    return prop;
}

// const parseEventBus = (yaml: YAMLSeq<YAMLMap>): EventBusProps => {
//     let item: YAMLMap;
//     for(item of yaml.items) {
//         parseEventBusConfig(item); 
//     }
//     return null;
// }

// const parseEventBusConfig = (ebConfig: YAMLMap) => {
//     let item: Pair;
//     for(item of ebConfig.items) {
//         console.log(item);
//     }
// }


// export const parseSubscription = (yaml: YAMLSeq): SubscriptionProps => {
//     return null;
// }

// const config = parseConfig('../config/config.yaml');

// config.eventbus.forEach((item: IEventBus) => {
//     console.log(item.name);
// })

// console.log(JSON.stringify(config, null," "));