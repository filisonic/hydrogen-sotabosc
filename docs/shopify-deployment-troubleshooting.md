# Shopify Hydrogen Deployment Troubleshooting Guide - Sotabosc

## Quick Reference
- **Live Site**: https://sotabosc.world
- **Oxygen URL**: https://sotabosc-4ab3c435310c963bf1b4.o2.myshopify.dev/
- **Repository**: https://github.com/filisonic/hydrogen-sotabosc

## Deployment Status ✅ (Jan 16, 2025)
- Authentication: Fixed (deployment token rotated)
- GitHub Actions: Updated to v5 (Node.js 24 compatibility) 
- Custom Domain: Connected (sotabosc.world)
- Build Issues: Resolved (missing components added)
- Latest Deploy: Major UI update (commit 4bc6b11, 134 files, 28k+ lines)

## Common Issues & Solutions

### 1. GitHub Actions Deprecation Warnings
**Problem**: Node.js 20 actions deprecated
**Solution**: 
- Update to actions v5: `checkout@v5`, `setup-node@v5`, `cache@v5`
- Set Node.js version to "22" (not "lts/*")
- Add environment variable: `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true`

### 2. Deployment Authentication (403 Error)
**Problem**: "Access Denied" from Oxygen GraphQL API
**Solution**:
- Rotate deployment token in Shopify Hydrogen dashboard
- Update both GitHub secrets:
  - `OXYGEN_DEPLOYMENT_TOKEN_1000082773`
  - `OXYGEN_DEPLOYMENT_TOKEN_1000122453`

### 3. Build Failures (Import Errors)
**Problem**: `[vite]: Rollup failed to resolve import`
**Solution**: Missing files not committed to git
- Check `git status` for untracked files
- Add missing components: `git add app/components/directory/DirectorySurface.jsx`
- Add missing libraries: `git add app/lib/seo/`
- Commit and push changes

### 4. Custom Domain Setup
**Problem**: Site shows Shopify URL instead of custom domain
**Solution**:
1. In Shopify Admin → Settings → Domains:
   - Add custom domain (sotabosc.world)
   - Set Target to "Hydrogen storefront"
   - Set Type to "Primary domain"
2. In Hydrogen dashboard:
   - Set environment to "Public"
3. DNS at domain provider:
   - CNAME: `www` → `shops.myshopify.com`
   - A record: `@` → `23.227.38.65`

### 5. Old Version Deployed
**Problem**: Site shows outdated design
**Solution**: Uncommitted local changes
- Run `git status` to see modified files
- Add all changes: `git add app/ public/ .gitignore package.json`
- Commit with descriptive message
- Push to trigger deployment

## Recent Resolution Timeline (Jan 16, 2025)
1. ✅ Fixed Node.js 24 compatibility warnings (workflows updated)
2. ✅ Rotated deployment tokens (403 authentication error resolved)
3. ✅ Added missing components (DirectorySurface, SEO files)
4. ✅ Connected custom domain (sotabosc.world points to Hydrogen)
5. ✅ Deployed major UI update (Barcelona directory, world system)

## Workflow Files
- `/.github/workflows/oxygen-deployment-1000082773.yml`
- `/.github/workflows/oxygen-deployment-1000122453.yml`

Both configured with:
- Node.js 22
- GitHub Actions v5
- Environment variable for Node.js 24 compatibility

## Deployment Process
1. Push to main branch
2. GitHub Actions triggers automatically
3. Build process: ~45 seconds
4. Deploy to Oxygen
5. Available at sotabosc.world (1-4 hours for DNS)

## Troubleshooting Commands
```bash
# Check deployment status
git log --oneline -5
git status

# Local build test
npm run build

# Force redeploy
git commit --allow-empty -m "redeploy"
git push
```

## Key Components That Often Break Builds
- `app/components/directory/DirectorySurface.jsx`
- `app/lib/seo/metaHelpers.js`
- `app/components/world/SpecimenOverlay.jsx`
- Any new route files with imports
- SEO and meta helper utilities

## Notes
- Free Shopify accounts limited to 1 public Hydrogen environment
- DNS changes take 1-48 hours to propagate
- Both workflow files deploy the same content
- Always check git status before assuming deployment issues
- Custom domain requires "Public" setting in Hydrogen environment

## For Future Reference
- Query knowledge graph first: `/graphify query "deployment issue"`
- Use `graphify-out/wiki/index.md` as navigation entry point
- Check CLAUDE.md for project context before troubleshooting

---
*Last updated: 2025-01-16*
*Generated with Claude Code assistance*