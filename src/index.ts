import * as core from '@actions/core';
import * as process from 'process';
import { main } from './main';

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error: Error) => {
    core.setFailed(error.message);
    process.exit(1);
  });
