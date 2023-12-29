import { Handler } from 'aws-lambda';

import * as allTypes from '../../types';

export const handler: Handler = async (busEvent: allTypes.VideoCreated, context, callback) => {
    console.log("Received event: ", busEvent);
    console.log("vid: ", busEvent.data.vid);
    console.log("status: ", busEvent.data.video_status);
    console.log("type: ", busEvent.detailType);
    console.log("source: ", busEvent.source);
    callback(null, busEvent);
};
