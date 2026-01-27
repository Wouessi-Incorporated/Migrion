# MIGRION Deployment Fixes

## Issues Fixed

### 1. React Hooks in Server Components 
**Problem**: Pages were using the Header component (which has hooks) but weren't marked as Client Components
**Solution**: Added 'use client' directive to:
  - apps/web/src/app/page.tsx (home page)
  - apps/web/src/app/countries/page.tsx

### 2. ESLint Configuration Issues 
**Problem**: ESLint 9.39.2 doesn't support deprecated options like 'useEslintrc', 'extensions', 'resolvePluginsRelativeTo'
**Solution**: 
  - Updated .eslintrc.json (root) to remove deprecated options
  - Updated apps/web/.eslintrc.json to inherit from core-web-vitals properly

### 3. ESLint Config Package Version Mismatch 
**Problem**: eslint-config-next was version 16.1.5 but Next.js is 14.2.5
**Solution**: Updated apps/web/package.json to use eslint-config-next@^14.2.5

## Files Modified

1. apps/web/src/app/page.tsx - Added 'use client' directive
2. apps/web/src/app/countries/page.tsx - Added 'use client' directive  
3. .eslintrc.json - Updated configuration
4. apps/web/.eslintrc.json - Updated configuration
5. apps/web/package.json - Updated eslint-config-next version

## Next Steps

Run the following to rebuild:
  cd C:\Users\user\Downloads\migrion
  npm install  (in the root to update lockfiles)
  docker-compose up -d --build

## What was happening:

The Next.js build was failing during static page generation because:
1. Pages were importing components with React hooks (useState, useContext, etc.)
2. These pages weren't marked as 'use client', so Next.js tried to render them as Server Components
3. Server Components can't use React hooks, causing TypeError: Cannot read properties of null (reading 'useContext')
4. Additionally, the ESLint configuration had deprecated options that new versions don't support
