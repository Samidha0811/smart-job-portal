$files = Get-ChildItem -Path views -Filter *.ejs -Recurse
foreach ($file in $files) {
    if ($file.PSIsContainer) { continue }
    $content = Get-Content -Path $file.FullName -Raw

    # 1. Fix the brand-sub tagline
    $content = $content -replace '<div class="brand-sub">Joblifies</div>', '<div class="brand-sub">SMART JOB PORTAL</div>'

    # 2. Specific fix for admin-navbar.ejs
    if ($file.FullName -like "*admin-navbar.ejs") {
        $oldAdminBrand = '<a class="navbar-brand" href="/admin">\s*<i class="fas fa-shield-alt me-2" style="color:#818cf8;"></i>Admin Panel\s*</a>'
        $newAdminBrand = '<a class="navbar-brand d-flex align-items-center" href="/admin">
  <div class="logo-circle-brand me-2" style="background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);">
    <i class="fas fa-shield-alt"></i>
  </div>
  <div class="brand-text-container">
    <div class="brand-main">Joblifies <span class="text-cyan">Admin</span></div>
    <div class="brand-sub" style="color: rgba(255,255,255,0.5);">PANEL CONTROL</div>
  </div>
</a>'
        $content = $content -replace $oldAdminBrand, $newAdminBrand
    }

    Set-Content -Path $file.FullName -Value $content -NoNewline
    Write-Host "Corrected $($file.FullName)"
}
