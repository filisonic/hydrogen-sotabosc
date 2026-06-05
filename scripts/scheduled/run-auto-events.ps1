# Runs the Sotabosc auto-events pipeline (refresh URLs + sync + prune).
# Logs append to reports/auto-events-pipeline.log

$ErrorActionPreference = 'Stop'
$Root = Resolve-Path (Join-Path $PSScriptRoot '..\..')
Set-Location $Root

$LogDir = Join-Path $Root 'reports'
if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir | Out-Null }
$LogFile = Join-Path $LogDir 'auto-events-pipeline.log'

$stamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
"[$stamp] === pipeline start ===" | Out-File -FilePath $LogFile -Append -Encoding utf8

try {
  npm run pipeline:auto-events 2>&1 | Tee-Object -FilePath $LogFile -Append
  $exit = $LASTEXITCODE
} catch {
  "[$stamp] ERROR: $_" | Out-File -FilePath $LogFile -Append -Encoding utf8
  exit 1
}

$stampEnd = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
"[$stampEnd] === pipeline end (exit $exit) ===" | Out-File -FilePath $LogFile -Append -Encoding utf8
exit $exit
