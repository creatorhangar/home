# 🔐 OAuth Setup Guide - Google + GitHub
**Updated: November 24, 2024**

## Overview

This guide will help you configure OAuth authentication with Google and GitHub for Creative Hangar. After this setup, users will ONLY be able to login with Google or GitHub (no email/password).

---

## 📋 PART 1: Google OAuth Setup

### Step 1.1: Create Google Cloud Project

1. Go to: https://console.cloud.google.com/
2. Click **"Select a project"** → **"New Project"**
3. Project name: `Creative Hangar`
4. Click **"Create"**
5. Wait for project creation (30 seconds)

### Step 1.2: Configure OAuth Consent Screen

1. In the left menu, go to: **APIs & Services** → **OAuth consent screen**
2. Select **"External"**
3. Click **"Create"**

**Fill in the form:**
- App name: `Creative Hangar`
- User support email: Your email
- App logo: (optional, skip for now)
- Application home page: `https://creator-hangar-2y56pp3l6-creatorhangars-projects.vercel.app`
- Authorized domains: `vercel.app`
- Developer contact email: Your email

4. Click **"Save and Continue"**
5. Click **"Save and Continue"** (skip scopes)
6. Click **"Save and Continue"** (skip test users)
7. Click **"Back to Dashboard"**

### Step 1.3: Create OAuth Credentials

1. Go to: **APIs & Services** → **Credentials**
2. Click **"+ Create Credentials"** → **"OAuth client ID"**
3. Application type: **"Web application"**
4. Name: `Creative Hangar Web`

**Authorized JavaScript origins:**
```
https://creator-hangar-2y56pp3l6-creatorhangars-projects.vercel.app
http://localhost:3000
```

**Authorized redirect URIs:**
```
https://oqtmmzlfonhktxjnuilz.supabase.co/auth/v1/callback
http://localhost:3000/auth/callback
```

5. Click **"Create"**
6. **COPY** the Client ID and Client Secret (you'll need them!)

---

## 📋 PART 2: GitHub OAuth Setup

### Step 2.1: Create GitHub OAuth App

1. Go to: https://github.com/settings/developers
2. Click **"OAuth Apps"** → **"New OAuth App"**

**Fill in the form:**
- Application name: `Creative Hangar`
- Homepage URL: `https://creator-hangar-2y56pp3l6-creatorhangars-projects.vercel.app`
- Application description: `Multi-tool platform for digital creators`
- Authorization callback URL: `https://oqtmmzlfonhktxjnuilz.supabase.co/auth/v1/callback`

3. Click **"Register application"**

### Step 2.2: Generate Client Secret

1. Click **"Generate a new client secret"**
2. **COPY** the Client ID and Client Secret (you'll need them!)

---

## 📋 PART 3: Configure Supabase

### Step 3.1: Enable Google Provider

1. Go to: https://supabase.com/dashboard/project/oqtmmzlfonhktxjnuilz/auth/providers
2. Find **"Google"** in the list
3. Click to expand
4. Toggle **"Enable Sign in with Google"** to ON
5. Paste your Google **Client ID**
6. Paste your Google **Client Secret**
7. Click **"Save"**

### Step 3.2: Enable GitHub Provider

1. In the same page, find **"GitHub"**
2. Click to expand
3. Toggle **"Enable Sign in with GitHub"** to ON
4. Paste your GitHub **Client ID**
5. Paste your GitHub **Client Secret**
6. Click **"Save"**

### Step 3.3: Disable Email Provider

1. In the same page, find **"Email"**
2. Click to expand
3. Toggle **"Enable Email Signup"** to OFF
4. Toggle **"Enable Email provider"** to OFF
5. Click **"Save"**

---

## 📋 PART 4: Update Redirect URLs (After Domain Setup)

**⚠️ IMPORTANT:** After you configure your custom domain (`creatorhangar.com`), you need to update the redirect URLs.

### In Google Cloud Console:

1. Go to: **APIs & Services** → **Credentials**
2. Click on your OAuth client
3. Add to **Authorized JavaScript origins:**
   ```
   https://creatorhangar.com
   ```
4. Add to **Authorized redirect URIs:**
   ```
   https://creatorhangar.com/auth/callback
   ```
5. Click **"Save"**

### In GitHub OAuth App:

1. Go to: https://github.com/settings/developers
2. Click on your app
3. Update **Homepage URL:** `https://creatorhangar.com`
4. Keep the callback URL as is (Supabase callback doesn't change)
5. Click **"Update application"**

---

## ✅ Verification Checklist

Before proceeding to code updates:

- [ ] Google Cloud project created
- [ ] Google OAuth consent screen configured
- [ ] Google OAuth credentials created
- [ ] Google Client ID and Secret copied
- [ ] GitHub OAuth app created
- [ ] GitHub Client ID and Secret copied
- [ ] Google provider enabled in Supabase
- [ ] GitHub provider enabled in Supabase
- [ ] Email provider disabled in Supabase

---

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"

**Solution:**
- Check that the redirect URI in Google/GitHub matches EXACTLY the Supabase callback URL
- Make sure there are no trailing slashes
- Wait 5 minutes after saving changes

### Error: "Access blocked: This app's request is invalid"

**Solution:**
- Make sure you completed the OAuth consent screen setup
- Add your email as a test user if the app is not published
- Verify the authorized domains are correct

### Error: "Application suspended"

**Solution:**
- Your GitHub app might be suspended
- Check your GitHub email for notifications
- Verify the app settings are correct

---

## 📞 Next Steps

After completing this setup:
1. The code will be updated to use OAuth buttons
2. Test locally with `npm run dev`
3. Deploy to production
4. Test in production
5. Update redirect URLs when domain is configured

---

**Setup complete!** ✅

The OAuth providers are now configured. The code will be updated next to use these providers.
