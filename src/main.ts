import {
  bindHostname,
  generateCertificate,
  runAction,
  validateAliasRecord,
  validateVerificationRecord
} from './actions';
import { createClients } from './clients';
import { Config } from './config';
import { getContainerAppContext } from './container-apps';

export const main = async (config: Config) => {
  const { dnsClient, containerAppsClient } = createClients(config);
  const containerAppContext = await getContainerAppContext(containerAppsClient, config);

  await runAction(`Checking that DNS alias record ${config.fqdn} exists and is valid`, async () => {
    await validateAliasRecord(config, dnsClient, containerAppContext);
  });

  await runAction(`Checking that DNS verification record asuid.${config.fqdn} exists and is valid`, async () => {
    await validateVerificationRecord(config, dnsClient, containerAppContext);
  });

  await runAction(`Binding hostname ${config.fqdn} to container app ${config.containerAppName}`, async () => {
    await bindHostname(config, containerAppsClient.containerApps, containerAppContext);
  });

  const certificate = await runAction(`Generating certificate for ${config.fqdn}`, async () => {
    return await generateCertificate(config, containerAppsClient.managedCertificates, containerAppContext);
  });

  await runAction(`Binding certificate for ${config.fqdn} to container app ${config.containerAppName}`, async () => {
    await bindHostname(config, containerAppsClient.containerApps, containerAppContext, certificate);
  });
};
