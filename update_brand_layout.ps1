$files = Get-ChildItem -Path views -Filter *.ejs -Recurse
foreach ($file in $files) {
    if ($file.PSIsContainer) { continue }
    $content = Get-Content -Path $file.FullName -Raw

    # Update tagline to include dash and use mixed case
    $content = $content -replace '<div class="brand-sub">SMART JOB PORTAL</div>', '<div class="brand-sub">- Smart Job Portal</div>'
    
    # Also fix footer if it was different
    $content = $content -replace '<div class="brand-main" style="font-size:1.1rem;color:rgba\(255,255,255,0.9\);">Joblif<span class="text-cyan">i</span>es</div>', '<div class="brand-main" style="font-size:1.1rem;color:rgba(255,255,255,0.9);">Joblif<span class="text-cyan">i</span>es</div><div class="brand-sub" style="font-size:0.75rem;margin-left:5px;">- Smart Job Portal</div>'

    Set-Content -Path $file.FullName -Value $content -NoNewline
    Write-Host "Updated $($file.FullName)"
}
