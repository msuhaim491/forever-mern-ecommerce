# FOREVER MERN - Guided one-click Windows development setup
# Run through SETUP-AUTO.bat from the project root (Windows PowerShell 5.1+).
# Secrets are entered ONLY on this computer and never transmitted to ChatGPT.
[CmdletBinding()]
param([switch]$NoStart, [switch]$SkipInstall)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $root

function Say([string]$message) { Write-Host "`n$message" -ForegroundColor Cyan }
function Warning([string]$message) { Write-Host "WARNING: $message" -ForegroundColor Yellow }
function Get-Value([string]$text, [string]$key) {
    $m = [regex]::Match($text, '(?m)^' + [regex]::Escape($key) + '=(.*)$')
    if (-not $m.Success) { return '' }
    $raw = $m.Groups[1].Value.Trim()
    if ($raw.Length -ge 2 -and (($raw.StartsWith('"') -and $raw.EndsWith('"')) -or ($raw.StartsWith("'") -and $raw.EndsWith("'")))) {
        return $raw.Substring(1, $raw.Length - 2)
    }
    return $raw
}
function Encode-Value([string]$value) {
    if ($value -match "[`r`n]") { throw 'Environment values cannot contain newlines.' }
    $safe = $value.Replace('\', '\\').Replace('"', '\"')
    return '"' + $safe + '"'
}
function Save-Value([string]$path, [string]$key, [string]$value) {
    $data = [System.IO.File]::ReadAllText($path)
    $line = $key + '=' + (Encode-Value $value)
    $pattern = '(?m)^' + [regex]::Escape($key) + '=.*$'
    if ([regex]::IsMatch($data, $pattern)) {
        $data = [regex]::Replace($data, $pattern, [System.Text.RegularExpressions.MatchEvaluator]{param($m) $line})
    } else { $data = $data.TrimEnd("`r", "`n") + "`r`n" + $line + "`r`n" }
    [System.IO.File]::WriteAllText($path, $data, (New-Object System.Text.UTF8Encoding($false)))
}
function Secure-Input([string]$question) {
    $secure = Read-Host $question -AsSecureString
    $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try { return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr); $secure.Dispose() }
}
function Mongo-LocalAvailable {
    $tcp = New-Object System.Net.Sockets.TcpClient
    try {
        $result = $tcp.BeginConnect('127.0.0.1',27017,$null,$null)
        if (-not $result.AsyncWaitHandle.WaitOne(1800)) { return $false }
        $tcp.EndConnect($result)
        return $true
    } catch { return $false }
    finally { $tcp.Dispose() }
}

Write-Host '====================================================' -ForegroundColor Green
Write-Host '  FOREVER STORE - WINDOWS AUTO SETUP (DEV MODE)' -ForegroundColor Green
Write-Host '====================================================' -ForegroundColor Green
Write-Host "Project: $root"
Write-Host 'Credentials remain on your computer. DO NOT share your .env file.'

if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'Node.js not found. Install Node.js 20+ from https://nodejs.org then retry.' }
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { throw 'npm not found. Reinstall Node.js 20+ then retry.' }
$nodeMajor = [int](([string](& node -p 'process.versions.node')).Split('.')[0])
if ($nodeMajor -lt 20) { throw "Node $nodeMajor found; Node.js 20+ required." }
Say "Node.js: $(& node --version)"

