# Registers a Windows Scheduled Task: daily auto-events pipeline at 06:30.
# Run once in PowerShell (Admin recommended if registration fails):
#   Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
#   .\scripts\scheduled\register-auto-events-task.ps1

$ErrorActionPreference = 'Stop'
$TaskName = 'Sotabosc-AutoEvents'
$Root = Resolve-Path (Join-Path $PSScriptRoot '..\..')
$Runner = Join-Path $PSScriptRoot 'run-auto-events.ps1'

if (-not (Test-Path $Runner)) {
  Write-Error "Missing runner script: $Runner"
}

$Action = New-ScheduledTaskAction `
  -Execute 'powershell.exe' `
  -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$Runner`"" `
  -WorkingDirectory $Root

$Trigger = New-ScheduledTaskTrigger -Daily -At '06:30'

$Settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -StartWhenAvailable `
  -ExecutionTimeLimit (New-TimeSpan -Hours 2)

$Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

$existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existing) {
  Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

Register-ScheduledTask `
  -TaskName $TaskName `
  -Action $Action `
  -Trigger $Trigger `
  -Settings $Settings `
  -Principal $Principal `
  -Description 'Sotabosc: refresh event URLs and sync auto-import.events.json' | Out-Null

Write-Host "Registered scheduled task: $TaskName"
Write-Host "  Daily at 06:30"
Write-Host "  Runner: $Runner"
Write-Host "  Log:    $Root\reports\auto-events-pipeline.log"
Write-Host ""
Write-Host "Test now:  Start-ScheduledTask -TaskName '$TaskName'"
Write-Host "Remove:    Unregister-ScheduledTask -TaskName '$TaskName' -Confirm:`$false"
