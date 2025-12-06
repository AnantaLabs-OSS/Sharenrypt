# 🎯 Sharencrypt Setup Guide - 100% FREE Configuration

## Quick Start (5 Minutes)

### Prerequisites Check
- ✅ Node.js 14+ installed (`node --version`)
- ✅ npm installed (`npm --version`)
- ✅ Modern browser (Chrome, Firefox, Edge, Safari)

### Installation Steps

```bash
# 1. Clone repository
git clone https://github.com/pragnesh-singh-rajput/Sharenrypt-p2p-file-sharing.git
cd Sharenrypt-p2p-file-sharing

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open browser
# Visit: http://localhost:5173
```

**That's it!** No server setup, no configuration needed! 🚀

---

## Environment Configuration (Already Done!)

The `.env` file is **pre-configured** with 100% FREE services:

### Services Used

#### 1. PeerJS Cloud (FREE Signaling)
```env
VITE_PEER_HOST=0.peerjs.com
VITE_PEER_PORT=443
VITE_PEER_PATH=/
VITE_PEER_SECURE=true
```
- **Purpose**: Helps peers discover each other
- **Cost**: FREE forever
- **Setup**: None required
- **Limit**: Unlimited connections

#### 2. Google STUN Servers (FREE)
```env
VITE_STUN_SERVER_1=stun:stun.l.google.com:19302
VITE_STUN_SERVER_2=stun:stun1.l.google.com:19302
VITE_STUN_SERVER_3=stun:stun2.l.google.com:19302
```
- **Purpose**: NAT traversal (~80% of connections)
- **Cost**: FREE forever
- **Setup**: None required
- **Provided by**: Google

#### 3. OpenRelay TURN Server (FREE)
```env
VITE_TURN_SERVER=turn:openrelay.metered.ca:80
VITE_TURN_USERNAME=openrelayproject
VITE_TURN_CREDENTIAL=openrelayproject
```
- **Purpose**: Fallback when direct connection fails
- **Cost**: FREE (community-run)
- **Setup**: None required
- **Success Rate**: 99%+

---

## Alternative FREE Options

### Option 1: Metered.ca (50GB/month FREE)

Sign up at: https://metered.ca/stun-turn

```env
# After signup, replace with your credentials
VITE_TURN_SERVER=turn:a.relay.metered.ca:80
VITE_TURN_USERNAME=your_username_here
VITE_TURN_CREDENTIAL=your_credential_here
```

Benefits:
- ✅ 50GB free bandwidth/month
- ✅ Better reliability
- ✅ Usage analytics
- ✅ Support

### Option 2: Twilio (FREE Tier)

```env
# Twilio free STUN servers
VITE_STUN_SERVER_1=stun:global.stun.twilio.com:3478
```

---

## Development vs Production

### Development (Current Setup)
```bash
npm run dev
# Runs on http://localhost:5173
```

- ✅ Hot module replacement
- ✅ Fast refresh
- ✅ Debug mode enabled

### Production Build
```bash
npm run build
# Output in ./dist folder
```

- ✅ Optimized bundle
- ✅ Minified code
- ✅ Production-ready

---

## Deployment (100% FREE)

### Option 1: Netlify (Recommended)

1. Build project:
```bash
npm run build
```

2. Deploy to Netlify:
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login and deploy
netlify login
netlify deploy --prod
```

3. Your app is live! 🎉

### Option 2: Vercel

1. Build project:
```bash
npm run build
```

2. Deploy:
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Option 3: GitHub Pages

1. Build project:
```bash
npm run build
```

2. Push `dist` folder to `gh-pages` branch

3. Enable GitHub Pages in repository settings

---

## Testing Your Setup

### 1. Single Browser Test

1. Open `http://localhost:5173`
2. Copy your Peer ID
3. Open **Incognito/Private window**
4. Paste Peer ID and click "Connect"
5. Accept connection
6. Send a test file!

### 2. Two Device Test

