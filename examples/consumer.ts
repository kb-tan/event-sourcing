
import { parseEvent } from "../src/parse";
import { SomeEvent } from "../types/some-event";

const consumer = parseEvent<SomeEvent>();



