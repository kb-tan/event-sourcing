import { ArticlePosted } from '../../types';
import * as EventTypes from '../../types';

import {
    EventBridgeClient,
    PutEventsCommand,
  } from "@aws-sdk/client-eventbridge";
import { EventSender } from '../event-sender';

export const putEvents = async (
  ) => {
    const event: ArticlePosted = {
        data: {
          aid: `${Math.floor(Math.random() * 10000)}`,
        },
        source: "community",
        "detailType": "ArticlePosted",
        eventBusName: "community"
    }
    const client = new EventBridgeClient({});
    const response = await client.send(
      new PutEventsCommand({
        Entries: [
          {
            Detail: JSON.stringify(event.data),
            DetailType: event.detailType,
            Source: event.source,
            EventBusName: event.eventBusName
          },
        ],
      }),
    );
  
    console.log("PutEvents response:");
    console.log(response);
    return response;
  }

  const sendCommunityEvent = async () => {
    const source = "community";
    const eventBusName = "community"
    const event: ArticlePosted = {
      data: {
        aid: `${Math.floor(Math.random() * 10000)}`,
      },
      source: "community",
      "detailType": "ArticlePosted",
      eventBusName: "community"
  }
    const sender = new EventSender<ArticlePosted>(source, eventBusName);
    const response = await sender.sendEvent(event);
    console.log(response);
  }

  const sendMediaEvent = async () => {
    const source = "media";
    const eventBusName = "media"
    const event: EventTypes.VideoCreated = {
      data: {
        vid: `vid-${Math.floor(Math.random() * 10000)}`,
        video_status: "created"
      },
      source: "media",
      "detailType": "VideoCreated",
      eventBusName: "media"
  }
    const sender = new EventSender<EventTypes.VideoCreated>(source, eventBusName);
    const response = await sender.sendEvent(event);
    console.log(response);
  }


  const sendLearningTrendEvent = async () => {
    const source = "learning";
    const eventBusName = "learning"
    const event: EventTypes.LearningTrend = {
      data: {
        candidateId: `candidateId-${Math.floor(Math.random() * 10000)}`,
        moduleId: `moduleId-${Math.floor(Math.random() * 10000)}`
      },
      source,
      "detailType": "LearningTrend",
      eventBusName: "learning"
  }
    const sender = new EventSender<EventTypes.LearningTrend>(source, eventBusName);
    const response = await sender.sendEvent(event);
    console.log(response);
  }

  const opt = process.argv[2];
  if(opt === "media") {
    sendMediaEvent();
  }

  if(opt === "community") {
    sendCommunityEvent();
  }

  if(opt === "learning") {
    sendLearningTrendEvent();
  }