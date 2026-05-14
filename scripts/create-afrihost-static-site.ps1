param(
  [string]$PackageName = "nextgen-afrihost-public-html.zip"
)

$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$webRoot = Join-Path $root "apps\web"
$outDir = Join-Path $webRoot "out"
$packagePath = Join-Path $root $PackageName

if (Test-Path $packagePath) {
  Remove-Item $packagePath -Force
}

Push-Location $webRoot
try {
  npm run build
}
finally {
  Pop-Location
}

if (-not (Test-Path (Join-Path $outDir "index.html"))) {
  throw "Static export failed: apps\web\out\index.html was not created."
}

$nextAssetsDir = Join-Path $outDir "_next"
$safeAssetsDir = Join-Path $outDir "assets"

if (Test-Path $safeAssetsDir) {
  Remove-Item $safeAssetsDir -Recurse -Force
}

if (Test-Path $nextAssetsDir) {
  Move-Item $nextAssetsDir $safeAssetsDir
}

Get-ChildItem $outDir -Recurse -File -Include *.html,*.txt,*.js,*.css | ForEach-Object {
  $content = Get-Content $_.FullName -Raw
  $content = $content.Replace("./_next/", "./assets/")
  $content = $content.Replace("/_next/", "/assets/")
  $content = $content.Replace('"_next/', '"assets/')
  $content = $content.Replace("'_next/", "'assets/")
  Set-Content $_.FullName $content -NoNewline
}

# Base64-encode font files into a lookup table
$mediaDir = Join-Path $safeAssetsDir "static\media"
$fontMap = @{}
if (Test-Path $mediaDir) {
  Get-ChildItem $mediaDir -Filter "*.woff2" -File | ForEach-Object {
    $bytes = [System.IO.File]::ReadAllBytes($_.FullName)
    $b64 = [Convert]::ToBase64String($bytes)
    $fontMap[$_.Name] = "data:font/woff2;base64,$b64"
  }
}

# Read all CSS files and inline fonts as base64 data URIs
$cssFiles = Get-ChildItem (Join-Path $safeAssetsDir "static\chunks") -Filter "*.css" -File -ErrorAction SilentlyContinue
$inlineCss = ""

foreach ($cssFile in $cssFiles) {
  $cssContent = Get-Content $cssFile.FullName -Raw
  foreach ($fontName in $fontMap.Keys) {
    $cssContent = $cssContent.Replace("url(../media/$fontName)", "url($($fontMap[$fontName]))")
  }
  $inlineCss += "`n$cssContent"
}

if ($inlineCss) {
  $styleTag = "<style data-afrihost-inline>`n$inlineCss`n</style>"

  Get-ChildItem $outDir -Recurse -File -Filter "*.html" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    # Remove external CSS link tags
    $content = [regex]::Replace($content, '<link\s+rel="stylesheet"[^>]+\.css"[^>]*/?\s*>', "")
    # Inject inline style before </head>
    $content = $content.Replace("</head>", "$styleTag</head>")
    Set-Content $_.FullName $content -NoNewline
  }
}

Write-Host "Fonts base64-encoded and CSS inlined into HTML files."

Compress-Archive -Path (Join-Path $outDir "*") -DestinationPath $packagePath -Force

$sizeMb = [math]::Round((Get-Item $packagePath).Length / 1MB, 2)
Write-Host "Created $PackageName ($sizeMb MB)"
Write-Host "Extract the CONTENTS of this ZIP directly into Afrihost public_html."
