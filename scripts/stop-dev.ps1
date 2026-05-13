$ports = @(5000, 5173, 5174)
$ownerIds = Get-NetTCPConnection -LocalPort $ports -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess -Unique

foreach ($ownerId in $ownerIds) {
  if ($ownerId -and $ownerId -ne 0) {
    Stop-Process -Id $ownerId -Force -ErrorAction SilentlyContinue
  }
}

Write-Host "Stopped dev servers on ports 5000, 5173, and 5174 if they were running."
