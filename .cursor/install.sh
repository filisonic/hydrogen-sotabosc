#!/usr/bin/env bash
# Idempotent bootstrap for the Hydrogen SOTABOSC storefront.
# Safe to run repeatedly: refreshes dependencies and ensures a local .env exists.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Installing dependencies (npm ci)"
npm ci

# Hydrogen reads runtime configuration from a local .env file. Generate one when
# it is missing so a fresh Cloud Agent boots into a working storefront. Real
# credentials supplied through the Secrets panel are picked up automatically;
# otherwise we fall back to Shopify's public `mock.shop` demo storefront, which
# needs no token and lets the app run end to end without a live store.
if [ ! -f .env ]; then
  echo "==> Creating .env for local development"
  {
    echo "PUBLIC_STORE_DOMAIN=${PUBLIC_STORE_DOMAIN:-mock.shop}"
    echo "SESSION_SECRET=${SESSION_SECRET:-dev-session-secret-change-me}"
    [ -n "${PUBLIC_STOREFRONT_ID:-}" ] && echo "PUBLIC_STOREFRONT_ID=${PUBLIC_STOREFRONT_ID}"
    [ -n "${PUBLIC_STOREFRONT_API_TOKEN:-}" ] && echo "PUBLIC_STOREFRONT_API_TOKEN=${PUBLIC_STOREFRONT_API_TOKEN}"
    [ -n "${PUBLIC_CHECKOUT_DOMAIN:-}" ] && echo "PUBLIC_CHECKOUT_DOMAIN=${PUBLIC_CHECKOUT_DOMAIN}"
    [ -n "${PUBLIC_SUPABASE_URL:-}" ] && echo "PUBLIC_SUPABASE_URL=${PUBLIC_SUPABASE_URL}"
    [ -n "${PUBLIC_SUPABASE_ANON_KEY:-}" ] && echo "PUBLIC_SUPABASE_ANON_KEY=${PUBLIC_SUPABASE_ANON_KEY}"
    [ -n "${SUPABASE_SERVICE_ROLE_KEY:-}" ] && echo "SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}"
  } > .env
else
  echo "==> Reusing existing .env"
fi

echo "==> Install complete"
