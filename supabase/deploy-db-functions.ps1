param(
  [string]$ProjectRef = $env:SUPABASE_PROJECT_REF,
  [string]$TokenFile  = $env:SUPABASE_ACCESS_TOKEN_FILE
)

$setEnvScript = Join-Path $PSScriptRoot 'set-env.ps1'
if (Test-Path $setEnvScript) {
  . $setEnvScript
}

$dotenvPath = Join-Path $PSScriptRoot '.env.deploy'
$dotenv = @{}
if (Test-Path $dotenvPath) {
  try {
    Get-Content $dotenvPath -Encoding UTF8 -ErrorAction Stop | ForEach-Object {
      $line = $_.Trim()
      if (-not [string]::IsNullOrWhiteSpace($line) -and -not $line.StartsWith('#')) {
        if ($line -match '^(?<key>[^=]+?)\s*=\s*(?<value>.*)$') {
          $dotenv[$matches['key'].Trim()] = $matches['value'].Trim('"').Trim()
        }
      }
    }
  } catch {
    Write-Warning "Failed to read .env.deploy: $_"
  }
}

if (-not $ProjectRef -and $dotenv.ContainsKey('SUPABASE_PROJECT_REF')) {
  $ProjectRef = $dotenv['SUPABASE_PROJECT_REF']
}

if ($dotenv.ContainsKey('SUPABASE_ACCESS_TOKEN_FILE')) {
  $tokenFileCandidate = $dotenv['SUPABASE_ACCESS_TOKEN_FILE'].Trim()
  if (-not [string]::IsNullOrWhiteSpace($tokenFileCandidate)) {
    $TokenFile = $tokenFileCandidate
  }
}

if ([string]::IsNullOrWhiteSpace($TokenFile)) {
  $TokenFile = Join-Path $PSScriptRoot '.access_token'
}

if (-not $ProjectRef) {
  Write-Error 'Missing Supabase project ref. Pass -ProjectRef or set SUPABASE_PROJECT_REF.'
  Write-Host 'Example: .\deploy-db-functions.ps1 -ProjectRef your-ref'
  Write-Host 'Or: $env:SUPABASE_PROJECT_REF = "your-ref"; .\deploy-db-functions.ps1'
  exit 1
}

$dbFunctionsDir = Join-Path $PSScriptRoot 'db-functions'
if (-not (Test-Path $dbFunctionsDir)) {
  Write-Error "DB functions folder not found: $dbFunctionsDir"
  exit 1
}

$sqlFiles = Get-ChildItem -Path $dbFunctionsDir -Filter '*.sql' -File | Sort-Object Name
if ($sqlFiles.Count -eq 0) {
  Write-Error "No SQL files found in: $dbFunctionsDir"
  exit 1
}

if (-not (Test-Path $TokenFile)) {
  if ($dotenv.ContainsKey('SUPABASE_ACCESS_TOKEN')) {
    try {
      $dotenv['SUPABASE_ACCESS_TOKEN'] | Out-File -FilePath $TokenFile -Encoding UTF8NoBOM -NoNewline
      Write-Host "Created access token file from .env.deploy: $TokenFile"
    } catch {
      Write-Error "Failed to write token file from .env.deploy: $_"
      exit 1
    }
  }
}

if (-not (Test-Path $TokenFile)) {
  Write-Error "Missing access token file: $TokenFile"
  Write-Host 'Create the file and add your Supabase access token there.'
  exit 1
}

try {
  $rawLines = @(Get-Content $TokenFile -Encoding UTF8 -ErrorAction Stop | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })
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
  Write-Error "No valid access token found in: $TokenFile"
  exit 1
}

$uri = "https://api.supabase.com/v1/projects/$ProjectRef/database/query"
$headers = @{
  'Authorization' = "Bearer $AccessToken"
  'Content-Type'  = 'application/json; charset=utf-8'
}

Write-Host "Deploying DB functions from: $dbFunctionsDir"
Write-Host "Project ref: $ProjectRef"

foreach ($sqlFile in $sqlFiles) {
  $sqlPath = $sqlFile.FullName
  Write-Host "`nDeploying DB function: $($sqlFile.Name)"

  try {
    $sql = [System.IO.File]::ReadAllText($sqlPath, [System.Text.Encoding]::UTF8)
  } catch {
    Write-Error "Failed to read SQL file $sqlPath: $_"
    exit 1
  }

  $bodyJson  = [PSCustomObject]@{ query = $sql } | ConvertTo-Json -Compress -Depth 10
  $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($bodyJson)

  try {
    $response = Invoke-RestMethod -Method Post -Uri $uri -Headers $headers -Body $bodyBytes -ContentType 'application/json; charset=utf-8' -ErrorAction Stop
    Write-Host "Successfully deployed: $($sqlFile.Name)"
  } catch {
    if ($_.Exception.Response -ne $null) {
      $statusCode = $_.Exception.Response.StatusCode.value__
      $detail     = $_.ErrorDetails.Message
      Write-Error "Deployment failed for $($sqlFile.Name) (HTTP $statusCode): $detail"
    } else {
      Write-Error "Deployment failed for $($sqlFile.Name): $_"
    }
    exit 1
  }
}

Write-Host '`nAll DB functions deployed successfully.'
