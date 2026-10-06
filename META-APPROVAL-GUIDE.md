# Meta (Facebook & Instagram) App Review & Approval Guide

This guide provides a complete, step-by-step checklist and instructions on everything required to get **Meta App Review & Approval** for connecting Facebook Pages and Instagram Business accounts to your social media scheduler.

---

## 📋 Master Checklist of Meta Review Requirements

| # | Required Item | What is it? | How to get/do it? |
|---|---|---|---|
| 1 | **Meta Developer Account & App** | Your developer account & Business app container | Created on `developers.facebook.com` |
| 2 | **Facebook Page & Instagram Account** | Official page for your app + Test accounts for demo | Created on Facebook & Instagram |
| 3 | **Legal Web Pages** | Privacy Policy, Terms, Data Deletion URLs | Built on your website domain |
| 4 | **HTTPS Callback URL** | Secure endpoint for OAuth login | Configured in your app code & Meta Dashboard |
| 5 | **Meta Business Verification** | Official company legal verification | Submitted in Meta Business Settings |
| 6 | **Permission Requests** | The 6 specific API permissions for scheduling | Selected in Meta App Review Dashboard |
| 7 | **Written Justifications** | Short explanations of why you need each API | Written directly in Meta submission form |
| 8 | **Screencast Video** | Video proof of your app connecting & posting | Recorded using screen capture software |
| 9 | **Reviewer Test Credentials** | Demo login info for Meta's testing team | Created in your app database |

---

## 📁 Required Documents Checklist

Here is the exact list of official documents, legal policies, and media assets you must provide:

### 1. Official Business & Corporate Documents (For Business Verification)
Meta requires official government/bank documents to verify your legal business entity. You need **2 documents**:

* **Category A: Proof of Legal Business Name (Provide 1 of these)**:
  * 📄 **Certificate of Incorporation** / Articles of Organization
  * 📄 **Tax Registration Certificate** (GST Certificate, EIN Letter, VAT Registration, or PAN Certificate)
  * 📄 **Government Business License** / Trade License / Shop & Establishment Certificate
  * 📄 **Partnership Deed** or Official Business Registration Certificate

* **Category B: Proof of Legal Address & Phone Number (Provide 1 of these, issued within the last 90 days)**:
  * 📄 **Official Business Bank Statement** (Showing company legal name and registered address)
  * 📄 **Utility Bill** (Electricity, Water, Landline, or Internet bill in company name)
  * 📄 **Government Tax Assessment Notice** / Lease Agreement

> ⚠️ **Critical Rule**: The Legal Name, Address, and Phone Number on these documents **MUST MATCH EXACTLY** with what you type into Meta Business Manager.

---

### 2. Legal Policy Pages & Web Documents (For App Review)
* 🌐 **Privacy Policy**: Explaining how user access tokens and social data are collected and stored.
* 🌐 **Terms of Service**: Terms of use for your software platform.
* 🌐 **Data Deletion Instructions**: Step-by-step instructions or automated callback endpoint for user data purging.

---

### 3. Media Assets & Verification Credentials (For App Review Submission)
* 🖼️ **App Logo / Icon**: High-resolution `1024 x 1024 px` PNG or JPG file.
* 🎥 **Screencast Video File**: 2–3 minute `.mp4` screen recording demonstrating OAuth login, permission consent, post scheduling, and live publication.
* 🔑 **Reviewer Test Credentials**: Login email, password, and instructions for Meta reviewers.

---

## 🛠️ Detailed Step-by-Step Instructions for Each Item

---

### Step 1: Meta Developer Account & Business App

