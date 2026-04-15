# Claude Context - Hydrogen SOTABOSC Project

## 🎯 Project Overview
**Type**: Shopify Hydrogen v2 e-commerce site
**Domain**: SOTABOSC (Barcelona cultural directory)
**Framework**: React Router, Shopify Storefront API
**Status**: `#status/active` Development phase

## 📁 Project Structure
```
app/
├── components/          # React components
│   ├── directory/      # Directory listing components  
│   ├── home/           # Homepage components
│   └── world/          # Interactive world visualization
├── routes/             # File-based routing
│   ├── products.$handle.jsx  # ✅ Product detail pages
│   ├── city.*.jsx      # Directory sections
│   └── _index.jsx      # Homepage
├── lib/                # Utilities & data
└── styles/             # CSS files
```

## 🔧 Current State
- **Product routing**: ✅ Working (`products.$handle.jsx`)
- **Directory system**: 🔄 Active development
- **World visualization**: 🔄 Active development
- **Performance**: ⚠️ Needs optimization

## 🐛 Known Issues
- Performance bottlenecks in world rendering `#priority/high`
- Mobile responsive improvements needed `#priority/medium`
- SEO optimization pending `#priority/low`

## 🏗️ Architecture
- **Frontend**: React 18, Hydrogen v2
- **Backend**: Shopify Storefront API
- **Styling**: CSS modules, custom properties
- **State**: React hooks, context where needed

## 🔗 Key Files
| File | Purpose | Status |
|------|---------|--------|
| `products.$handle.jsx` | Product detail pages | ✅ Working |
| `_index.jsx` | Homepage | 🔄 Development |
| `loadCriticalData.js` | Data fetching utility | ✅ Working |
| `world/` components | Interactive visualization | 🔄 Active work |

## 🎨 Design System
- **Colors**: Earth tones, nature-inspired palette
- **Typography**: Modern, accessible fonts
- **Components**: Modular, reusable design
- **Responsive**: Mobile-first approach

## 📊 Performance Targets
- **Load time**: <3s on 3G
- **Bundle size**: <500KB initial
- **Lighthouse**: >90 performance score
- **Core Web Vitals**: Green across all metrics

## 🔄 Recent Changes
- Fixed product routing 404 issues
- Implemented proper error handling
- Added debugging for route matching
- Optimized component structure

## 📝 Notes
- Uses file-based routing convention
- Shopify Storefront API for product data
- Custom world visualization system
- Barcelona cultural directory integration