foreach ($folder in @('backend','frontend','admin')) {
    $template = Join-Path $root "$folder\.env.example"
    $target = Join-Path $root "$folder\.env"
    if (-not (Test-Path -LiteralPath $template)) { throw "Missing template: $template" }
    if (-not (Test-Path -LiteralPath $target)) {
        Copy-Item -LiteralPath $template -Destination $target
        Write-Host "Created $folder/.env"
    } else { Write-Host "Keeping existing $folder/.env" }
}
$backend = Join-Path $root 'backend\.env'
$data = [System.IO.File]::ReadAllText($backend)
$jwt = Get-Value $data 'JWT_SECRET'
if (-not $jwt -or $jwt.Length -lt 32 -or $jwt.StartsWith('REPLACE_')) {
    $bytes = New-Object byte[] 48
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try { $rng.GetBytes($bytes) } finally { $rng.Dispose() }
    $generated = -join ($bytes | ForEach-Object { $_.ToString('x2') })
    Save-Value $backend 'JWT_SECRET' $generated
    Write-Host 'Generated a secure random JWT_SECRET.'
}
$data = [System.IO.File]::ReadAllText($backend)
$email = Get-Value $data 'ADMIN_EMAIL'
if (-not $email -or $email -eq 'admin@example.com') {
    do {
        $email = (Read-Host 'Enter your new admin login email (saved locally)').Trim()
        if ($email -notmatch '^[^\s@]+@[^\s@]+\.[^\s@]+$') { Warning 'Please enter a valid email.' }
    } while ($email -notmatch '^[^\s@]+@[^\s@]+\.[^\s@]+$')
    Save-Value $backend 'ADMIN_EMAIL' $email
    Write-Host 'Admin email saved.'
}
$data = [System.IO.File]::ReadAllText($backend)
$password = Get-Value $data 'ADMIN_PASSWORD'
if (-not $password -or $password.StartsWith('REPLACE_') -or $password.Length -lt 12) {
    do {
        $password = Secure-Input 'Enter a NEW admin password (minimum 12 chars; hidden)'
        if ($password.Length -lt 12) { Warning 'Password must contain at least 12 characters.' }
    } while ($password.Length -lt 12)
    Save-Value $backend 'ADMIN_PASSWORD' $password
    Write-Host 'Admin password saved privately.'
}
$data = [System.IO.File]::ReadAllText($backend)
$mongo = Get-Value $data 'MONGODB_URI'
$localUri = 'mongodb://127.0.0.1:27017/forever_store'
if (-not $mongo -or $mongo -eq $localUri -or $mongo.StartsWith('REPLACE_')) {
    if (Mongo-LocalAvailable) {
        Save-Value $backend 'MONGODB_URI' $localUri
        Write-Host 'Local MongoDB detected on port 27017.'
    } else {
        Say 'MongoDB not found locally.'
        Write-Host 'If you have an Atlas cluster, copy the Drivers connection string there.'
        Write-Host 'Atlas: https://cloud.mongodb.com/  (Create free M0 cluster, DB user, allow your current IP)'
        Write-Host 'Your Atlas URI normally starts with mongodb+srv:// and includes the database user.'
        $answer = (Read-Host 'Enter A to paste Atlas connection, or S to skip for now [A/S]').Trim().ToUpperInvariant()
        if ($answer -eq 'A') {
            $mongo = Secure-Input 'Paste full Atlas MONGODB_URI (hidden; stored only in backend/.env)'
            if ($mongo -notmatch '^mongodb(\+srv)?://') { throw 'Invalid MongoDB URI. Expected mongodb:// or mongodb+srv://.' }
            Save-Value $backend 'MONGODB_URI' $mongo
            Write-Host 'Atlas connection stored locally.'
        } else {
            Warning 'MongoDB is required to start the backend or seed products. Setup has saved the other settings.'
            Write-Host 'Set up Atlas or local MongoDB, then run SETUP-AUTO.bat again.'
            exit 2
        }
    }
}

$data = [System.IO.File]::ReadAllText($backend)
if (-not (Get-Value $data 'STRIPE_SECRET_KEY')) {
    Say 'Stripe payments (optional for local testing; COD works without Stripe).'
    Write-Host 'Only use an authorized Stripe TEST secret key beginning with sk_test_.'
    $answer = (Read-Host 'Do you already have a Stripe TEST secret key? [y/N]').Trim()
    if ($answer -match '^(y|yes)$') {
        $key = Secure-Input 'Paste Stripe TEST SECRET key (hidden)'
        if ($key -notmatch '^sk_test_') { throw 'Expected a Stripe test key starting with sk_test_. Nothing was saved.' }
        Save-Value $backend 'STRIPE_SECRET_KEY' $key
        Write-Host 'Stripe test key stored locally.'
    } else {
        Write-Host 'Stripe not configured. COD remains available. You can add Stripe later.'
    }
}
if (-not $SkipInstall -and -not (Test-Path -LiteralPath (Join-Path $root 'node_modules'))) {
    Say 'Installing project dependencies (first time only) ...'
    & npm.cmd install --no-audit --no-fund
    if ($LASTEXITCODE -ne 0) { throw 'npm install failed. Check internet and npm error messages.' }
} else { Write-Host 'Skipping npm install (already installed or -SkipInstall chosen).' }

Say 'Checking JavaScript backend syntax ...'
& npm.cmd run check -w backend
if ($LASTEXITCODE -ne 0) { throw 'Backend syntax checks failed. See the output above.' }
Say 'Seeding MongoDB with admin account and sample products ...'
& npm.cmd run seed
if ($LASTEXITCODE -ne 0) {
    Warning 'Could not connect/seed MongoDB. Check database URI, Atlas IP access, username/password, and internet.'
    Write-Host 'Local .env settings are saved. Correct MongoDB access and run SETUP-AUTO.bat again.'
    exit 3
}
Say 'SETUP SUCCESS: Admin account and products are ready.'
Write-Host 'Shop:  http://localhost:5173'
Write-Host 'Admin: http://localhost:5174'
Write-Host 'API:   http://localhost:5000/api/health'
if ($NoStart) { exit 0 }
Say 'Starting website, admin and API now. Keep this window open while using the app.'
& npm.cmd run dev
exit $LASTEXITCODE
