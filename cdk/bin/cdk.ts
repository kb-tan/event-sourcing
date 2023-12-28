#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { EventBusStack } from '../lib/event-bus-stack';
import { parseConfig } from '../../src/config';

const app = new cdk.App();
const config = parseConfig('../config/config.yaml');
new EventBusStack(app, 'EventBusStack', { ...config });
// new CdkStack(app, "CdkStack");
