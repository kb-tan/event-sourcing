import * as fs from 'fs';
import * as path from 'path';
import { Pair, YAMLMap, YAMLSeq, parseDocument } from 'yaml';

export interface ITopic {
    name: string;
    source: string;
}

export interface IReplay {
    name: string;
    retentionDays: number;
    pattern: {
        source: string;
        detailType: string;
    }
}

export interface IEventBus {
    name: string;
    topics: [ITopic];
    replays: [IReplay];
    subscriptions: [ISubsubscription];
}

export interface ISubsubscription {
    name: string;
    eventBus: string;
    source: string;
    pattern: string;
    target: string;
}

export interface EventBusProps {
    eventbus: [IEventBus];
}

export interface SubscriptionProps {
    subscriptions: [ISubsubscription];
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

const looselyParseYaml = ({ yamlFile }: { yamlFile: YamlFile; }): YAMLMap<any, any> | null | undefined => {
    return parseDocument(yamlFile.contents).contents as YAMLMap;
};

export const parseConfig = (path): EventBusProps & SubscriptionProps => {
    const parsedNode = looselyParseYaml({yamlFile: loadYamlFile(path)});
    // fix: no field validator
    return (JSON.parse(parsedNode.toString()));
//     WIP: field validator
//     return {
//         ...parseEventBus(parsedNode.get("eventbus")),
//         ...parseSubscription(parsedNode.get("subscriptions"))
//     }
}

export const getEventBus = (config: EventBusProps & SubscriptionProps): IEventBus => {
    
    return null;
}

const parseEventBus = (yaml: YAMLSeq<YAMLMap>): EventBusProps => {
    let item: YAMLMap;
    for(item of yaml.items) {
        parseEventBusConfig(item); 
    }
    return null;
}

const parseEventBusConfig = (ebConfig: YAMLMap) => {
    let item: Pair;
    for(item of ebConfig.items) {
        console.log(item);
    }
}


export const parseSubscription = (yaml: YAMLSeq): SubscriptionProps => {
    // console.log(yaml);
    return null;
}

// const config = parseConfig('../config/config.yaml');
// config.eventbus.forEach((item: IEventBus) => {
//     console.log(item.name);

// })
// console.log(config.eventbus[0].topics);
// console.log(config.subscriptions);
