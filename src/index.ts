import * as core from '@actions/core';
import { parseArgs } from 'node:util';
import * as process from 'process';
import { ConfigSource, getConfig } from './config';
import { main } from './main';

const { values } = parseArgs({
  options: {
    config: {
      type: 'string',
      short: 'c',
      default: 'input'
    }
  }
});

const config = getConfig(values.config === 'env' ? ConfigSource.Environment : ConfigSource.Input);

main(config)
  .then(() => {
    process.exit(0);
  })
  .catch((error: Error) => {
    core.setFailed(error.message);
    process.exit(1);
  });
