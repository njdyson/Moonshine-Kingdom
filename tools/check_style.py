#!/usr/bin/env python3
"""House-style check. See CLAUDE.md.

Flags em dashes, in both spellings, across the live component files. The repo
baseline is zero, so any hit is a regression. Archive/ is frozen history and
mk-online/dist/ is committed build output; both are skipped.

    python3 tools/check_style.py        # exits 1 if anything is found
"""

import re
import subprocess
import sys

SKIP_PREFIXES = ("Archive/", "mk-online/")
SUFFIXES = (".html", ".css")
EM_DASH = re.compile(r"&mdash;|—")


def tracked_files():
    out = subprocess.run(
        ["git", "ls-files", "-z"], capture_output=True, text=True, check=True
    ).stdout
    for path in out.split("\0"):
        if not path or not path.endswith(SUFFIXES):
            continue
        if path.startswith(SKIP_PREFIXES):
            continue
        yield path


def main():
    hits = []
    for path in tracked_files():
        with open(path, encoding="utf-8") as fh:
            for lineno, line in enumerate(fh, 1):
                for match in EM_DASH.finditer(line):
                    start = max(0, match.start() - 40)
                    end = min(len(line), match.end() + 40)
                    hits.append((path, lineno, line[start:end].strip()))

    if not hits:
        print("Style OK: no em dashes in the live component files.")
        return 0

    print(f"{len(hits)} em dash(es) found. Rewrite them; see CLAUDE.md.\n")
    for path, lineno, excerpt in hits:
        print(f"  {path}:{lineno}: ...{excerpt}...")
    return 1


if __name__ == "__main__":
    sys.exit(main())
