# Re-encode hero video: all-intra (-g 1) + faststart + ~1-1.5 MB target.
# Requires ffmpeg in PATH (install: winget install Gyan.FFmpeg)
#
# Usage (from project root):
#   powershell -ExecutionPolicy Bypass -File tools/reencode-hero.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent

$inputCandidates = @(
  (Join-Path $root "assets\hero-scrub-backup.mp4"),
  (Join-Path $root "assets\hero-scrub.mp4"),
  (Join-Path $root "PixVerse_V6_Image_Text_540P_Only_animate_the_h.mp4")
)

$input = $inputCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $input) {
  Write-Error "No input video found."
}

$temp = Join-Path $root "assets\hero-scrub-temp.mp4"
$output = Join-Path $root "assets\hero-scrub-new.mp4"
$backup = Join-Path $root "assets\hero-scrub-backup.mp4"
$final = Join-Path $root "assets\hero-scrub.mp4"

$ffmpegPath = $null
$ffmpegCmd = Get-Command ffmpeg -ErrorAction SilentlyContinue
if ($ffmpegCmd) { $ffmpegPath = $ffmpegCmd.Source }
if (-not $ffmpegPath) {
  $wingetFfmpeg = Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Recurse -Filter "ffmpeg.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($wingetFfmpeg) { $ffmpegPath = $wingetFfmpeg.FullName }
}

if (-not $ffmpegPath) {
  Write-Host @"

ffmpeg not found. Run manually after installing ffmpeg (winget install Gyan.FFmpeg):

ffmpeg -y -i "$input" -c:v libx264 -crf 28 -preset ultrafast -g 1 -keyint_min 1 -sc_threshold 0 -pix_fmt yuv420p -an -movflags +faststart assets/hero-scrub.mp4

"@
  exit 1
}

Write-Host "Input:  $input ($([math]::Round((Get-Item $input).Length/1KB,1)) KB)"

& $ffmpegPath -y -hide_banner -loglevel warning -i $input `
  -c:v libx264 -crf 28 -preset ultrafast `
  -g 1 -keyint_min 1 -sc_threshold 0 `
  -pix_fmt yuv420p -an `
  -movflags +faststart `
  $output

Write-Host "Output: $output ($([math]::Round((Get-Item $output).Length/1KB,1)) KB)"

if (Test-Path $final) {
  Copy-Item $final $backup -Force
  Move-Item $output $final -Force
  Write-Host "Replaced assets/hero-scrub.mp4 (backup: assets/hero-scrub-backup.mp4)"
}
