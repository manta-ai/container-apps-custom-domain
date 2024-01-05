import { createClients } from './clients';
import { getContainerAppContext, hasExistingCertificate } from './container-apps';
import { validateDns } from './dns';
import { getConfig } from './input';

export const main = async () => {
  const config = getConfig();
  const { dns, containerApps } = createClients(config);

  const containerAppContext = await getContainerAppContext(containerApps, config);

  if (await hasExistingCertificate(containerAppContext, config)) {
    console.log(`Certificate for ${config.fqdn} already exists, nothing to do.`);
    return;
  }

  await validateDns(config, dns, containerAppContext);

  console.log(`Creating certificate for ${config.fqdn}.`);
  const timestamp = Math.floor(Date.now() / 1000);
  const certificateName = `${config.containerAppName}-mc-${timestamp}`;
  const certificate = await containerApps.managedCertificates.beginCreateOrUpdateAndWait(
    config.containerAppResourceGroupName,
    config.containerAppEnvironmentName,
    certificateName,
    {
      managedCertificateEnvelope: {
        location: config.region,
        properties: {
          subjectName: config.fqdn,
          domainControlValidation: 'CNAME'
        }
      }
    }
  );
  console.log(`Successfully created certificate for ${config.fqdn}.`);

  console.log(`Binding certificate for ${config.fqdn} to container app ${config.containerAppName}.`);
  await containerApps.containerApps.beginUpdateAndWait(config.containerAppResourceGroupName, config.containerAppName, {
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
  });
  console.log(`Successfully bound domain ${config.fqdn} to container app ${config.containerAppName}.`);
};
