-- Migration: add_cloudstack_fields
-- Adds CloudStack-specific fields to App and Deployment models

-- Add cloudstackTemplateId and userdata to App
ALTER TABLE "App" ADD COLUMN IF NOT EXISTS "cloudstackTemplateId" TEXT;
ALTER TABLE "App" ADD COLUMN IF NOT EXISTS "userdata" TEXT;

-- Add cloudstackJobId and destroyedAt to Deployment
ALTER TABLE "Deployment" ADD COLUMN IF NOT EXISTS "cloudstackJobId" TEXT;
ALTER TABLE "Deployment" ADD COLUMN IF NOT EXISTS "destroyedAt" TIMESTAMP(3);

-- Allow cloudstackVmId to have a default empty string (make nullable for async deployments)
ALTER TABLE "Deployment" ALTER COLUMN "cloudstackVmId" SET DEFAULT '';
