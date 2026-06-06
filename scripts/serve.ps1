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

function Send-Json {
  param(
    [Parameter(Mandatory = $true)] $Response,
    [Parameter(Mandatory = $true)] $Data,
    [int]$StatusCode = 200
  )

  $json = $Data | ConvertTo-Json -Depth 10
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
  $Response.StatusCode = $StatusCode
  $Response.ContentType = "application/json"
  $Response.ContentLength64 = $bytes.Length
  $Response.OutputStream.Write($bytes, 0, $bytes.Length)
  $Response.Close()
}

function Get-LocalEnvValue {
  param(
    [Parameter(Mandatory = $true)] [string]$Name
  )

  $processValue = [Environment]::GetEnvironmentVariable($Name, "Process")
  if ($processValue) {
    return $processValue
  }

  $envPath = Join-Path $root ".env"
  if (-not [System.IO.File]::Exists($envPath)) {
    return $null
  }

  foreach ($line in [System.IO.File]::ReadLines($envPath)) {
    if ($line.Trim().StartsWith("#") -or -not $line.Contains("=")) {
      continue
    }

    $parts = $line.Split("=", 2)
    if ($parts[0].Trim() -eq $Name) {
      return $parts[1].Trim().Trim('"').Trim("'")
    }
  }

  return $null
}

function Read-RequestBody {
  param(
    [Parameter(Mandatory = $true)] $Request
  )

  $reader = [System.IO.StreamReader]::new($Request.InputStream, $Request.ContentEncoding)
  try {
    return $reader.ReadToEnd()
  }
  finally {
    $reader.Close()
  }
}

function Get-ResponseText {
  param($ApiResponse)

  if ($ApiResponse.output_text) {
    return [string]$ApiResponse.output_text
  }

  $parts = New-Object System.Collections.Generic.List[string]
  foreach ($item in $ApiResponse.output) {
    foreach ($content in $item.content) {
      if ($content.text) {
        $parts.Add([string]$content.text)
      }
    }
  }

  return ($parts -join "`n").Trim()
}

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $requestPath = [Uri]::UnescapeDataString($context.Request.Url.AbsolutePath.TrimStart("/"))

    if ($requestPath -eq "api/analyze") {
      if ($context.Request.HttpMethod -ne "POST") {
        Send-Json -Response $context.Response -StatusCode 405 -Data @{ error = "Method not allowed" }
        continue
      }

      $apiKey = Get-LocalEnvValue -Name "OPENAI_API_KEY"
      if (-not $apiKey -or $apiKey -eq "replace_with_your_api_key") {
        Send-Json -Response $context.Response -StatusCode 400 -Data @{
          error = "OPENAI_API_KEY is not configured. Create a local .env file from .env.example."
        }
        continue
      }

      try {
        $body = Read-RequestBody -Request $context.Request
        $inputData = $body | ConvertFrom-Json
        $model = Get-LocalEnvValue -Name "OPENAI_MODEL"
        if (-not $model) {
          $model = "gpt-4.1-mini"
        }

        $notesJson = $inputData.intelligenceNotes | ConvertTo-Json -Depth 8
        $prompt = @"
Review the incident report and case intelligence notes for a detective copilot prototype.

Return concise, neutral output with these sections:
Case Summary
Key Details
Missing Information
Suggested Follow-Up Questions
Boundary Note

Rules:
- Do not identify suspects.
- Do not determine guilt.
- Do not classify gang affiliation.
- Do not recommend charges.
- Treat all output as draft support for human review.
- Use only user-provided report and note content.

Incident report:
$($inputData.report)

Case intelligence notes:
$notesJson
"@

        $payload = @{
          model = $model
          instructions = "You assist with law enforcement case review by summarizing user-provided report data, identifying missing information, and suggesting neutral follow-up questions. You do not make legal conclusions or suspect classifications."
          input = $prompt
          max_output_tokens = 800
        } | ConvertTo-Json -Depth 8

        $apiResponse = Invoke-RestMethod `
          -Uri "https://api.openai.com/v1/responses" `
          -Method Post `
          -Headers @{ Authorization = "Bearer $apiKey" } `
          -ContentType "application/json" `
          -Body $payload

        $reviewText = Get-ResponseText -ApiResponse $apiResponse
        Send-Json -Response $context.Response -Data @{
          source = "openai"
          model = $model
          reviewText = $reviewText
        }
      }
      catch {
        Send-Json -Response $context.Response -StatusCode 500 -Data @{
          error = "AI review failed."
          detail = $_.Exception.Message
        }
      }

      continue
    }

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

