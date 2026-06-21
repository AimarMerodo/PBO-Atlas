# Extracts data and assets from the local PBO game install into the repo.
# The devs granted permission to use game assets.
# Usage: powershell -File scripts/extract-game-data.ps1 [-GameDir <path>]

param(
  [string]$GameDir = "$env:USERPROFILE\Desktop\cosas\pbo-windows"
)

$ErrorActionPreference = "Stop"
$repo = Split-Path $PSScriptRoot -Parent
$cache = Join-Path $repo "scripts\.cache\game"
New-Item -ItemType Directory -Force $cache | Out-Null

# --- 1. Data files from pbo.jar (a .jar is a zip) ---
$jarEntries = @(
  "pokedex/pokemondata.json",
  "pokedex/abilities_text.json",
  "pokedex/translated_moves.csv",
  "pokedex/ev_yield.csv",
  "pokedex/pokemon_flavor.csv",
  "pokedex/showdown/gen9moves.json",
  "nature/nature_list.csv",
  "nature/nature_es.csv",
  "nature/nature_pt.csv",
  "nature/nature_zh.csv",
  "machines/gen_9_tm_map.csv",
  "machines/hm_map.csv",
  "item/items.csv",
  "item/mounts.csv"
)

Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead((Join-Path $GameDir "pbo.jar"))
foreach ($name in $jarEntries) {
  $entry = $zip.Entries | Where-Object FullName -eq $name
  if (-not $entry) { Write-Warning "jar entry not found: $name"; continue }
  $dest = Join-Path $cache ($name -replace "/", "\")
  New-Item -ItemType Directory -Force (Split-Path $dest) | Out-Null
  [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $dest, $true)
  Write-Output "jar -> $name"
}
# Bundles (cosmetics): all of chest/bundle/*.json
$bundleDir = Join-Path $cache "bundles"
New-Item -ItemType Directory -Force $bundleDir | Out-Null
$bundles = $zip.Entries | Where-Object { $_.FullName -like "chest/bundle/*.json" }
foreach ($b in $bundles) {
  [System.IO.Compression.ZipFileExtensions]::ExtractToFile($b, (Join-Path $bundleDir $b.Name), $true)
}
Write-Output "jar -> $($bundles.Count) bundle jsons"
$zip.Dispose()

# --- 2. Game i18n CSVs (item name translations) ---
$i18nDir = Join-Path $cache "i18n"
New-Item -ItemType Directory -Force $i18nDir | Out-Null
foreach ($f in @("items_es.csv","items_pt.csv","items_zh.csv")) {
  Copy-Item (Join-Path $GameDir "assets\i18n\$f") $i18nDir -Force
}
Write-Output "copied i18n csvs"

# --- 3. Pokemon sprites (front + front-shiny) -> public/sprites/pbo ---
foreach ($kind in @("front", "front-shiny")) {
  $dest = Join-Path $repo "public\sprites\pbo\$kind"
  New-Item -ItemType Directory -Force $dest | Out-Null
  Copy-Item (Join-Path $GameDir "assets\pokemon-sprites\$kind\*.png") $dest -Force
  Write-Output "sprites $kind -> $((Get-ChildItem $dest).Count) files"
}

# --- 4. Item icon atlases (multi-page) ---
$itemsDest = Join-Path $repo "public\items"
New-Item -ItemType Directory -Force $itemsDest | Out-Null
Copy-Item (Join-Path $GameDir "assets\ui\item\item_pack*.png") $itemsDest -Force
Copy-Item (Join-Path $GameDir "assets\ui\item\donator_pack*.png") $itemsDest -Force
Copy-Item (Join-Path $GameDir "assets\ui\item\item_pack.atlas") $cache -Force
Copy-Item (Join-Path $GameDir "assets\ui\item\donator_pack.atlas") $cache -Force
Write-Output "item atlases copied: $((Get-ChildItem $itemsDest -Filter *.png).Count) pages"

# --- 5. Login background art -> public/art ---
$artDest = Join-Path $repo "public\art"
New-Item -ItemType Directory -Force $artDest | Out-Null
Copy-Item (Join-Path $GameDir "assets\login\login_background\*.png") $artDest -Force
Write-Output "login art copied: $((Get-ChildItem $artDest -Filter *.png).Count) images"

Write-Output "DONE -> $cache"
