#!/bin/sh
# Copyright (c) 2026 donghwa-kang. MIT License. See LICENSE.
(
    set -eu

    for name in AGENTS.md AGENTS.override.md; do
        if [ -e "$name" ] || [ -L "$name" ]; then
            printf 'Existing %s found. Merge the guidelines manually; nothing was changed.\n' "$name" >&2
            exit 1
        fi
    done

    download_file=$(mktemp './.codex-guidelines.XXXXXX')
    trap 'rm -f "$download_file"' 0
    trap 'exit 1' HUP INT TERM
    curl -fsSL 'https://raw.githubusercontent.com/donghwa-kang/codex-agent-guidelines/main/AGENTS.md' -o "$download_file"
    if [ ! -s "$download_file" ]; then
        printf '%s\n' 'The download was empty. AGENTS.md was not installed.' >&2
        exit 1
    fi

    # A hard link publishes the complete file without replacing an existing file.
    # Recheck directories and symlinks so ln cannot treat them as a destination directory.
    if [ -e AGENTS.md ] || [ -L AGENTS.md ]; then
        printf '%s\n' 'AGENTS.md appeared during download; nothing was replaced.' >&2
        exit 1
    fi
    ln "$download_file" AGENTS.md
    printf '%s\n' 'Installed AGENTS.md. Start a new Codex task or CLI session in this project.'
)
