#!/bin/bash
# CloudStack Marketplace - VM Template Builder
# Usage: ./build-template.sh <app-name>
# Example: ./build-template.sh wordpress

set -e

APP_NAME="${1:-}"
if [ -z "$APP_NAME" ]; then
  echo "Usage: $0 <app-name>"
  echo "Available apps: wordpress, lamp"
  exit 1
fi

TEMPLATE_DIR="$(dirname "$0")/../templates/${APP_NAME}"
CLOUD_INIT_FILE="${TEMPLATE_DIR}/cloud-init.yaml"

if [ ! -f "$CLOUD_INIT_FILE" ]; then
  echo "Error: cloud-init.yaml not found at ${CLOUD_INIT_FILE}"
  exit 1
fi

# Required environment variables
: "${CS_API_URL:?CS_API_URL is required}"
: "${CS_API_KEY:?CS_API_KEY is required}"
: "${CS_SECRET_KEY:?CS_SECRET_KEY is required}"
: "${CS_ZONE_ID:?CS_ZONE_ID is required}"
: "${CS_BASE_TEMPLATE_ID:?CS_BASE_TEMPLATE_ID is required}"
: "${CS_SERVICE_OFFERING_ID:?CS_SERVICE_OFFERING_ID is required}"

echo "=========================================="
echo " CloudStack Template Builder"
echo " App: ${APP_NAME}"
echo "=========================================="

# Sign a CloudStack API request
cs_request() {
  local COMMAND="$1"
  shift
  local PARAMS="command=${COMMAND}&apiKey=${CS_API_KEY}&response=json"
  while [[ $# -gt 0 ]]; do
    PARAMS="${PARAMS}&${1}"
    shift
  done

  # Sort params and generate signature
  local SORTED_PARAMS
  SORTED_PARAMS=$(echo "$PARAMS" | tr '&' '\n' | sort | tr '\n' '&' | sed 's/&$//')
  local LOWER_PARAMS
  LOWER_PARAMS=$(echo "$SORTED_PARAMS" | tr '[:upper:]' '[:lower:]')
  local SIGNATURE
  SIGNATURE=$(echo -n "$LOWER_PARAMS" | openssl dgst -sha1 -hmac "$CS_SECRET_KEY" -binary | base64)
  local ENCODED_SIG
  ENCODED_SIG=$(python3 -c "import urllib.parse; print(urllib.parse.quote('${SIGNATURE}', safe=''))")

  curl -s "${CS_API_URL}?${SORTED_PARAMS}&signature=${ENCODED_SIG}"
}

# Encode cloud-init as base64 userdata
USERDATA=$(base64 -w 0 < "$CLOUD_INIT_FILE")

echo "Step 1: Deploying base VM for template creation..."
DEPLOY_RESPONSE=$(cs_request deployVirtualMachine \
  "templateid=${CS_BASE_TEMPLATE_ID}" \
  "serviceofferingid=${CS_SERVICE_OFFERING_ID}" \
  "zoneid=${CS_ZONE_ID}" \
  "name=marketplace-template-${APP_NAME}-build" \
  "displayname=Marketplace Template Builder - ${APP_NAME}" \
  "userdata=${USERDATA}")

VM_ID=$(echo "$DEPLOY_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('deployvirtualmachineresponse',{}).get('virtualmachine',{}).get('id',''))" 2>/dev/null || echo "")

if [ -z "$VM_ID" ]; then
  echo "Error: Failed to deploy VM"
  echo "$DEPLOY_RESPONSE"
  exit 1
fi

echo "VM deployed: ${VM_ID}"
echo "Step 2: Waiting for VM to reach Running state and cloud-init to finish..."

for i in {1..30}; do
  sleep 30
  VM_STATE=$(cs_request listVirtualMachines "id=${VM_ID}" | python3 -c "import sys,json; d=json.load(sys.stdin); vms=d.get('listvirtualmachinesresponse',{}).get('virtualmachine',[]); print(vms[0].get('state','') if vms else '')" 2>/dev/null || echo "")
  echo "  VM state: ${VM_STATE} (attempt ${i}/30)"
  if [ "$VM_STATE" = "Running" ]; then
    break
  fi
done

echo "Step 3: Stopping VM before creating template snapshot..."
cs_request stopVirtualMachine "id=${VM_ID}&forced=true" > /dev/null
sleep 30

echo "Step 4: Creating template from VM..."
TEMPLATE_NAME="marketplace-${APP_NAME}-$(date +%Y%m%d)"
CREATE_RESPONSE=$(cs_request createTemplate \
  "virtualmachineid=${VM_ID}" \
  "name=${TEMPLATE_NAME}" \
  "displaytext=CloudStack Marketplace ${APP_NAME} Template" \
  "ostypeid=99" \
  "ispublic=true" \
  "isfeatured=true")

TEMPLATE_ID=$(echo "$CREATE_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('createtemplateresponse',{}).get('template',{}).get('id',''))" 2>/dev/null || echo "")

if [ -z "$TEMPLATE_ID" ]; then
  echo "Warning: Could not extract template ID from response"
  echo "$CREATE_RESPONSE"
else
  echo "Template created: ${TEMPLATE_ID}"
  echo ""
  echo "=========================================="
  echo " Template Registration Complete"
  echo " App:         ${APP_NAME}"
  echo " Template ID: ${TEMPLATE_ID}"
  echo " Name:        ${TEMPLATE_NAME}"
  echo "=========================================="
  echo ""
  echo "Update your backend/.env with:"
  echo "CLOUDSTACK_TEMPLATE_${APP_NAME^^}=${TEMPLATE_ID}"
fi

echo "Step 5: Cleaning up build VM..."
cs_request destroyVirtualMachine "id=${VM_ID}&expunge=true" > /dev/null
echo "Build VM destroyed."
