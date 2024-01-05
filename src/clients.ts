import { ContainerAppsAPIClient } from '@azure/arm-appcontainers';
import { DefaultAzureCredential } from '@azure/identity';
import { DnsManagementClient } from '@azure/arm-dns';
import * as core from '@actions/core';
import { Config } from './input';

interface Clients {
  dns: DnsManagementClient;
  containerApps: ContainerAppsAPIClient;
}

export const createClients = (config: Config): Clients => {
  let subscriptionId: string = core.getInput('subscription-id');

  if (subscriptionId.length === 0 && process.env.AZURE_SUBSCRIPTION_ID != null) {
    subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
  }

  if (subscriptionId == null || subscriptionId.length === 0) {
    throw new Error('Could not find Azure subscription.');
  }

  const credentials = new DefaultAzureCredential();

  return {
    dns: new DnsManagementClient(credentials, subscriptionId),
    containerApps: new ContainerAppsAPIClient(credentials, subscriptionId)
  };
};
