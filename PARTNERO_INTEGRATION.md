# Partnero Referral Program Integration

## Overview
This document describes the Partnero referral program integration for Disclosurely. The integration allows users to refer others and earn rewards when referrals subscribe.

## Architecture

### Components

1. **Edge Functions** (`supabase/functions/_shared/partnero.ts`)
   - Shared utility functions for Partnero API interactions
   - Handles customer creation/updates, transaction tracking, and referral link management

2. **Checkout Integration** (`supabase/functions/create-checkout/index.ts`)
   - Accepts `referral_code` parameter from frontend
   - Stores referral code in Stripe checkout session metadata

3. **Webhook Integration** (`supabase/functions/stripe-webhook/index.ts`)
   - Tracks successful subscriptions in Partnero
   - Creates/updates customers in Partnero
   - Records transactions with referral attribution

4. **Frontend Components**
   - `src/components/ReferralProgram.tsx` - User-facing referral dashboard
   - `src/pages/Pricing.tsx` - Detects referral codes from URL params
   - `src/components/dashboard/SettingsView.tsx` - Adds referral tab to settings

5. **Edge Function: Get Referral Link** (`supabase/functions/get-referral-link/index.ts`)
   - Returns user's referral link and code
   - Creates customer and referral link if they don't exist

## Setup Instructions

### 1. Partnero Account Setup
1. Sign up for a Partnero account at https://app.partnero.com
2. Create a Refer-a-Friend program
3. Configure your referral rewards/commissions
4. Get your API token from Partnero dashboard

### 2. Environment Variables
Add to Supabase project secrets:
```bash
PARTNERO_API_TOKEN=your_partnero_api_token_here
```

### 3. Deploy Edge Functions
```bash
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook
supabase functions deploy get-referral-link
```

## How It Works

### Referral Flow

1. **User Gets Referral Link**
   - User navigates to Settings > Referral tab
   - System calls `get-referral-link` edge function
   - Function creates/updates customer in Partnero
   - Returns unique referral link (e.g., `https://app.disclosurely.com/pricing?ref=ABC123`)

2. **Referral Shares Link**
   - User shares their referral link via email, social media, etc.
   - Link includes referral code as URL parameter

3. **New User Signs Up**
   - New user clicks referral link
   - Pricing page detects `?ref=ABC123` parameter
   - Referral code is passed to checkout function
   - Code is stored in Stripe checkout session metadata

4. **Subscription Completes**
   - Stripe webhook fires `checkout.session.completed` event
   - Webhook checks for referral code in session metadata
   - If present:
     - Creates/updates customer in Partnero
     - Tracks transaction with referral attribution
     - Partnero automatically credits the referring customer

### Transaction Tracking

Transactions are tracked in Partnero with:
- Customer email and details
- Transaction amount and currency
- Stripe subscription ID as transaction ID
- Referral code in metadata
- Subscription tier and billing interval

## API Endpoints Used

- `POST /customers` - Create customer
- `POST /transactions` - Track transaction
- `POST /customer_referral_links` - Create referral link
- `GET /customers/{id}/referral_links` - Get customer's referral links
- `GET /customer_referral_links:search` - Search for referral link by key

## Testing

1. **Test Referral Link Generation**
   - Log in as a user
   - Navigate to Settings > Referral
   - Verify referral link is generated and displayed

2. **Test Referral Tracking**
   - Use referral link: `https://app.disclosurely.com/pricing?ref=YOUR_CODE`
   - Complete a subscription
   - Check Partnero dashboard for tracked transaction
   - Verify referring customer receives credit

3. **Test Edge Cases**
   - Subscription without referral code (should work normally)
   - Multiple subscriptions from same referral (should track each)
   - Invalid referral codes (should be ignored gracefully)

## Troubleshooting

### Referral Link Not Generating
- Check `PARTNERO_API_TOKEN` is set correctly
- Verify edge function logs for errors
- Check Partnero API status

### Transactions Not Tracking
- Verify referral code is in Stripe session metadata
- Check webhook logs for Partnero API errors
- Ensure Partnero program is active and configured

### Customer Creation Fails
- Verify email format is valid
- Check Partnero API rate limits
- Review edge function error logs

## Future Enhancements

- Display referral statistics (clicks, conversions, earnings)
- Add referral leaderboard
- Email notifications for referral activity
- Custom referral rewards configuration
- Referral analytics dashboard

