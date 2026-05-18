param(
  [int]$Port = 4173
)

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()

Write-Host "Serving $root at http://localhost:$Port/"

$contentTypes = @{
  ".html" = "text/html"
  ".css" = "text/css"
  ".js" = "application/javascript"
  ".jsx" = "text/babel"
  ".json" = "application/json"
  ".md" = "text/plain"
}

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $requestPath = [Uri]::UnescapeDataString($context.Request.Url.AbsolutePath.TrimStart("/"))

    if ([string]::IsNullOrWhiteSpace($requestPath)) {
      $requestPath = "index.html"
    }

    $requestedFile = Join-Path $root $requestPath
    $resolvedFile = [System.IO.Path]::GetFullPath($requestedFile)
    $resolvedRoot = [System.IO.Path]::GetFullPath($root)

    if (-not $resolvedFile.StartsWith($resolvedRoot)) {
      $context.Response.StatusCode = 403
      $context.Response.Close()
      continue
    }

    if (-not [System.IO.File]::Exists($resolvedFile)) {
      $context.Response.StatusCode = 404
      $context.Response.Close()
      continue
    }

    $extension = [System.IO.Path]::GetExtension($resolvedFile)
    $context.Response.ContentType = $contentTypes[$extension]
    if (-not $context.Response.ContentType) {
      $context.Response.ContentType = "application/octet-stream"
    }

    $bytes = [System.IO.File]::ReadAllBytes($resolvedFile)
    $context.Response.ContentLength64 = $bytes.Length
    $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    $context.Response.Close()
  }
}
finally {
  $listener.Stop()
}
