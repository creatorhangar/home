# 🎯 Stripe Configuration Guide
**Final Steps to Enable Payments**

## ✅ What's Already Done

- ✅ Stripe SDK installed
- ✅ All API routes created (checkout, portal, webhooks)
- ✅ UI components created (UpgradeButton, success/cancel pages)
- ✅ Currency detection for 14 currencies
- ✅ Price mapping configured
- ✅ Code deployed to production

---

## 🔧 STEP 1: Add Environment Variables to Vercel

### 1.1 Access Vercel Dashboard

Go to: https://vercel.com/creatorhangars-projects/creator-hangar/settings/environment-variables

### 1.2 Add These Variables

Click **"Add New"** for each:

**NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:**
```
pk_live_51SKHybLXTAG6PTSpLf7LHWHuiAg6CMyF3aQsYV20QmpG1GNZauKWn4nIacVebi9YrxK2zjsbuccOm2WPk7o2TYpm00EqaBr3Ao
```

**STRIPE_SECRET_KEY:**
```
sk_live_...GqTH
```
(Get the full key from: https://dashboard.stripe.com/apikeys)

**STRIPE_WEBHOOK_SECRET:**
```
(Leave empty for now - will add after creating webhook)
```

**NEXT_PUBLIC_APP_URL:**
```
https://creatorhangar.com
```

### 1.3 Save and Redeploy

- Click **"Save"**
- Vercel will automatically redeploy

---

## 🪝 STEP 2: Create Stripe Webhook

### 2.1 Access Stripe Webhooks

Go to: https://dashboard.stripe.com/webhooks

### 2.2 Create Endpoint

1. Click **"Add endpoint"**
2. **Endpoint URL:** `https://creatorhangar.com/api/webhooks/stripe`
3. **Description:** "Creative Hangar Subscription Events"

### 2.3 Select Events

Click **"Select events"** and choose:
- ✅ `checkout.session.completed`
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`

### 2.4 Save and Get Secret

1. Click **"Add endpoint"**
2. Click on the newly created webhook
3. Click **"Reveal"** under "Signing secret"
4. Copy the secret (starts with `whsec_...`)

### 2.5 Add Secret to Vercel

1. Go back to: https://vercel.com/creatorhangars-projects/creator-hangar/settings/environment-variables
2. Find **STRIPE_WEBHOOK_SECRET**
3. Click **"Edit"**
4. Paste the webhook secret
5. Click **"Save"**
6. Vercel will redeploy automatically

---

## 🧪 STEP 3: Test the Integration

### 3.1 Test Checkout Flow

1. Go to: https://creatorhangar.com/dashboard
2. Click **"Upgrade para Pro"**
3. You should be redirected to Stripe Checkout
4. Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
5. Complete payment
6. You should be redirected to `/success`
7. After 5 seconds, redirected to `/dashboard`
8. Dashboard should show "Pro" plan

### 3.2 Verify Database

1. Go to: https://supabase.com/dashboard/project/oqtmmzlfonhktxjnuilz/editor
2. Open `subscriptions` table
3. Find your user
4. Verify:
   - `plan_type` = 'pro'
   - `stripe_customer_id` is populated
   - `stripe_subscription_id` is populated
   - `status` = 'active'

### 3.3 Test Paywall

1. Go to a tool (e.g., Removedor de Fundo)
2. Try to use it
3. It should work without showing the paywall (you're Pro now!)

---

## 🐛 Troubleshooting

### Checkout doesn't open

**Check:**
- Environment variables are set in Vercel
- Site was redeployed after adding variables
- Browser console for errors

### Payment succeeds but plan doesn't upgrade

**Check:**
- Webhook is created in Stripe
- Webhook secret is added to Vercel
- Webhook events are selected correctly
- Check Stripe webhook logs: https://dashboard.stripe.com/webhooks

### "Webhook signature verification failed"

**Solution:**
- Make sure STRIPE_WEBHOOK_SECRET matches the webhook signing secret
- Redeploy after adding the secret

---

## ✅ Success Checklist

- [ ] Environment variables added to Vercel
- [ ] Webhook created in Stripe
- [ ] Webhook secret added to Vercel
- [ ] Test checkout completed successfully
- [ ] User upgraded to Pro in database
- [ ] Paywall removed for Pro users
- [ ] Success page shows correctly
- [ ] Dashboard shows Pro badge

---

## 🎉 When Everything Works

Your payment system is live! Users can now:
- ✅ Upgrade from Free to Pro
- ✅ Pay in their local currency (14 supported)
- ✅ Choose monthly or annual billing
- ✅ Manage subscription via Stripe portal
- ✅ Access all Pro features

---

## 📊 Monitoring

**Stripe Dashboard:**
- Payments: https://dashboard.stripe.com/payments
- Subscriptions: https://dashboard.stripe.com/subscriptions
- Webhooks: https://dashboard.stripe.com/webhooks

**Supabase:**
- Subscriptions table: https://supabase.com/dashboard/project/oqtmmzlfonhktxjnuilz/editor

---

**Need help?** Check the Stripe webhook logs for detailed error messages.
