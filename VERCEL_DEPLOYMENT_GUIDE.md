# Vercel Deployment Troubleshooting Guide

## Issue: Airtable Data Not Updating & Missing ELO/Weight

This guide helps you debug and fix deployment issues where your Vercel app isn't showing updated Airtable data or missing ELO/weight fields.

## 🔍 Debug Steps

### 1. Test the Debug Endpoint

Visit your deployed app and go to: `https://your-app.vercel.app/api/debug-vercel`

This endpoint will show you:
- Environment variables status
- Airtable connection test
- ELO/weight field analysis
- Deployment information
- Specific recommendations

### 2. Check Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Verify these variables are set:
   - `AIRTABLE_API_KEY` - Your Airtable API key
   - `AIRTABLE_BASE_ID` - Your Airtable base ID
   - `DASHBOARD_PASSWORD` - Your dashboard password
   - `JWT_SECRET` - A secure random string

### 3. Verify Airtable Setup

Make sure your Airtable base has these fields in the "Applicants" table:
- `applicant_name` (Text)
- `email` (Email)
- `year` (Number)
- `major` (Text)
- `elo` (Number) - **This field might be missing**
- `weight` (Number) - **This field might be missing**
- `status` (Single select: "Rejected", "Ongoing")
- `created_at` (Created time)

### 4. Test Airtable Connection

Visit these endpoints to test your Airtable connection:
- `https://your-app.vercel.app/api/test-airtable` - Basic connection test
- `https://your-app.vercel.app/api/test-airtable-detailed` - Detailed connection test
- `https://your-app.vercel.app/api/test-data` - Data structure analysis

## 🛠️ Common Solutions

### Solution 1: Missing ELO/Weight Fields

If ELO and weight are not showing up:

1. **Check if fields exist in Airtable:**
   - Open your Airtable base
   - Go to the "Applicants" table
   - Check if "elo" and "weight" columns exist
   - If not, create them as Number fields

2. **Add sample data:**
   - Add some test ELO ratings (e.g., 1200, 1500, 1800)
   - Add some test weight values (e.g., 1, 2, 3)

### Solution 2: Data Not Updating

If data isn't updating:

1. **Force a new deployment:**
   - Go to Vercel dashboard
   - Click "Redeploy" on your latest deployment
   - Or push a new commit to trigger redeployment

2. **Clear Vercel cache:**
   - In Vercel dashboard, go to your project
   - Go to Settings > Functions
   - Clear the cache if available

3. **Check for caching issues:**
   - The app now has aggressive cache-busting headers
   - Try hard refresh (Ctrl+F5 or Cmd+Shift+R)

### Solution 3: Environment Variables Not Working

1. **Verify variable names:**
   - Make sure they're exactly: `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`, etc.
   - No extra spaces or typos

2. **Check variable values:**
   - Airtable API key should start with `key...`
   - Base ID should start with `app...`
   - Test with the debug endpoint

3. **Redeploy after changes:**
   - Environment variable changes require a new deployment
   - Trigger a redeploy after updating variables

## 🔧 Advanced Debugging

### Check Vercel Logs

1. Go to Vercel dashboard
2. Select your project
3. Go to Functions tab
4. Check the logs for errors

### Test API Endpoints Directly

Test these endpoints in your browser:
- `/api/debug` - Environment check
- `/api/test-airtable` - Airtable connection
- `/api/applicants` - Main data endpoint (requires auth)

### Browser Developer Tools

1. Open browser dev tools (F12)
2. Go to Network tab
3. Refresh the page
4. Look for failed requests or errors
5. Check the Console tab for JavaScript errors

## 📋 Checklist

- [ ] Environment variables are set in Vercel
- [ ] Airtable API key is valid and has proper permissions
- [ ] Airtable base ID is correct
- [ ] ELO and weight fields exist in Airtable
- [ ] Sample data exists in Airtable
- [ ] App has been redeployed after changes
- [ ] Cache has been cleared
- [ ] Debug endpoint shows successful connection

## 🚨 Emergency Fixes

### Quick Redeploy
```bash
# If you have the repo locally:
git commit --allow-empty -m "Force redeploy"
git push origin main
```

### Clear All Caches
1. Vercel dashboard > Project > Settings > Functions
2. Clear cache if available
3. Redeploy the project

### Reset Environment Variables
1. Delete all environment variables in Vercel
2. Re-add them one by one
3. Redeploy

## 📞 Getting Help

If issues persist:

1. Check the debug endpoint: `/api/debug-vercel`
2. Look at Vercel function logs
3. Test Airtable connection directly
4. Verify all environment variables
5. Check browser console for errors

The debug endpoint will give you specific recommendations based on your current setup.
