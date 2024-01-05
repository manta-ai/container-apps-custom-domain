import { DnsManagementClient } from '@azure/arm-dns';
import { ContainerAppContext } from './container-apps';
import { Config } from './input';

export const validateDns = async (
  config: Config,
  dns: DnsManagementClient,
  containerAppContext: ContainerAppContext
): Promise<void> => {
  console.log(`Checking that DNS record ${config.fqdn} exists and is valid...`);
  await dns.recordSets.createOrUpdate(config.dnsResourceGroupName, config.dnsZoneName, config.dnsName, 'CNAME', {
    cnameRecord: {
      cname: `${config.containerAppName}.${containerAppContext.defaultDomain}`
    },
    ttl: 300
  });
  console.log(`Successfully validated ${config.fqdn}.`);

  console.log(`Checking that DNS record asuid.${config.fqdn} exists and is valid...`);
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
  console.log(`Successfully validated asuid.${config.fqdn}.`);
};
