import { Handler } from 'aws-lambda';

import { AdCampaignPublished } from '../../../types';

export const handler: Handler = async (busEvent: AdCampaignPublished, context, callback) => {
    console.log("Received event: ", busEvent);
    console.log("id: ", busEvent.data.adId);
    console.log("status: ", busEvent.data.publish_status);
    console.log("type: ", busEvent.detailType);
    console.log("source: ", busEvent.source);
    callback(null, busEvent);
};
