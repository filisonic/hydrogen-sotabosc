# Opens Shopify Admin pages for membership go-live.
# Run: powershell -File scripts/setup-membership-live.ps1

$Store = "nmnx9b-g3"
$ProductId = "10785070907735"
$WebhookUrl = "https://sotabosc.world/api/webhooks/shopify/orders-paid"

Write-Host ""
Write-Host "=== Sotabosc membership go-live ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1 - Enable product + monthly subscription" -ForegroundColor Yellow
Write-Host "  - Set status to Active"
Write-Host "  - Publish to Online Store"
Write-Host "  - Inventory: Continue selling when out of stock"
Write-Host "  - Subscriptions app: add EUR 50 / month selling plan"
$productUrl = "https://admin.shopify.com/store/$Store/products/$ProductId"
Write-Host "  Opening: $productUrl"
Start-Process $productUrl

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "Step 2 - Create orders/paid webhook" -ForegroundColor Yellow
Write-Host "  Event: Order payment"
Write-Host "  URL:   $WebhookUrl"
Write-Host "  Copy the signing secret into .env as SHOPIFY_WEBHOOK_SECRET"
$webhookUrl = "https://admin.shopify.com/store/$Store/settings/notifications"
Write-Host "  Opening: $webhookUrl"
Start-Process $webhookUrl

Write-Host ""
Write-Host "Step 3 - Update .env then run in your terminal:" -ForegroundColor Yellow
Write-Host "  npx shopify hydrogen env push --env production"
Write-Host "  npx shopify hydrogen deploy --env production --env-file .env -f"
Write-Host ""

$repoRoot = Split-Path $PSScriptRoot -Parent
$envPath = Join-Path $repoRoot ".env"
if (Test-Path $envPath) {
  $envContent = Get-Content $envPath -Raw
  if ($envContent -match "SUPABASE_SERVICE_ROLE_KEY=eyJ") {
    Write-Host "OK: SUPABASE_SERVICE_ROLE_KEY is set in .env" -ForegroundColor Green
  } else {
    Write-Host "TODO: Add SUPABASE_SERVICE_ROLE_KEY to .env" -ForegroundColor Red
  }
  if ($envContent -match "SHOPIFY_WEBHOOK_SECRET=\S+") {
    Write-Host "OK: SHOPIFY_WEBHOOK_SECRET is set in .env" -ForegroundColor Green
  } else {
    Write-Host "TODO: Add SHOPIFY_WEBHOOK_SECRET after creating the webhook" -ForegroundColor Yellow
  }
}

Write-Host ""
Write-Host "Step 4 - Smoke test: https://sotabosc.world/membership" -ForegroundColor Yellow
Write-Host ""
