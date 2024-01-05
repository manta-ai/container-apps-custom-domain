import * as core from '@actions/core';
import 'dotenv/config';

export enum ConfigSource {
  Input = 'input',
  Environment = 'env'
}

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

const getFqdn = (dnsName: string, dnsZoneName: string): string => `${dnsName}.${dnsZoneName}`;

const getInputConfig = (): Config => {
  let subscriptionId: string = core.getInput('subscription-id');

  if (subscriptionId.length === 0 && process.env.AZURE_SUBSCRIPTION_ID != null) {
    subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
  }

  if (subscriptionId == null || subscriptionId.length === 0) {
    throw new Error('Could not find Azure subscription.');
  }

  const dnsName = core.getInput('dns-name', { required: true });
  const dnsZoneName = core.getInput('dns-zone', { required: true });
  const fqdn = getFqdn(dnsName, dnsZoneName);

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

const getEnvironmentVariable = (name: string): string => {
  const value = process.env[name];

  if (value == null || value.length === 0) {
    throw new Error(`Could not find environment variable ${name}.`);
  }

  return value;
};

const getEnvironmentConfig = (): Config => {
  const dnsZoneName = getEnvironmentVariable('AZURE_DNS_ZONE_NAME');
  const dnsName = getEnvironmentVariable('AZURE_DNS_NAME');
  const fqdn = getFqdn(dnsName, dnsZoneName);

  return {
    dnsZoneName,
    dnsName,
    fqdn,
    subscriptionId: getEnvironmentVariable('AZURE_SUBSCRIPTION_ID'),
    region: getEnvironmentVariable('AZURE_REGION'),
    dnsResourceGroupName: getEnvironmentVariable('AZURE_DNS_RESOURCE_GROUP_NAME'),
    containerAppName: getEnvironmentVariable('AZURE_CONTAINER_APP_NAME'),
    containerAppResourceGroupName: getEnvironmentVariable('AZURE_CONTAINER_APP_RESOURCE_GROUP_NAME'),
    containerAppEnvironmentName: getEnvironmentVariable('AZURE_CONTAINER_APP_ENVIRONMENT_NAME')
  };
};

export const getConfig = (configSource: ConfigSource): Config => {
  if (configSource === ConfigSource.Environment) {
    return getEnvironmentConfig();
  }

  return getInputConfig();
};
