param(
  [string]$ProjectRef = $env:SUPABASE_PROJECT_REF,
  [string]$TokenFile = $env:SUPABASE_ACCESS_TOKEN_FILE
)

$setEnvScript = Join-Path $PSScriptRoot 'set-env.ps1'
if (Test-Path $setEnvScript) {
  . $setEnvScript
}

if (-not $ProjectRef -and $args.Length -ge 1) {
  $ProjectRef = $args[0]
}

if (-not $TokenFile) {
  $TokenFile = Join-Path $PSScriptRoot '.access_token'
}

if (-not $ProjectRef) {
  Write-Error 'Missing Supabase project ref. Pass it as parameter, or set SUPABASE_PROJECT_REF.'
  Write-Host 'Example: .\deploy-functions.ps1 -ProjectRef your-ref'
  Write-Host 'Or: $env:SUPABASE_PROJECT_REF = "your-ref"; .\deploy-functions.ps1'
  exit 1
}

if (-not (Test-Path $TokenFile)) {
  Write-Error "Missing access token file: $TokenFile"
  Write-Host 'Create the file and add your Supabase access token there.'
  exit 1
}

try {
  $rawLines = @(Get-Content $TokenFile -ErrorAction Stop | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })
} catch {
  Write-Error "Failed to read token file: $_"
  exit 1
}

if ($rawLines.Count -eq 0) {
  Write-Error "Access token file is empty: $TokenFile"
  exit 1
}

$AccessToken = $rawLines[0]
if ($AccessToken -match '^SUPABASE_ACCESS_TOKEN\s*=\s*(.+)$') {
  $AccessToken = $matches[1].Trim('"')
}
$AccessToken = $AccessToken.Trim('"')

if (-not $AccessToken) {
  Write-Error "Access token file does not contain a valid token: $TokenFile"
  exit 1
}

$env:SUPABASE_ACCESS_TOKEN = $AccessToken

$functionsDir = Join-Path $PSScriptRoot 'functions'
if (-not (Test-Path $functionsDir)) {
  Write-Error "Cannot find functions directory: $functionsDir"
  exit 1
}

$functionFolders = Get-ChildItem -Path $functionsDir -Directory | Select-Object -ExpandProperty Name
if ($functionFolders.Count -eq 0) {
  Write-Error "No Edge Function folders found under $functionsDir"
  exit 1
}

Write-Host "Deploying Supabase Edge Functions for project ref: $ProjectRef"

Push-Location (Join-Path $PSScriptRoot '..')
try {
  foreach ($fnName in $functionFolders) {
    Write-Host "`nDeploying function: $fnName"
    & npx supabase functions deploy $fnName --project-ref $ProjectRef
    if ($LASTEXITCODE -ne 0) {
      Write-Error "Deployment failed for function: $fnName"
      exit $LASTEXITCODE
    }
  }
} finally {
  Pop-Location
}

Write-Host '`nAll functions deployed successfully.'
