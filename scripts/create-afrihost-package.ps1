param(
  [string]$OutputDir = "deploy",
  [string]$PackageName = "nextgen-afrihost-upload.zip"
)

$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$staging = Join-Path $root $OutputDir
$packagePath = Join-Path $root $PackageName

if (Test-Path $staging) {
  Remove-Item $staging -Recurse -Force
}

if (Test-Path $packagePath) {
  Remove-Item $packagePath -Force
}

New-Item -ItemType Directory -Path $staging | Out-Null

$excludeDirectories = @(
  ".git",
  "node_modules",
  ".next",
  ".turbo",
  "dist",
  "build",
  "coverage",
  "logs",
  "backups",
  "ssl",
  "deploy",
  "docs",
  "infrastructure",
  "monitoring"
)

$excludeFiles = @(
  "*.zip",
  "*.log",
  "*.map",
  "*.tsbuildinfo",
  "private.pem",
  "public.pem",
  "Dockerfile",
  "docker-compose*.yml"
)

function Should-ExcludePath {
  param([System.IO.FileSystemInfo]$Item)

  $relative = $Item.FullName.Substring($root.Path.Length).TrimStart("\", "/")
  $parts = $relative -split "[\\/]"

  foreach ($part in $parts) {
    if ($excludeDirectories -contains $part) {
      return $true
    }
  }

  foreach ($pattern in $excludeFiles) {
    if ($Item.Name -like $pattern) {
      return $true
    }
  }

  return $false
}

Get-ChildItem $root -Recurse -Force -File | ForEach-Object {
  if (-not (Should-ExcludePath $_)) {
    $relative = $_.FullName.Substring($root.Path.Length).TrimStart("\", "/")
    $destination = Join-Path $staging $relative
    $destinationDir = Split-Path $destination -Parent

    if (-not (Test-Path $destinationDir)) {
      New-Item -ItemType Directory -Path $destinationDir -Force | Out-Null
    }

    Copy-Item $_.FullName -Destination $destination -Force
  }
}

Compress-Archive -Path (Join-Path $staging "*") -DestinationPath $packagePath -Force

$sizeMb = [math]::Round((Get-Item $packagePath).Length / 1MB, 2)
Write-Host "Created $PackageName ($sizeMb MB)"
Write-Host "Upload this ZIP to Afrihost, not the full project folder."
