# Azure Container Apps Custom Domain Action

This action will create and validate Azure DNS records for an Azure Container Apps custom domain. It will then generate a managed certificate and bind it to the Container App.

## Inputs

### `subscription-id`
**Optional** Your Azure subscription ID. If not provided, the action will attempt to read the value from the environment variable `AZURE_SUBSCRIPTION_ID`.

### `region`
**Required** The Azure region where the Azure Container App is located.

### `dns-resource-group-name`
**Required** The name of the resource group containing the DNS zone.

### `dns-zone`
**Required** The DNS zone to add the record to.

### `dns-name`
**Required** The DNS name of the record that will be created. For example, if the DNS zone is example.com and the DNS name is www, the resulting DNS record will be www.example.com.

### `container-app-name`
**Required** The name of the Azure Container App.

### `container-app-resource-group-name`
**Required** The name of the resource group containing the Azure Container App.

### `container-app-environment-name`
**Required** The name of the Container Apps Environment containing the Azure Container App.


## Example usage

```yaml
uses: manta-ai/container-apps-custom-domain-action@v1
with:
  subscription-id: '00000000-0000-0000-0000-000000000000'
  region: 'eastus'
  dns-resource-group-name: 'example-dns-rg'
  dns-zone: 'example.com'
  dns-name: 'app'
  container-app-name: 'example-app'
  container-app-resource-group-name: 'example-app-rg'
  container-app-environment-name: 'example-app-env'
```
