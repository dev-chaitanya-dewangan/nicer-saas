-- Migration: Add missing columns to workspaces table
-- This migration adds the include_content and content_density columns
-- that are missing from the original schema

ALTER TABLE "workspaces" ADD COLUMN "include_content" integer DEFAULT 1;
ALTER TABLE "workspaces" ADD COLUMN "content_density" text DEFAULT 'moderate';
ALTER TABLE "workspaces" ADD COLUMN "metadata" text;