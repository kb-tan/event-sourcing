import { BaseEvent } from "./event";

export interface SomeEvent extends BaseEvent {
    actualData: string
}