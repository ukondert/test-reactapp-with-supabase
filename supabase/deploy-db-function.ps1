param(
  [Parameter(Mandatory = $true)]
  [string]$SqlFile,

  [string]$ProjectRef = $env:SUPABASE_PROJECT_REF,
  [string]$TokenFile  = $env:SUPABASE_ACCESS_TOKEN_FILE
)

$setEnvScript = Join-Path $PSScriptRoot 'set-env.ps1'
if (Test-Path $setEnvScript) {
  . $setEnvScript
}

# ── Resolve SQL file path ─────────────────────────────────────────────────────
# Accept: bare name (borrow_book), name with extension (borrow_book.sql),
#         or any absolute/relative path.
if (-not [System.IO.Path]::IsPathRooted($SqlFile)) {
  $candidate = Join-Path $PSScriptRoot "db-functions\$SqlFile"
  if (-not ($SqlFile -match '\.sql$')) { $candidate += '.sql' }
  if (Test-Path $candidate) {
    $SqlFile = $candidate
  } else {
    $SqlFile = Join-Path (Get-Location) $SqlFile
    if (-not ($SqlFile -match '\.sql$')) { $SqlFile += '.sql' }
  }
}

if (-not (Test-Path $SqlFile)) {
  Write-Error "SQL file not found: $SqlFile"
  exit 1
}

# ── Project ref ───────────────────────────────────────────────────────────────
if (-not $ProjectRef) {
  Write-Error 'Missing Supabase project ref. Pass -ProjectRef or set SUPABASE_PROJECT_REF.'
  Write-Host 'Example: .\deploy-db-function.ps1 -SqlFile borrow_book -ProjectRef your-ref'
  exit 1
}

# ── Access token ──────────────────────────────────────────────────────────────
if (-not $TokenFile) {
  $TokenFile = Join-Path $PSScriptRoot '.access_token'
}

if (-not (Test-Path $TokenFile)) {
  Write-Error "Missing access token file: $TokenFile"
  Write-Host 'Create the file and add your Supabase access token there.'
  exit 1
}

try {
  $rawLines = @(Get-Content $TokenFile -Encoding UTF8 -ErrorAction Stop |
    ForEach-Object { $_.Trim() } |
    Where-Object { $_ -ne '' })
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

# ── Read SQL ──────────────────────────────────────────────────────────────────
try {
  $sql = [System.IO.File]::ReadAllText($SqlFile, [System.Text.Encoding]::UTF8)
} catch {
  Write-Error "Failed to read SQL file: $_"
  exit 1
}

# ── Deploy via Supabase Management API ───────────────────────────────────────
$uri     = "https://api.supabase.com/v1/projects/$ProjectRef/database/query"
$headers = @{
  'Authorization' = "Bearer $AccessToken"
  'Content-Type'  = 'application/json; charset=utf-8'
}
$bodyJson  = [PSCustomObject]@{ query = $sql } | ConvertTo-Json -Compress -Depth 10
$bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($bodyJson)

Write-Host "Deploying DB function from: $SqlFile"
Write-Host "Project ref: $ProjectRef"

try {
  $response = Invoke-RestMethod -Method Post -Uri $uri -Headers $headers -Body $bodyBytes -ContentType 'application/json; charset=utf-8' -ErrorAction Stop
  Write-Host 'DB function deployed successfully.'
} catch {
  $statusCode = $_.Exception.Response.StatusCode.value__
  $detail     = $_.ErrorDetails.Message
  Write-Error "Deployment failed (HTTP $statusCode): $detail"
  exit 1
}