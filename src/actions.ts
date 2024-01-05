import { ContainerApp, ContainerApps, ManagedCertificate, ManagedCertificates } from '@azure/arm-appcontainers';
import { DnsManagementClient } from '@azure/arm-dns';
import { Config } from './config';
import { ContainerAppContext } from './container-apps';

export const runAction = async <T>(message: string, action: () => Promise<T>): Promise<T> => {
  process.stdout.write(`${message}...`);
  try {
    const value = await action();
    process.stdout.write('success\n');
    return value;
  } catch (error) {
    process.stdout.write('failed\n');
    throw error;
  }
};

export const bindHostname = async (config: Config, containerApps: ContainerApps): Promise<void> => {
  const containerAppEnvelope: ContainerApp = {
    location: config.region,
    configuration: {
      ingress: {
        customDomains: [
          {
            name: config.fqdn,
            bindingType: 'Disabled'
          }
        ]
      }
    }
  };

  await containerApps.beginUpdateAndWait(
    config.containerAppResourceGroupName,
    config.containerAppName,
    containerAppEnvelope
  );
};

export const generateCertificate = async (
  config: Config,
  managedCertificates: ManagedCertificates
): Promise<ManagedCertificate> => {
  const timestamp = Math.floor(Date.now() / 1000);
  const certificateName = `${config.containerAppName}-mc-${timestamp}`;
  const managedCertificateEnvelope: ManagedCertificate = {
    location: config.region,
    properties: {
      subjectName: config.fqdn,
      domainControlValidation: 'CNAME'
    }
  };

  return await managedCertificates.beginCreateOrUpdateAndWait(
    config.containerAppResourceGroupName,
    config.containerAppEnvironmentName,
    certificateName,
    { managedCertificateEnvelope }
  );
};

export const bindCertificate = async (
  config: Config,
  containerApps: ContainerApps,
  certificate: ManagedCertificate
) => {
  const containerAppEnvelope: ContainerApp = {
    location: config.region,
    configuration: {
      ingress: {
        customDomains: [
          {
            certificateId: certificate.id,
            name: config.fqdn,
            bindingType: 'SniEnabled'
          }
        ]
      }
    }
  };

  await containerApps.beginUpdateAndWait(
    config.containerAppResourceGroupName,
    config.containerAppName,
    containerAppEnvelope
  );
};

export const validateAliasRecord = async (
  config: Config,
  dns: DnsManagementClient,
  containerAppContext: ContainerAppContext
): Promise<void> => {
  await dns.recordSets.createOrUpdate(config.dnsResourceGroupName, config.dnsZoneName, config.dnsName, 'CNAME', {
    cnameRecord: {
      cname: `${config.containerAppName}.${containerAppContext.defaultDomain}`
    },
    ttl: 300
  });
};

export const validateVerificationRecord = async (
  config: Config,
  dns: DnsManagementClient,
  containerAppContext: ContainerAppContext
): Promise<void> => {
  await dns.recordSets.createOrUpdate(
    config.dnsResourceGroupName,
    config.dnsZoneName,
    `asuid.${config.dnsName}`,
    'TXT',
    {
      txtRecords: [{ value: [containerAppContext.customDomainVerificationId] }],
      ttl: 3600
    }
  );
};