* **What it is**: Your account on Meta's developer platform and the Meta App container that provides your `Client ID` (App ID) and `Client Secret`.
* **How to create it**:
  1. Go to **[developers.facebook.com](https://developers.facebook.com)** and log in with your Facebook account.
  2. Click **"Get Started"** (or "My Apps") in the top right.
  3. Click **"Create App"**.
  4. Select **App Type**: Choose **"Business"** (or *Other > Business*).
  5. Enter your **App Name** (e.g., `Agent Elephant`) and your business email.
  6. Click **Create App**.

---

### Step 2: Facebook Page & Linked Instagram Business Account

* **What it is**: 
  1. **Official Facebook Page**: Represents your company/app on Facebook and links to your Meta App.
  2. **Test Page + Instagram Account**: Used by you and Meta reviewers to test publishing posts.
* **How to create them**:

  #### A. Create the Facebook Page:
  1. Go to **[facebook.com/pages/create](https://facebook.com/pages/create)**.
  2. Enter **Page Name** (e.g., `Agent Elephant`), Category (`Software Company` or `Social Media Agency`).
     > ⚠️ **Important Naming Rule**: Do NOT use trademarked words like "Facebook", "FB", "Instagram", "IG", or "Meta" in your Page name.
  3. Upload your app logo as Profile Picture and a cover banner image.
  4. Fill in your website link (`https://yourdomain.com`) and click **Create Page**.
  5. Post 2–3 public posts on the page so it appears active to Meta reviewers.

  #### B. Create & Link Instagram Business Account:
  1. On your phone or Instagram web, create an Instagram account for your app.
  2. Go to **Settings > Account > Switch to Professional Account**.
  3. Choose **Business** or **Creator**.
  4. Go to **Edit Profile > Public Business Information > Page** and select the Facebook Page created above to link them.

---

### Step 3: Legal Pages on Your Website

* **What it is**: 3 mandatory public web pages on your domain explaining user privacy, terms, and data removal.
* **How to create them**:

  1. **Privacy Policy Page** (`https://yourdomain.com/privacy`):
     * Create a page on your website stating what user data you collect (Facebook access tokens, page IDs, post content) and how it is stored/protected.
  2. **Terms of Service Page** (`https://yourdomain.com/terms`):
     * Create a page detailing terms of use for your app.
  3. **Data Deletion Instructions Page** (`https://yourdomain.com/data-deletion`):
     * Create a simple page explaining how users can delete their data.
     * *Example text*: `"To remove your data from Agent Elephant, log into your account, go to Settings > Connected Accounts, and click 'Disconnect Facebook'. Alternatively, email support@yourdomain.com to request full data deletion."*
  4. Copy these 3 URLs and paste them into your Meta Developer Dashboard under **Settings > Basic**.

---

### Step 4: HTTPS Callback URL (OAuth Redirect)

* **What it is**: The secure URL on your web server where Facebook sends the user after they click "Approve" during login.
* **How to set it up**:
  1. Ensure your web app has an API route set up for Facebook OAuth callback (e.g., `https://yourdomain.com/api/settings/social/callback/facebook` or `https://yourdomain.com/api/auth/callback/facebook`).
  2. In Meta Developer Dashboard, go to **Add Product > Facebook Login for Business** (or *Use Cases > Authenticate and manage accounts*).
  3. Under **Facebook Login > Settings**, find **Valid OAuth Redirect URIs**.
  4. Paste your live production callback URL: `https://yourdomain.com/api/auth/callback/facebook`.
  5. Save changes.

---

### Step 5: Meta Business Verification

* **What it is**: Official legal verification by Meta confirming that your business exists.
* **How to complete it**:
  1. Go to **[business.facebook.com](https://business.facebook.com)** (Meta Business Suite).
  2. Navigate to **Settings > Security Center**.
  3. Under **Business Verification**, click **Start Verification**.
  4. Enter your Official Legal Business Name, Address, Phone Number, and Website.
  5. Upload official legal documents (e.g., Certificate of Incorporation, Tax Registration/GST, Utility Bill).
  6. Verify ownership via Email code (sent to your business domain email) or Domain Verification (adding a meta tag to your website header).
  7. Wait **2 to 7 business days** for Meta to approve your business.

---

### Step 6: Request the 6 Specific API Permissions

* **What it is**: Selecting the exact API capabilities your social scheduler needs.
* **How to request them**:
  1. Go to Meta Developer Dashboard > **App Review > Permissions and Features**.
  2. Search for and click **"Request Advanced Access"** for these 6 permissions:
     * `pages_show_list` (List Facebook Pages)
     * `pages_manage_posts` (Publish/Schedule to Facebook Pages)
     * `pages_read_engagement` (Verify post statuses)
     * `instagram_basic` (Read IG account info)
     * `instagram_content_publish` (Publish/Schedule photos, videos, & Reels to IG)
     * `business_management` (Connect linked business assets)

---

### Step 7: Written Justifications (For Each Permission)

* **What it is**: Brief written explanations in the Meta form answering *why* your app requires each permission.
* **How to write them**:
  * In the App Review submission page, click **Edit** next to each permission and fill out the text box.
  * **Templates you can copy**:
    * **For `pages_manage_posts`**: `"Our application is a social media management and scheduling platform. This permission allows our backend system to automatically publish user-scheduled posts and media directly to their Facebook Page at their chosen date and time."`
    * **For `instagram_content_publish`**: `"Our application allows business users to compose and schedule Instagram content. This permission allows our application to upload and publish photos, videos, and Reels directly to the user's linked Instagram Business profile."`

---

### Step 8: Screencast Video Recording (Screen Capture)

* **What it is**: A 2-to-3 minute screen recording MP4 video showing your app's complete end-to-end flow.
* **How to record it**:
  1. Use any screen recorder (e.g., Loom, OBS Studio, QuickTime, or Windows Game Bar `Win + G`).
  2. Record the following continuous workflow:
     * **Start**: Show your app dashboard.
     * **Step 1**: Click **"Connect Facebook / Instagram"**.
     * **Step 2**: Show the official Facebook OAuth dialog popup (ensure the browser URL bar showing `facebook.com/dialog/oauth` is clearly visible).
     * **Step 3**: Grant permissions and show redirecting back to your app.
     * **Step 4**: Show the connected Facebook Page and Instagram account in your app interface.
     * **Step 5**: Create a post, type text, attach an image/video, select a target Page/Instagram account, and click **"Publish Now"**.
     * **Step 6**: Open a new browser tab, go to the live Facebook Page and Instagram profile, and show that the post **actually appeared live**.
  3. Export as `.mp4` and upload it to the Meta App Review submission draft.

---

### Step 9: Demo Account Credentials for Meta Reviewers

* **What it is**: Login credentials so Meta reviewers can log into your web app and manually test the publishing feature.
* **How to provide it**:
  1. Create a demo user account inside your app database (e.g., `meta_reviewer@yourdomain.com` / `Password123!`).
  2. Make sure this test user is connected to a test Facebook Page & Instagram account in your environment.
  3. In the Meta Dashboard submission page under **Test Credentials**, enter:
     * **App Login URL**: `https://yourdomain.com/login`
     * **Username**: `meta_reviewer@yourdomain.com`
     * **Password**: `Password123!`
     * **Instructions**: Provide 2-3 bullet points telling the reviewer where to click to test posting.

---

## 🚀 Final Step: Submit for Review

Once all 9 steps are complete:
1. Review your draft in the **App Review** section of your Meta Developer Dashboard.
2. Click **Submit for Review**.
3. You will receive an email update from Meta within **1 to 5 business days**.
