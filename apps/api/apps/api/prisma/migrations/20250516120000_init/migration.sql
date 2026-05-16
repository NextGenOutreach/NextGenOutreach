-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CLIENT', 'REP', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'BANNED');

-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('STARTER', 'PRO', 'MANAGED');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'PENDING_MATCH', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CampaignType" AS ENUM ('CONNECTIONS', 'DMS', 'POSTS', 'MIXED');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('CONNECTION_SENT', 'CONNECTION_ACCEPTED', 'DM_SENT', 'DM_REPLIED', 'POST_PUBLISHED', 'MEETING_BOOKED', 'ERROR');

-- CreateEnum
CREATE TYPE "BrowserProvider" AS ENUM ('GOLOGIN', 'BITBROWSER');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('IDLE', 'LAUNCHING', 'ACTIVE', 'CLOSED', 'ERROR');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
    "two_fa_secret" TEXT,
    "two_fa_enabled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rep_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "linkedin_url" TEXT NOT NULL,
    "linkedin_followers" INTEGER NOT NULL DEFAULT 0,
    "industry" TEXT,
    "location_country" TEXT,
    "location_city" TEXT,
    "bio" TEXT,
    "id_verified" BOOLEAN NOT NULL DEFAULT false,
    "id_verified_at" TIMESTAMP(3),
    "id_document_url" TEXT,
    "onboarding_step" INTEGER NOT NULL DEFAULT 1,
    "two_fa_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "gologin_profile_id" TEXT,
    "bitbrowser_id" TEXT,
    "availability_status" TEXT NOT NULL DEFAULT 'available',
    "max_clients" INTEGER NOT NULL DEFAULT 3,
    "hourly_rate_usd" DECIMAL(8,2),
    "rating" DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    "total_reviews" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rep_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "company_name" TEXT,
    "website" TEXT,
    "industry" TEXT,
    "target_market" TEXT,
    "billing_email" TEXT,
    "plan" "Plan" NOT NULL DEFAULT 'STARTER',
    "plan_status" TEXT NOT NULL DEFAULT 'inactive',
    "payfast_token" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "rep_id" TEXT,
    "name" TEXT NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "type" "CampaignType" NOT NULL,
    "target_icp" JSONB,
    "message_templates" JSONB,
    "daily_limit" INTEGER NOT NULL DEFAULT 40,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_activities" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "activity_type" "ActivityType" NOT NULL,
    "prospect_name" TEXT,
    "prospect_url" TEXT,
    "notes" TEXT,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "browser_sessions" (
    "id" TEXT NOT NULL,
    "rep_id" TEXT NOT NULL,
    "campaign_id" TEXT,
    "provider" "BrowserProvider" NOT NULL,
    "external_profile_id" TEXT,
    "status" "SessionStatus" NOT NULL DEFAULT 'IDLE',
    "last_active_at" TIMESTAMP(3),
    "session_meta" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "browser_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "plan" "Plan" NOT NULL,
    "amount_usd" DECIMAL(8,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "payfast_payment_id" TEXT,
    "billing_cycle_start" TIMESTAMP(3),
    "billing_cycle_end" TIMESTAMP(3),
    "next_billing_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rep_earnings" (
    "id" TEXT NOT NULL,
    "rep_id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "amount_usd" DECIMAL(8,2) NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rep_earnings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "action_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "actor_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "metadata" JSONB,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "rep_profiles_user_id_key" ON "rep_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "client_profiles_user_id_key" ON "client_profiles"("user_id");

-- AddForeignKey
ALTER TABLE "rep_profiles" ADD CONSTRAINT "rep_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_profiles" ADD CONSTRAINT "client_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_rep_id_fkey" FOREIGN KEY ("rep_id") REFERENCES "rep_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_activities" ADD CONSTRAINT "campaign_activities_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "browser_sessions" ADD CONSTRAINT "browser_sessions_rep_id_fkey" FOREIGN KEY ("rep_id") REFERENCES "rep_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "browser_sessions" ADD CONSTRAINT "browser_sessions_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rep_earnings" ADD CONSTRAINT "rep_earnings_rep_id_fkey" FOREIGN KEY ("rep_id") REFERENCES "rep_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rep_earnings" ADD CONSTRAINT "rep_earnings_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rep_earnings" ADD CONSTRAINT "rep_earnings_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

