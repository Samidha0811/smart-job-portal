$files = Get-ChildItem -Path views -Filter *.ejs -Recurse
foreach ($file in $files) {
    if ($file.PSIsContainer) { continue }
    $content = Get-Content -Path $file.FullName
    $found = $false
    $newContent = foreach ($line in $content) {
        if ($line -match '<link rel="icon" [^>]+>') {
            $found = $true
            '    <link rel="icon" type="image/png" href="/uploads/image.png">'
        } else {
            $line
        }
    }
    if ($found) {
        Set-Content -Path $file.FullName -Value $newContent
        Write-Host "Updated $($file.FullName)"
    }
}
