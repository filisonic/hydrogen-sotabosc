# Shopify Hydrogen Deployment Guide

## Current Status
- ✅ **Shopify Store Connected**: `nmnx9b-g3.myshopify.com`
- ✅ **Environment Variables**: Configured in `.env`
- ✅ **GitHub Repository**: `filisonic/hydrogen-sotabosc`
- ✅ **Latest Changes**: Hotspot popups and collection system

## Deployment Options

### Option 1: Shopify Oxygen (Recommended)
1. **Login to Shopify Partner Dashboard**
   - Go to Apps → Hydrogen
   - Select your storefront

2. **Connect GitHub Repository**
   - Settings → Deployments
   - Connect repository: `filisonic/hydrogen-sotabosc`
   - Deploy branch: `main`
   - Auto-deploy on push: ✅ Enabled

3. **Environment Variables** (if needed)
   ```
   PUBLIC_STOREFRONT_ID=1000122453
   PUBLIC_STOREFRONT_API_TOKEN=26db331353674be692c82cb56df4ae3a
   PUBLIC_STORE_DOMAIN=nmnx9b-g3.myshopify.com
   SESSION_SECRET=c0c416fedbe23cf40f99b1291f38e2323c6f5cad
   ```

### Option 2: Manual CLI Deployment
```bash
# Login to Shopify (if not already authenticated)
npx shopify hydrogen login

# List available storefronts
npx shopify hydrogen list

# Link to existing storefront
npx shopify hydrogen link

# Deploy to Oxygen
npx shopify hydrogen deploy
```

### Option 3: Vercel/Netlify (Alternative)
```bash
# Build for production
npm run build

# Deploy to Vercel
npx vercel

# Or deploy to Netlify
npx netlify deploy --prod --dir dist
```

## Environment Setup
Your `.env` file is configured with:
- Storefront API access
- Customer accounts
- External API keys (Google Places, Stitch, Firecrawl)

## Post-Deployment Testing
1. **Test hotspot popups**: Click specimens in the world view
2. **Test collection system**: Discover specimens → View Collection
3. **Test close buttons**: Ensure popups close properly
4. **Test persistence**: Refresh page → collection persists

## Troubleshooting
- **Build errors**: Run `npm run build` locally first
- **Environment variables**: Ensure all required vars are set
- **Storefront API**: Verify token permissions in Shopify admin
- **GitHub connection**: Check repository access permissions

## Performance Optimization
- **Image optimization**: Ensure specimen images are optimized
- **Bundle size**: Monitor build output size
- **Lighthouse scores**: Test performance after deployment