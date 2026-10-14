# ERITH.IA isolated preview fallback: loopback-only, static files, read-only.
$ErrorActionPreference = 'Stop'
$root = [System.IO.Path]::GetFullPath($PSScriptRoot).TrimEnd([System.IO.Path]::DirectorySeparatorChar)
$address = [System.Net.IPAddress]::Parse('127.0.0.1')
$port = 8765
$listener = New-Object System.Net.Sockets.TcpListener($address, $port)
$mime = @{
 '.html'='text/html; charset=utf-8'; '.htm'='text/html; charset=utf-8';
 '.css'='text/css; charset=utf-8'; '.js'='application/javascript; charset=utf-8';
 '.mjs'='application/javascript; charset=utf-8'; '.json'='application/json; charset=utf-8';
 '.svg'='image/svg+xml'; '.png'='image/png'; '.jpg'='image/jpeg';
 '.jpeg'='image/jpeg'; '.webp'='image/webp'; '.gif'='image/gif';
 '.ico'='image/x-icon'; '.woff'='font/woff'; '.woff2'='font/woff2';
 '.txt'='text/plain; charset=utf-8'; '.md'='text/markdown; charset=utf-8'
}
try {
 $listener.Start()
 Write-Host 'Apercu ERITH.IA accessible uniquement depuis ce PC.'
 Write-Host 'Fermez cette fenetre pour arreter le serveur.'
 Start-Process 'http://127.0.0.1:8765/public/agent_crypto_erith_ia/trader/trading-desk.html'
 while ($true) {
  $client = $listener.AcceptTcpClient()
  try {
   $client.ReceiveTimeout = 10000
   $client.SendTimeout = 10000
   $stream = $client.GetStream()
   $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
   $line = $reader.ReadLine()
   if ([string]::IsNullOrWhiteSpace($line)) { continue }
   do { $header = $reader.ReadLine() } while ($null -ne $header -and $header -ne '')
   $method = ($line -split ' ')[0]
   $requestTarget = ($line -split ' ')[1]
   $status = '200 OK'
   $body = [byte[]]@()
   $type = 'text/plain; charset=utf-8'
   if ($method -notin @('GET','HEAD') -or [string]::IsNullOrEmpty($requestTarget)) {
    $status = '405 Method Not Allowed'
   } else {
    $decoded = [System.Uri]::UnescapeDataString(($requestTarget -split '\?')[0])
    $relative = $decoded.TrimStart('/').Replace('/', [System.IO.Path]::DirectorySeparatorChar)
    $candidate = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($root, $relative))
    if ($candidate -ne $root -and -not $candidate.StartsWith($root + [System.IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
     $status = '403 Forbidden'
    } else {
     if ([System.IO.Directory]::Exists($candidate)) { $candidate = [System.IO.Path]::Combine($candidate, 'index.html') }
     if ([System.IO.File]::Exists($candidate)) {
      $body = [System.IO.File]::ReadAllBytes($candidate)
      $extension = [System.IO.Path]::GetExtension($candidate).ToLowerInvariant()
      if ($mime.ContainsKey($extension)) { $type = $mime[$extension] }
      else { $type = 'application/octet-stream' }
     } else { $status = '404 Not Found' }
    }
   }
   $headers = "HTTP/1.1 $status"+ "`r`n" +
    "Content-Type: $type`r`n" +
    "Content-Length: $($body.Length)`r`n" +
    "Cache-Control: no-store`r`n" +
    "X-Content-Type-Options: nosniff`r`n" +
    "Connection: close`r`n`r`n"
   $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($headers)
   $stream.Write($headerBytes, 0, $headerBytes.Length)
   if ($method -ne 'HEAD' -and $body.Length -gt 0) { $stream.Write($body, 0, $body.Length) }
   $stream.Flush()
  } catch {
   Write-Host "Requete refusee : $($_.Exception.Message)"
  } finally {
   $client.Close()
  }
 }
} finally {
 $listener.Stop()
}
