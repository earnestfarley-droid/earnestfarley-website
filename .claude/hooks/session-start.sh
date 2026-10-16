#!/bin/bash
# Installs the Agent Reach CLI (https://github.com/Panniantong/agent-reach) in
# Claude Code cloud sessions so the .claude/skills/agent-reach skill works.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# Pinned to a reviewed commit (v1.5.0). Bump deliberately after reviewing changes.
AGENT_REACH_REF="94f06c1969dfc1834001269d79d3ad0972d9dee6"

if ! command -v agent-reach >/dev/null 2>&1; then
  python3 -m pip install --quiet --disable-pip-version-check \
    "git+https://github.com/Panniantong/agent-reach@${AGENT_REACH_REF}"
fi

# Let yt-dlp use Node for YouTube's JS challenges (recommended by `agent-reach doctor`).
mkdir -p "$HOME/.config/yt-dlp"
grep -qxF -- '--js-runtimes node' "$HOME/.config/yt-dlp/config" 2>/dev/null \
  || printf '%s\n' '--js-runtimes node' >> "$HOME/.config/yt-dlp/config"
