import { YAMLSeq } from 'yaml';
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
    };
}
export interface IEventBus {
    name: string;
    topics: ITopic[];
    replays: IReplay[];
    subscriptions: ISubsubscription[];
}
export interface ISubsubscription {
    name: string;
    eventBusName: string;
    source: string;
    detailType: string;
    target: string;
}
export interface EventBusProps {
    eventbus: IEventBus[];
}
export interface SubscriptionProps {
    subscriptions: ISubsubscription[];
}
export declare const parseConfig: (path: string) => EventBusProps;
export declare const getEventBus: (prop: EventBusProps & SubscriptionProps) => EventBusProps;
export declare const parseSubscription: (yaml: YAMLSeq) => SubscriptionProps;
