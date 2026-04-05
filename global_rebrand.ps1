$files = Get-ChildItem -Path views -Filter *.ejs -Recurse
foreach ($file in $files) {
    if ($file.PSIsContainer) { continue }
    $content = Get-Content -Path $file.FullName -Raw

    # 1. Update Title and Headers (e.g., <%= title %> — Joblifies)
    # We use a lookahead to ensure we don't double the tagline.
    $content = [regex]::Replace($content, 'Joblifies(?! - Smart Job Portal)', 'Joblifies - Smart Job Portal')

    # 2. Re-standardize the Navbar brand for dashboard pages (that don't use the premium one)
    # If it's a dashboard/admin page, use the simpler icon+text if it's already using it.
    if ($file.Name -ne "index.ejs") {
       # Ensure we don't break the brand-text-container if it's already there
       if ($content -notlike "*brand-text-container*") {
          $oldBrand = '<a class="navbar-brand" href="[^"]*">\s*<i class="fas fa-briefcase me-2" style="color:#818cf8;"></i>Joblifies - Smart Job Portal\s*</a>'
          # Actually, the Joblifies part is already handled by the global replace above.
       }
    }

    Set-Content -Path $file.FullName -Value $content -NoNewline
    Write-Host "Rebranded $($file.FullName)"
}
