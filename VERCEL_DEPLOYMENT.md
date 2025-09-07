# Event Karo - Complete Vercel Deployment Guide

This guide deploys your entire Event Karo project to Vercel with your existing MongoDB and credentials.

## Prerequisites
- GitHub account
- Vercel account (free)
- Your project pushed to GitHub

## Step 1: Push to GitHub (if not done)

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

## Step 2: Deploy Backend API

1. **Go to Vercel Dashboard** → New Project
2. **Import from GitHub** → Select your `Event Karo` repository
3. **Project Settings:**
   - Framework Preset: **Other**
   - Root Directory: **/** (leave empty)
   - Build Command: (leave empty)
   - Output Directory: (leave empty)
   - Install Command: `npm install`

4. **Environment Variables** (copy-paste these exactly):
```
MONGODB_URI=mongodb+srv://rajvishwakarma303_db_user:adminhere@eventkaro.fv1tdjg.mongodb.net/eventkaro?retryWrites=true&w=majority&appName=EventKaro
JWT_SECRET=your-super-secret-jwt-key-change-this-32-chars-minimum-for-production
NODE_ENV=production
JWT_EXPIRE=7d
STRIPE_SECRET_KEY=
```

5. **Deploy** → Note your backend URL (e.g., `https://event-karo-abc123.vercel.app`)

## Step 3: Deploy Frontend

1. **Go to Vercel Dashboard** → New Project
2. **Import from GitHub** → Select your same `Event Karo` repository again
3. **Project Settings:**
   - Framework Preset: **Vite**
   - Root Directory: **frontend**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Environment Variables** (replace with YOUR backend URL):
```
VITE_API_URL=https://your-backend-project.vercel.app/api
```

5. **Deploy**

## Step 4: Update JWT Secret (IMPORTANT)

Generate a strong JWT secret:

```bash
# Windows PowerShell
[System.Web.Security.Membership]::GeneratePassword(32, 0)

# Or online generator: https://generate-secret.vercel.app/32
```

Update your backend Vercel project:
- Settings → Environment Variables → Edit `JWT_SECRET`
- Paste the new secret → Save
- Redeploy from Deployments tab

## Step 5: Test the Deployment

**Backend Health Check:**
Visit: `https://your-backend-project.vercel.app/api/health`
Expected: `{"status":"ok","timestamp":"..."}`

**Frontend:**
Visit your frontend URL and test:
1. Register as organizer
2. Create an event
3. Register as attendee  
4. RSVP to the event
5. Check analytics

## Complete API Testing with Your URLs

Replace `YOUR_BACKEND_URL` with your actual backend URL:

### 1. Register Organizer
```bash
POST https://YOUR_BACKEND_URL/api/auth/register
Content-Type: application/json

{
  "name": "Test Organizer",
  "email": "organizer@test.com", 
  "password": "Password123!",
  "role": "organizer"
}
```

### 2. Login & Get Token
```bash
POST https://YOUR_BACKEND_URL/api/auth/login
Content-Type: application/json

{
  "email": "organizer@test.com",
  "password": "Password123!"
}
```

### 3. Create Event (use token from step 2)
```bash
POST https://YOUR_BACKEND_URL/api/events
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE

{
  "title": "Test Event",
  "description": "A test event for deployment verification",
  "date": "2025-12-15T15:00:00.000Z",
  "location": "New York, NY", 
  "seats": 100,
  "price": 0,
  "category": "workshop"
}
```

## Your Project Structure on Vercel

```
Backend Project (/)
├── api/[[...slug]].js → Serverless function
├── src/ → Your API code
├── uploads/ → Static files (ephemeral)
└── vercel.json → Routes config

Frontend Project (/frontend)
├── dist/ → Built static files  
├── src/ → React TypeScript code
└── vercel.json → Build config
```

## Environment Variables Summary

**Backend (Required):**
- `MONGODB_URI` - Your existing MongoDB Atlas connection
- `JWT_SECRET` - Strong random string (32+ chars)  
- `NODE_ENV=production`

**Frontend (Required):**
- `VITE_API_URL` - Your backend project URL + `/api`

**Optional for both:**
- Stripe keys (for real payments)

## Troubleshooting

**Backend 500 errors:** Check Vercel Function Logs for JWT_SECRET or MongoDB connection issues

**Frontend can't connect:** Verify `VITE_API_URL` points to your backend + `/api`

**CORS errors:** Your backend already has `cors()` middleware enabled

**MongoDB connection:** Your existing connection string works - no changes needed

## Post-Deployment Notes

- **File uploads** (`/uploads`) are ephemeral on Vercel. For production, integrate Cloudinary/S3
- **Environment variables** are encrypted and secure on Vercel
- **Automatic deployments** happen on every Git push
- **Custom domains** can be added in Project Settings

Your Event Karo app will be fully functional with user registration, event creation, RSVP system, and organizer analytics!
