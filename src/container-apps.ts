import {
  Certificate,
  ContainerApp,
  ContainerAppsAPIClient,
  ManagedCertificate,
  ManagedEnvironment
} from '@azure/arm-appcontainers';
import { Config } from './config';

export interface ContainerAppContext {
  app: ContainerApp;
  appEnvironment: ManagedEnvironment;
  certificates: Certificate[];
  defaultDomain: string;
  customDomainVerificationId: string;
}

export const getContainerAppContext = async (
  containerApps: ContainerAppsAPIClient,
  config: Config
): Promise<ContainerAppContext> => {
  const app = await containerApps.containerApps.get(config.containerAppResourceGroupName, config.containerAppName);

  if (app.customDomainVerificationId == null) {
    throw new Error(`Container app ${app.name} does not have a custom domain verification ID.`);
  }

  const appEnvironment = await containerApps.managedEnvironments.get(
    config.containerAppResourceGroupName,
    config.containerAppEnvironmentName
  );

  if (appEnvironment.defaultDomain == null) {
    throw new Error(`Container app environment ${appEnvironment.defaultDomain} does not have a default domain.`);
  }

  const existingCertificates = containerApps.managedCertificates.list(
    config.containerAppResourceGroupName,
    config.containerAppEnvironmentName
  );
  const certificates: ManagedCertificate[] = [];

  for await (const existingCertificate of existingCertificates) {
    certificates.push(existingCertificate);
  }

  return {
    app,
    appEnvironment,
    certificates,
    customDomainVerificationId: app.customDomainVerificationId,
    defaultDomain: appEnvironment.defaultDomain
  };
};

export const hasExistingCertificate = async (
  containerAppContext: ContainerAppContext,
  { fqdn }: Config
): Promise<boolean> => {
  for (const existingCertificate of containerAppContext.certificates) {
    const { properties } = existingCertificate;

    if (properties == null) {
      continue;
    }

    if (properties.subjectName === fqdn) {
      return true;
    }

    if (properties.subjectAlternativeNames?.includes(fqdn)) {
      return true;
    }
  }

  return false;
};
