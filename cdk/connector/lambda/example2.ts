import { Handler } from 'aws-lambda';

import { ArticlePosted } from '../../../types';

export const handler: Handler = async (busEvent: ArticlePosted, context, callback) => {
    console.log("Received event: ", busEvent);
    console.log("id: ", busEvent.data.aid);
    console.log("type: ", busEvent.detailType);
    console.log("source: ", busEvent.source);
    callback(null, busEvent);
};
