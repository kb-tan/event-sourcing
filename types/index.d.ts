/* eslint-disable */
// Auto generate code, DO NOT MODIFY

import { UserLoggedIn as _UserLoggedIn } from './smarthire/UserLoggedIn'
import { ArticlePosted as _ArticlePosted } from './community/ArticlePosted'
import { ThreadCreated as _ThreadCreated } from './community/ThreadCreated'
import { VideoCreated as _VideoCreated } from './media/VideoCreated'
import { LearningTrend as _LearningTrend } from './learning/LearningTrend'

declare namespace EventBusSchemaTypes {
    type UserLoggedIn = _UserLoggedIn;
    type ArticlePosted = _ArticlePosted;
    type ThreadCreated = _ThreadCreated;
    type VideoCreated = _VideoCreated;
    type LearningTrend = _LearningTrend;

    type Every = UserLoggedIn | ArticlePosted | ThreadCreated | VideoCreated | LearningTrend
}

export = EventBusSchemaTypes;
