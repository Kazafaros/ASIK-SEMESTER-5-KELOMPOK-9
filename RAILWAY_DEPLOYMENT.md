# 🚀 Panduan Deploy MarineEcoPredict ke Railway

Railway adalah platform deployment yang simple, gratis, dan powerful untuk Node.js applications.

## 📋 Prasyarat
- GitHub account dengan repository ini sudah ter-push
- Railway account (gratis signup di https://railway.app)

## 🎯 Langkah-langkah Deployment

### **1. Buat Railway Account**
- Buka https://railway.app
- Klik "**Start Project**"
- Pilih "Deploy from GitHub repo"
- Atau login dengan GitHub account

### **2. Connect GitHub Repository**
- Authorize Railway untuk akses GitHub
- Cari repository: `ASIK-SEMESTER-5-KELOMPOK-9`
- Klik "**Deploy Now**"

### **3. Konfigurasi Project di Railway**

#### **3.1 Tentukan Starting Directory (penting!)**
- Di Railway Dashboard, masuk ke Project settings
- Cari "**Root Directory**" atau "**Start Command**"
- Set ke: `backend` (karena server.js ada di backend folder)

#### **3.2 Atau, Create `railway.json` di root project**
Jika Railway tidak auto-detect, create file ini:

```json
{
  "build": {
    "builder": "dockerfile"
  },
  "deploy": {
    "startCommand": "cd backend && npm start"
  }
}
```

Atau lebih simple, buat `.railway/railway.json`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "nixpacks",
    "watchPatterns": ["backend/**"]
  },
  "deploy": {
    "numReplicas": 1,
    "restartPolicyType": "on_failure",
    "restartPolicyMaxRetries": 3,
    "startCommand": "cd backend && npm start"
  }
}
```

### **4. Environment Variables di Railway**

1. Di Railway Dashboard → Project → Variables
2. Tambah variable:
   ```
   PORT = 3000
   NODE_ENV = production
   ```

### **5. Generate Domain**
- Railway akan auto-generate domain seperti: `your-project-abc123.up.railway.app`
- Buka domain tersebut di browser
- Jika muncul website MarineEcoPredict, deployment **BERHASIL!** ✅

## ✅ Testing Deployment

### **Test Website**
```
https://your-project-abc123.up.railway.app
```

### **Test API**
```
https://your-project-abc123.up.railway.app/api/hsi/available
```

## 🔧 Jika Ada Error

### **Error: Cannot find module**
```bash
# SSH ke Railway dan jalankan:
cd backend && npm install
```

### **Port tidak terbuka**
- Pastikan server listening pada `0.0.0.0` (sudah ada di server.js)
- Railway akan auto-map ke port 3000

### **Static files tidak serving**
- Pastikan `express.static()` middleware sudah benar di server.js
- Check apakah path ke frontend files benar

### **Lihat Logs**
- Railway Dashboard → Deployments → View Logs
- Lihat error message di sana

## 🌐 Custom Domain (Optional)

1. Beli domain di Namecheap/Google Domains/dll
2. Di Railway Dashboard → Settings → Domains
3. Tambah domain custom
4. Update DNS settings sesuai instruksi Railway

## 💾 Database (Jika Diperlukan di Masa Depan)

Railway juga support:
- PostgreSQL
- MongoDB
- MySQL
- Redis

Bisa ditambahkan langsung dari Railway Dashboard.

## 📊 Monitoring

Railway Dashboard bisa monitor:
- CPU/Memory usage
- Request rate
- Error logs
- Uptime status

## 🎯 Deployment Checklist

- [ ] GitHub repository ter-push
- [ ] Railway account sudah jadi
- [ ] Project connected dari GitHub
- [ ] Root directory/start command sudah set
- [ ] Environment variables sudah configured
- [ ] Domain ter-generate
- [ ] Test website: `https://domain/` 
- [ ] Test API: `https://domain/api/hsi/available`
- [ ] Logs tidak ada error

---

## 📞 Support

Jika ada issue:
1. Cek Railway logs (Dashboard → Deployments → Logs)
2. Pastikan `npm install` berhasil
3. Check server.js PORT configuration
4. Verify static file path ke frontend

**Good luck! 🚀**
