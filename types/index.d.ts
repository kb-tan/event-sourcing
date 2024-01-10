/* eslint-disable */
// Auto generate code, DO NOT MODIFY

import { AnyEvent as _AnyEvent } from './jeffrey-machine-learning/AnyEvent'
import { TalentPlacement as _TalentPlacement } from './prohire/TalentPlacement'
import { AdCampaignPublished as _AdCampaignPublished } from './media-solution/AdCampaignPublished'
import { UserLoggedIn as _UserLoggedIn } from './smarthire/UserLoggedIn'
import { ArticlePosted as _ArticlePosted } from './community/ArticlePosted'
import { ThreadCreated as _ThreadCreated } from './community/ThreadCreated'
import { VideoCreated as _VideoCreated } from './media/VideoCreated'
import { LearningTrend as _LearningTrend } from './learning/LearningTrend'

declare namespace EventBusSchemaTypes {
    type AnyEvent = _AnyEvent;
    type TalentPlacement = _TalentPlacement;
    type AdCampaignPublished = _AdCampaignPublished;
    type UserLoggedIn = _UserLoggedIn;
    type ArticlePosted = _ArticlePosted;
    type ThreadCreated = _ThreadCreated;
    type VideoCreated = _VideoCreated;
    type LearningTrend = _LearningTrend;

    type Every = AnyEvent | TalentPlacement | AdCampaignPublished | UserLoggedIn | ArticlePosted | ThreadCreated | VideoCreated | LearningTrend
}

export = EventBusSchemaTypes;
