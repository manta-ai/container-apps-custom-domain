import { ContainerAppsAPIClient } from '@azure/arm-appcontainers';
import { DefaultAzureCredential } from '@azure/identity';
import { DnsManagementClient } from '@azure/arm-dns';
import * as core from '@actions/core';
import { Config } from './config';

interface Clients {
  dnsClient: DnsManagementClient;
  containerAppsClient: ContainerAppsAPIClient;
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
    dnsClient: new DnsManagementClient(credentials, subscriptionId),
    containerAppsClient: new ContainerAppsAPIClient(credentials, subscriptionId)
  };
};
