#!/bin/sh
# Copyright (c) 2026 donghwa-kang. MIT License. See LICENSE.
(
    set -eu

    for name in AGENTS.md AGENTS.override.md THIRD_PARTY_NOTICES.md; do
        if [ -e "$name" ] || [ -L "$name" ]; then
            printf 'Existing %s found. Merge the guidelines manually; nothing was changed.\n' "$name" >&2
            exit 1
        fi
    done

    download_dir=$(mktemp -d './.codex-guidelines.XXXXXX')
    trap 'rm -f "$download_dir/AGENTS.md" "$download_dir/THIRD_PARTY_NOTICES.md"; rmdir "$download_dir"' 0
    trap 'exit 1' HUP INT TERM
    for name in AGENTS.md THIRD_PARTY_NOTICES.md; do
        curl -fsSL "https://raw.githubusercontent.com/donghwa-kang/codex-agent-guidelines/main/$name" -o "$download_dir/$name"
        if [ ! -s "$download_dir/$name" ]; then
            printf 'The %s download was empty. Nothing was installed.\n' "$name" >&2
            exit 1
        fi
    done

    # A hard link publishes the complete file without replacing an existing file.
    # Recheck directories and symlinks so ln cannot treat them as a destination directory.
    for name in THIRD_PARTY_NOTICES.md AGENTS.md; do
        if [ -e "$name" ] || [ -L "$name" ]; then
            printf '%s appeared during download; it was not replaced. THIRD_PARTY_NOTICES.md may remain; inspect the project before retrying.\n' "$name" >&2
            exit 1
        fi
        if ! ln "$download_dir/$name" "$name"; then
            printf '%s\n' 'Could not finish installation. THIRD_PARTY_NOTICES.md may remain; inspect the project before retrying.' >&2
            exit 1
        fi
    done
    printf '%s\n' 'Installed AGENTS.md. Notices saved as THIRD_PARTY_NOTICES.md. Start a new Codex task or CLI session in this project.'
)
