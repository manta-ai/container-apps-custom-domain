import {
  bindCertificate,
  bindHostname,
  generateCertificate,
  runAction,
  validateAliasRecord,
  validateVerificationRecord
} from './actions';
import { createClients } from './clients';
import { Config } from './config';
import { getContainerAppContext, hasExistingCertificate } from './container-apps';

export const main = async (config: Config) => {
  const { dnsClient, containerAppsClient } = createClients(config);
  const containerAppContext = await getContainerAppContext(containerAppsClient, config);

  if (await hasExistingCertificate(containerAppContext, config)) {
    console.log(`Certificate for ${config.fqdn} already exists, nothing to do.`);
    return;
  }

  await runAction(`Checking that DNS alias record ${config.fqdn} exists and is valid`, async () => {
    await validateAliasRecord(config, dnsClient, containerAppContext);
  });

  await runAction(`Checking that DNS verification record asuid.${config.fqdn} exists and is valid`, async () => {
    await validateVerificationRecord(config, dnsClient, containerAppContext);
  });

  await runAction(`Binding hostname ${config.fqdn} to container app ${config.containerAppName}`, async () => {
    await bindHostname(config, containerAppsClient.containerApps);
  });

  const certificate = await runAction(`Generating certificate for ${config.fqdn}`, async () => {
    return await generateCertificate(config, containerAppsClient.managedCertificates);
  });

  await runAction(`Binding certificate for ${config.fqdn} to container app ${config.containerAppName}`, async () => {
    await bindCertificate(config, containerAppsClient.containerApps, certificate);
  });
};
