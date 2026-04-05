$files = Get-ChildItem views -Filter *.ejs
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $newContent = $content -replace 'link rel="icon" type="image/svg\+xml" href="/uploads/joblifies_logo_clean\.svg"', 'link rel="icon" type="image/png" href="/uploads/image.png"'
    Set-Content -Path $file.FullName -Value $newContent -NoNewline
}
