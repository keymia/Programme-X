$ErrorActionPreference = "Stop"

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupDir = Join-Path $PSScriptRoot "archives"
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

if (-not $env:DATABASE_URL) {
  throw "DATABASE_URL is required"
}

$file = Join-Path $backupDir "bmc-backup-$timestamp.sql"
pg_dump "$env:DATABASE_URL" --no-owner --no-privileges --format=plain --file="$file"
Write-Host "Backup created: $file"

