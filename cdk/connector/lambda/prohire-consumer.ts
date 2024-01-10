import { Handler } from 'aws-lambda';

import * as all from '../../../types';

export const handler: Handler = async (busEvent: all.TalentPlacement, context, callback) => {
    console.log("Received event: ", busEvent);
    console.log("id: ", busEvent.data.talentId);
    console.log("status: ", busEvent.data.placement_status);
    console.log("type: ", busEvent.detailType);
    console.log("source: ", busEvent.source);
    callback(null, busEvent);
};
