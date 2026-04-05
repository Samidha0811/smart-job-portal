$files = Get-ChildItem -Path views -Filter *.ejs -Recurse
foreach ($file in $files) {
    if ($file.PSIsContainer) { continue }
    $content = Get-Content -Path $file.FullName -Raw

    # 1. Update Navbar Brand
    $oldNavbarBrand = '<a class="navbar-brand" href="/">\s*<i class="fas fa-briefcase me-2" style="color:#818cf8;"></i>SmartJobPortal\s*</a>'
    # Fallback for admin panel navbar or variations
    $oldNavbarBrand2 = '<a class="navbar-brand" href="/admin">\s*<i class="fas fa-shield-alt me-2" style="color:#818cf8;"></i>Admin Panel\s*</a>'
    
    $newNavbarBrand = '<a class="navbar-brand d-flex align-items-center" href="/">
  <div class="logo-circle-brand me-2">
    <i class="fas fa-briefcase"></i>
  </div>
  <div class="brand-text-container">
    <div class="brand-main">Joblif<span class="text-cyan">i</span>es</div>
    <div class="brand-sub">SMART JOB PORTAL</div>
  </div>
</a>'

    $content = $content -replace $oldNavbarBrand, $newNavbarBrand

    # 2. Update Footer branding
    $oldFooterBrand = '<i class="fas fa-briefcase me-2" style="color:var\(--primary-light\);"></i>SmartJobPortal'
    $newFooterBrand = '<div class="d-flex align-items-center gap-2 mb-2">
            <div class="logo-circle-brand" style="width:32px;height:32px;font-size:0.8rem;">
              <i class="fas fa-briefcase"></i>
            </div>
            <div class="brand-text-container">
              <div class="brand-main" style="font-size:1.1rem;color:rgba(255,255,255,0.9);">Joblif<span class="text-cyan">i</span>es</div>
            </div>
          </div>'
    $content = $content -replace $oldFooterBrand, $newFooterBrand

    # 3. Update Title & Meta tags
    $content = $content -replace 'Smart Job Portal', 'Joblifies'
    $content = $content -replace 'SmartJobPortal', 'Joblifies'

    Set-Content -Path $file.FullName -Value $content -NoNewline
    Write-Host "Rebranded $($file.FullName)"
}
