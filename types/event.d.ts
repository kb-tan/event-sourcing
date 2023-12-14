export interface BaseEvent {
    version:       string;
    id:            string;
    "detail-type": string;
    source:        string;
    detail:        Detail;
}

export interface Detail {
  data: Data;
}

export interface Data { }
