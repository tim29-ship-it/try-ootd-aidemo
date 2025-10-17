#requires -Version 7.0

param(
    [string]$BackendUrl = "http://127.0.0.1:8000/tryon",
    [string]$Output = "out.png"
)

$ErrorActionPreference = "Stop"

function Write-Info($Message) {
    Write-Host "[INFO] $Message"
}

function Ensure-Sample {
    param(
        [string]$Path,
        [string]$Url
    )

    if (Test-Path $Path) {
        return
    }

    Write-Info "Downloading sample image to $Path"
    Invoke-WebRequest -Uri $Url -OutFile $Path
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptDir "..")
$sampleDir = Join-Path $repoRoot "samples"

if (-not (Test-Path $sampleDir)) {
    New-Item -Path $sampleDir -ItemType Directory | Out-Null
}

$userPhoto = Join-Path $sampleDir "me.png"
$garmentPhoto = Join-Path $sampleDir "garment.png"

Ensure-Sample -Path $userPhoto -Url "https://picsum.photos/seed/me/512"
Ensure-Sample -Path $garmentPhoto -Url "https://picsum.photos/seed/garment/512"

Write-Info "Sending request to $BackendUrl"

$form = @{
    user_photo   = Get-Item $userPhoto
    garment_img  = Get-Item $garmentPhoto
}

try {
    $response = Invoke-RestMethod -Uri $BackendUrl -Method Post -Form $form
} catch {
    Write-Error "Request failed: $_"
    exit 1
}

if (-not $response.image_base64) {
    Write-Error "Response missing image_base64 field."
    exit 1
}

Write-Info "Writing output to $Output"
[IO.File]::WriteAllBytes($Output, [Convert]::FromBase64String($response.image_base64))

Write-Info "Done"
