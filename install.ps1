# Copyright (c) 2026 donghwa-kang. MIT License. See LICENSE.
& {
    $ErrorActionPreference = 'Stop'
    $installRoot = (Get-Location).ProviderPath
    $downloads = @{}
    $noticesInstalled = $false

    try {
        foreach ($name in @('AGENTS.md', 'AGENTS.override.md', 'THIRD_PARTY_NOTICES.md')) {
            if (Get-Item -LiteralPath (Join-Path $installRoot $name) -Force -ErrorAction SilentlyContinue) {
                throw "Existing $name found. Merge the guidelines manually; nothing was changed."
            }
        }

        foreach ($name in @('AGENTS.md', 'THIRD_PARTY_NOTICES.md')) {
            $downloads[$name] = [System.IO.Path]::GetTempFileName()
            Invoke-WebRequest -UseBasicParsing -Uri ("https://raw.githubusercontent.com/donghwa-kang/codex-agent-guidelines/main/$name") -OutFile $downloads[$name] -ErrorAction Stop
            if ((Get-Item -LiteralPath $downloads[$name]).Length -eq 0) {
                throw "The $name download was empty. Nothing was installed."
            }
        }

        # Preserve the notices before publishing the guidelines. Move refuses overwrites.
        [System.IO.File]::Move($downloads['THIRD_PARTY_NOTICES.md'], (Join-Path $installRoot 'THIRD_PARTY_NOTICES.md'))
        $noticesInstalled = $true
        [System.IO.File]::Move($downloads['AGENTS.md'], (Join-Path $installRoot 'AGENTS.md'))
        Write-Host 'Installed AGENTS.md. Notices saved as THIRD_PARTY_NOTICES.md. Start a new Codex task or CLI session in this project.'
    } catch {
        if ($noticesInstalled) {
            Write-Warning 'Could not finish installation. THIRD_PARTY_NOTICES.md was preserved; inspect the project files before retrying.'
        }
        throw
    } finally {
        foreach ($downloadPath in $downloads.Values) {
            if (Test-Path -LiteralPath $downloadPath) {
                Remove-Item -LiteralPath $downloadPath
            }
        }
    }
}
