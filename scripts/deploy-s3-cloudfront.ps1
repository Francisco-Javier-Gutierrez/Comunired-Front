[CmdletBinding()]
param(
    [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"
$bucketName = "comunired.com"
$distributionId = "E1DE36T5ACEIKJ"
$projectRoot = Split-Path -Parent $PSScriptRoot
$distPath = Join-Path $projectRoot "dist"

if (-not (Test-Path -LiteralPath $distPath)) {
    throw "No existe dist/. Ejecuta el build o elimina -SkipBuild."
}

if (-not $SkipBuild) {
    npm run build --prefix $projectRoot
    if ($LASTEXITCODE -ne 0) {
        throw "El build del frontend fallo."
    }
}

Write-Host "Sincronizando dist/ con s3://$bucketName ..."
aws s3 sync $distPath "s3://$bucketName" --delete
if ($LASTEXITCODE -ne 0) {
    throw "La sincronizacion con S3 fallo."
}

aws s3 cp (Join-Path $distPath "index.html") "s3://$bucketName/index.html" --cache-control "no-cache,no-store,must-revalidate" --content-type "text/html; charset=utf-8"
if ($LASTEXITCODE -ne 0) {
    throw "No se pudo ajustar la cache de index.html."
}

Write-Host "Invalidando CloudFront $distributionId ..."
aws cloudfront create-invalidation --distribution-id $distributionId --paths "/*"