1. **Device 1**: Open app, note Peer ID
2. **Device 2**: Open app, click "Show QR"
3. **Device 1**: Click "Scan QR", scan Device 2's code
4. Connection established!
5. Send files back and forth

### 3. Long Distance Test

1. Share app link and your Peer ID with friend abroad
2. They connect to you
3. Test file transfer speed
4. Should work globally!

---

## Troubleshooting

### Issue: "Cannot load PeerJS"
**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Connection failed"
**Solutions:**
- Check internet connection
- Verify Peer ID is correct
- Try refreshing both browsers
- TURN fallback should work automatically

### Issue: "Slow file transfer"
**Solutions:**
- Check internet speed (speedtest.net)
- Close bandwidth-heavy apps
- Use wired connection if possible
- Direct connection is faster than TURN

### Issue: "Build fails"
**Solution:**
```bash
# Clear cache and rebuild
npm run build -- --force
```

---

## FAQ

**Q: Do I need to run a server?**  
A: No! Everything runs in the browser. PeerJS Cloud handles signaling for free.

**Q: What's the file size limit?**  
A: Default is 1GB. Configurable in `.env` (VITE_MAX_FILE_SIZE).

**Q: Does it work on mobile?**  
A: Yes! Works on modern mobile browsers (Chrome, Safari).

**Q: Is it really free?**  
A: Yes! All services used are 100% free forever.

**Q: Can I use custom TURN servers?**  
A: Yes! Update `.env` with your TURN server details.

**Q: How secure is it?**  
A: Very secure! DTLS + AES-GCM 256-bit encryption. No data stored on servers.

**Q: Will it work in China/restricted networks?**  
A: TURN fallback should work in most cases (99%+).

**Q: Can I add more features?**  
A: Yes! It's open source. Add video chat, text chat, rooms, etc.

---

## For Final Year Projects

### Demonstration Tips

1. **Setup Demo Environment**
   - Two laptops or laptop + phone
   - Good internet connection
   - Pre-loaded test files

2. **Talking Points**
   - Explain WebRTC architecture
   - Demonstrate NAT traversal
   - Show encryption in action
   - Compare speeds vs traditional methods

3. **Code Walkthrough**
   - `peerService.ts` - P2P logic
   - `encryption.ts` - Security
   - WebRTC data channels
   - React hooks

4. **Report Sections**
   - Introduction to P2P networking
   - WebRTC technology
   - NAT traversal (STUN/TURN)
   - Encryption algorithms
   - Performance analysis
   - Cost comparison

---

## Advanced Configuration

### Custom File Size Limit
```env
# In .env
VITE_MAX_FILE_SIZE=2147483648  # 2GB
```

### Custom Chunk Size
```env
# In .env
VITE_CHUNK_SIZE=32768  # 32KB (default: 16KB)
```

### Disable Sounds  
```env
VITE_ENABLE_SOUND=false
```

### Enable Analytics
```env
VITE_ENABLE_ANALYTICS=true
```

---

## Performance Tips

### For Faster Transfers

1. **Use Wired Connection** (Ethernet > WiFi)
2. **Close Other Apps** (especially browsers/downloads)
3. **Test Network Speed** (speedtest.net)
4. **Use Modern Browser** (latest Chrome recommended)
5. **Direct Connection** (same network = fastest)

### Memory Optimization

```env
# Reduce chunk size for lower memory usage
VITE_CHUNK_SIZE=8192  # 8KB
```

---

## Next Steps

1. ✅ Test locally with two browser windows
2. ✅ Test with friend on different network
3. ✅ Deploy to production (Netlify/Vercel)
4. ✅ Share with the world!

---

## Need Help?

- 📖 Read the [README](./README.md)
- 🐛 Report issues on [GitHub](https://github.com/pragnesh-singh-rajput/Sharenrypt-p2p-file-sharing/issues)
- 💬 Ask questions in [Discussions](https://github.com/pragnesh-singh-rajput/Sharenrypt-p2p-file-sharing/discussions)

---

**Happy Sharing! 🚀🔒**
