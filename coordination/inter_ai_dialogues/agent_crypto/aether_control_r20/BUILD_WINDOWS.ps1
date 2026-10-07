$ErrorActionPreference = "Stop"
$env:GOOS = "windows"
$env:GOARCH = "amd64"
$env:CGO_ENABLED = "0"

$Out = "ATLAS_CRYPTO_BRIDGE_CONTROL_CENTER.exe"
go build -trimpath -ldflags "-H windowsgui -s -w" -o $Out main.go
Write-Host "Aether Control V2.3.2R20 / Bridge V1.9.13 / Private Backend V1.4.6"
