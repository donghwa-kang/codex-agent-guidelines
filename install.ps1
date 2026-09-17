# Copyright (c) 2026 donghwa-kang. MIT License. See LICENSE.
& {
    $ErrorActionPreference = 'Stop'
    $installRoot = (Get-Location).ProviderPath
    $targetPath = Join-Path $installRoot 'AGENTS.md'
    $downloadPath = $null

    try {
        foreach ($name in @('AGENTS.md', 'AGENTS.override.md')) {
            if (Get-Item -LiteralPath (Join-Path $installRoot $name) -Force -ErrorAction SilentlyContinue) {
                throw "Existing $name found. Merge the guidelines manually; nothing was changed."
            }
        }

        $downloadPath = [System.IO.Path]::GetTempFileName()
        Invoke-WebRequest -UseBasicParsing -Uri 'https://raw.githubusercontent.com/donghwa-kang/codex-agent-guidelines/main/AGENTS.md' -OutFile $downloadPath -ErrorAction Stop
        if ((Get-Item -LiteralPath $downloadPath).Length -eq 0) {
            throw 'The download was empty. AGENTS.md was not installed.'
        }

        # File.Move refuses to overwrite a file created while downloading.
        [System.IO.File]::Move($downloadPath, $targetPath)
        Write-Host 'Installed AGENTS.md. Start a new Codex task or CLI session in this project.'
    } finally {
        if ($downloadPath -and (Test-Path -LiteralPath $downloadPath)) {
            Remove-Item -LiteralPath $downloadPath
        }
    }
}
