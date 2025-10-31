# Deploying to Netlify with Firebase

Your application is now ready to deploy to Netlify with Firebase Firestore as the backend database!

## ✅ What's Ready

- Frontend: Static HTML/CSS/JS files
- Backend API: Netlify Functions in `api/` folder
- Database: Firebase Firestore (serverless, no MySQL needed!)
- Service Account: `serviceAccountKey.json` (already configured locally)

## 🚀 Deployment Steps

### 1. Prepare Firebase Service Account for Netlify

Since Netlify uses environment variables, you need to convert your service account JSON to a single-line string:

**Option A: PowerShell (Windows)**
```powershell
$json = Get-Content .\backend\serviceAccountKey.json -Raw
$minified = $json -replace '\s+', ' '
Write-Host $minified
```

**Option B: Manual**
1. Open `backend/serviceAccountKey.json`
2. Copy the entire content
3. Remove all newlines and extra spaces (make it one line)
4. Keep it ready for the next step

### 2. Deploy to Netlify via Web UI

1. **Push to GitHub:**
   ```powershell
   git push origin Master
   ```

2. **Go to Netlify:**
   - Visit https://app.netlify.com/
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub account
   - Select your repository: `hmahmoud2211/ESC`

3. **Configure Build Settings:**
   - **Build command:** `echo 'Static site - no build needed'`
   - **Publish directory:** `.` (root directory)
   - **Functions directory:** `api` (already in netlify.toml)

4. **Set Environment Variables:**
   
   Go to Site settings → Build & deploy → Environment variables, add:
   
   ```
   FIREBASE_SERVICE_ACCOUNT
   Value: <paste the minified JSON from step 1>
   
   GROQ_API_KEY
   Value: <your Groq API key from backend/.env>
   
   JWT_SECRET
   Value: <your JWT secret or generate a new one>
   ```
   
   **Note:** Get your actual GROQ_API_KEY from `backend/.env` file

5. **Deploy Site:**
   - Click "Deploy site"
   - Wait for deployment to complete
   - Your site will be live at `https://your-site-name.netlify.app`

### 3. Deploy via Netlify CLI (Alternative)

```powershell
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy (from project root)
netlify deploy --dir="."

# When prompted, create a new site or link to existing

# Deploy to production
netlify deploy --prod --dir="."
```

## 🔧 Post-Deployment

### Initialize Firebase Database

After deployment, you need to create the admin user and sample products in Firebase. You can either:

**Option 1: Run locally (data will be in Firebase, accessible by deployed site)**
```powershell
cd backend
node createAdmin.js
node createSampleProducts.js
```

**Option 2: Use Firebase Console**
- Go to https://console.firebase.google.com/
- Select your project: `escgit-92136988-20ce9`
- Go to Firestore Database
- Manually create collections and documents

### Test Your Deployment

1. Visit your Netlify URL
2. Try registering a new user
3. Login with admin credentials (admin@example.com / admin123)
4. Browse products
5. Test the chatbot

## 📋 Important Notes

### Security
- ✅ `serviceAccountKey.json` is in `.gitignore` (never committed)
- ✅ API key in environment variables (not in code)
- ✅ Firebase security rules should be configured

### Firebase Firestore Security Rules

In Firebase Console → Firestore Database → Rules, set:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if true;
      allow write: if true;
    }
    
    match /products/{productId} {
      allow read: if true;
      allow write: if true;
    }
    
    match /orders/{orderId} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

**Note:** These rules allow all access for development. Tighten them for production!

### Troubleshooting

**Issue: "Firebase service account not configured"**
- Make sure `FIREBASE_SERVICE_ACCOUNT` is set in Netlify environment variables
- Verify the JSON is properly formatted (one line, valid JSON)

**Issue: "Function timeout"**
- Firebase initialization might take time on cold starts
- Increase function timeout in `netlify.toml` if needed

**Issue: API calls failing**
- Check Netlify Function logs: Site → Functions → View logs
- Verify environment variables are set correctly

## 🎯 Benefits of Firebase + Netlify

- ✅ **No server management** - Both are serverless
- ✅ **Auto-scaling** - Handles traffic spikes automatically
- ✅ **Global CDN** - Fast worldwide delivery
- ✅ **Free tier** - Both offer generous free plans
- ✅ **HTTPS** - Automatic SSL certificates
- ✅ **Easy rollbacks** - Deploy history in Netlify
- ✅ **Real-time updates** - Firebase supports real-time sync

## 📊 Monitoring

- **Netlify Analytics:** Site → Analytics
- **Netlify Functions:** Site → Functions → Logs
- **Firebase Usage:** Firebase Console → Usage and billing
- **Firebase Logs:** Firebase Console → Firestore → Usage

## 🔄 Continuous Deployment

Every push to your `Master` branch will automatically trigger a new deployment on Netlify!

```powershell
git add .
git commit -m "Update features"
git push origin Master
# Netlify automatically deploys! 🎉
```

---

**Your site is ready for the world! 🚀**
