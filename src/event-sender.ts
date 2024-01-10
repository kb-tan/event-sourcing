import {
    EventBridgeClient,
    PutEventsCommand,
} from "@aws-sdk/client-eventbridge";

import * as EventType from '../types';

export class EventSender<T extends EventType.Every> {
    private source: string;
    private eventBusName: string;
    private client: EventBridgeClient;
    
    constructor(source: string, eventBusName: string) {
        this.client = new EventBridgeClient({});
        this.source = source;
        this.eventBusName = eventBusName;
    }

    async sendEvent(event:T): Promise<unknown> {
        // if(event.source !== this.source || event.eventBusName !== this.eventBusName) {
        //     return Promise.resolve(`Unmatched source or eventBus value.`);
        // }
        const response = await this.client.send(
            new PutEventsCommand({
              Entries: [
                {
                  Detail: JSON.stringify(event.data),
                  DetailType: event.detailType,
                  Source: this.source,
                  EventBusName: this.eventBusName
                },
              ],
            }),
          );
          return response;
    }
}

