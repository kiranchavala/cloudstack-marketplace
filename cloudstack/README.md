# CloudStack VM Templates

This directory contains cloud-init configurations and build scripts for creating
CloudStack VM templates used by the marketplace.

---

## Overview

Each app in the marketplace is backed by a CloudStack VM template. Templates are
created by:
1. Spinning up a base Ubuntu 22.04 VM
2. Running the cloud-init config to install/configure the software
3. Snapshotting the VM into a reusable template
4. Registering the template with CloudStack

---

## Creating a Template

### Prerequisites

- CloudStack API access (API key + secret)
- A base Ubuntu 22.04 template already registered in CloudStack
- `cloudmonkey` or direct API access

### Using the Build Script

```bash
cd scripts
chmod +x build-template.sh

# Build and register WordPress template
./build-template.sh wordpress

# Build and register LAMP stack template
./build-template.sh lamp
```

### Environment Variables

Set these before running the script:

```bash
export CS_API_URL="http://your-cloudstack:8080/client/api"
export CS_API_KEY="your_api_key"
export CS_SECRET_KEY="your_secret_key"
export CS_ZONE_ID="your_zone_id"
export CS_BASE_TEMPLATE_ID="ubuntu-22-04-template-id"
export CS_SERVICE_OFFERING_ID="small-vm-offering-id"
```

---

## Templates

| Template   | Description                                | Path                          |
|------------|--------------------------------------------|-------------------------------|
| WordPress  | WordPress + Apache + MySQL + PHP           | templates/wordpress/          |
| LAMP Stack | Linux + Apache + MySQL + PHP               | templates/lamp/               |

---

## Adding a New Template

1. Create a directory under `templates/<app-name>/`
2. Add a `cloud-init.yaml` file with installation steps
3. Test the cloud-init config on a fresh Ubuntu 22.04 VM
4. Run `./scripts/build-template.sh <app-name>` to register it
