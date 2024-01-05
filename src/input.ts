import * as core from '@actions/core';

export interface Config {
  subscriptionId: string;
  region: string;
  dnsResourceGroupName: string;
  dnsZoneName: string;
  dnsName: string;
  containerAppName: string;
  containerAppResourceGroupName: string;
  containerAppEnvironmentName: string;
  fqdn: string;
}

export const getConfig = (): Config => {
  let subscriptionId: string = core.getInput('subscription-id');

  if (subscriptionId.length === 0 && process.env.AZURE_SUBSCRIPTION_ID != null) {
    subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
  }

  if (subscriptionId == null || subscriptionId.length === 0) {
    throw new Error('Could not find Azure subscription.');
  }

  const dnsName = core.getInput('dns-name', { required: true });
  const dnsZoneName = core.getInput('dns-zone', { required: true });
  const fqdn = `${dnsName}.${dnsZoneName}`;

  return {
    subscriptionId,
    dnsZoneName,
    dnsName,
    fqdn,
    region: core.getInput('region', { required: true }),
    dnsResourceGroupName: core.getInput('dns-resource-group-name', { required: true }),
    containerAppName: core.getInput('container-app-name', { required: true }),
    containerAppResourceGroupName: core.getInput('container-app-resource-group-name', { required: true }),
    containerAppEnvironmentName: core.getInput('container-app-environment-name', { required: true })
  };
};
