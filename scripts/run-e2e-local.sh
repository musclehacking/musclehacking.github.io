#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
PREVIEW_PORT="${MUSCLEHACKING_PREVIEW_PORT:-8787}"
PREVIEW_URL="http://127.0.0.1:${PREVIEW_PORT}/"
LOCK_DIR="/tmp/musclehacking-e2e-${PREVIEW_PORT}.lock"
RUNTIME_DIR=""
SERVER_PID=""
SERVER_START=""
CONTROLLER_PID="$$"
CONTROLLER_START="$(ps -p "$$" -o lstart= | sed 's/^[[:space:]]*//')"
LOCK_OWNED=0

usage() {
  printf '%s\n' \
    'Usage: ./scripts/run-e2e-local.sh [Playwright arguments]' \
    '' \
    'Builds the site, starts one task-owned Wrangler preview, runs the E2E suite,' \
    'and gracefully stops the preview on success, failure, or interruption.'
}

require_command() {
  local command_name="$1"

  if ! command -v "${command_name}" >/dev/null 2>&1; then
    printf 'Required command is unavailable: %s\n' "${command_name}" >&2
    exit 1
  fi
}

descendant_identities() {
  local parent_pid="$1"
  local child_pid
  local child_start

  while IFS= read -r child_pid; do
    [ -n "${child_pid}" ] || continue
    child_start="$(ps -p "${child_pid}" -o lstart= | sed 's/^[[:space:]]*//')"
    printf '%s\t%s\n' "${child_pid}" "${child_start}"
    descendant_identities "${child_pid}"
  done < <(pgrep -P "${parent_pid}" 2>/dev/null || true)
}

cleanup() {
  local command_status=$?
  local cleanup_failed=0
  local current_start
  local expected_start
  local remaining_pid
  local signalled_descendant=0
  local trash_bin

  trap - EXIT INT TERM

  if [ -n "${SERVER_PID}" ] && ps -p "${SERVER_PID}" >/dev/null 2>&1; then
    current_start="$(ps -p "${SERVER_PID}" -o lstart= | sed 's/^[[:space:]]*//')"

    if [ "${current_start}" = "${SERVER_START}" ]; then
      descendant_identities "${SERVER_PID}" > "${LOCK_DIR}/descendants"
      chmod 600 "${LOCK_DIR}/descendants"

      # A `kill` can lose a race with a process that is already exiting. The goal is
      # that the owned process is gone, so only a still-live PID is a real failure.
      if kill -TERM "${SERVER_PID}" || ! ps -p "${SERVER_PID}" >/dev/null 2>&1; then
        for _ in $(seq 1 20); do
          ps -p "${SERVER_PID}" >/dev/null 2>&1 || break
          sleep 0.5
        done
      else
        printf 'Cleanup incomplete: TERM failed for task-owned root PID %s.\n' "${SERVER_PID}" >&2
        cleanup_failed=1
      fi
    else
      printf 'Cleanup stopped: preview PID %s was reused.\n' "${SERVER_PID}" >&2
      cleanup_failed=1
    fi
  fi

  if [ -n "${SERVER_PID}" ] && [ -f "${LOCK_DIR}/descendants" ]; then
    while IFS=$'\t' read -r remaining_pid expected_start; do
      [ -n "${remaining_pid}" ] || continue
      if ps -p "${remaining_pid}" >/dev/null 2>&1; then
        current_start="$(ps -p "${remaining_pid}" -o lstart= | sed 's/^[[:space:]]*//')"
        if [ "${current_start}" = "${expected_start}" ]; then
          # Same exiting-process race as the root PID above.
          if kill -TERM "${remaining_pid}"; then
            signalled_descendant=1
          elif ps -p "${remaining_pid}" >/dev/null 2>&1; then
            printf 'Cleanup incomplete: TERM failed for task-owned descendant PID %s.\n' "${remaining_pid}" >&2
            cleanup_failed=1
          fi
        fi
      fi
    done < "${LOCK_DIR}/descendants"

    if [ "${signalled_descendant}" -eq 1 ]; then
      for _ in $(seq 1 20); do
        local descendant_alive=0

        while IFS=$'\t' read -r remaining_pid expected_start; do
          [ -n "${remaining_pid}" ] || continue
          if ps -p "${remaining_pid}" >/dev/null 2>&1; then
            current_start="$(ps -p "${remaining_pid}" -o lstart= | sed 's/^[[:space:]]*//')"
            if [ "${current_start}" = "${expected_start}" ]; then
              descendant_alive=1
              break
            fi
          fi
        done < "${LOCK_DIR}/descendants"

        [ "${descendant_alive}" -eq 0 ] && break
        sleep 0.5
      done
    fi

    while IFS=$'\t' read -r remaining_pid expected_start; do
      [ -n "${remaining_pid}" ] || continue
      if ps -p "${remaining_pid}" >/dev/null 2>&1; then
        current_start="$(ps -p "${remaining_pid}" -o lstart= | sed 's/^[[:space:]]*//')"
        if [ "${current_start}" = "${expected_start}" ]; then
          printf 'Cleanup incomplete: task-owned descendant PID %s remains.\n' "${remaining_pid}" >&2
          cleanup_failed=1
        fi
      fi
    done < "${LOCK_DIR}/descendants"
  fi

  if [ -n "${SERVER_PID}" ] && ps -p "${SERVER_PID}" >/dev/null 2>&1; then
    current_start="$(ps -p "${SERVER_PID}" -o lstart= | sed 's/^[[:space:]]*//')"
    if [ "${current_start}" = "${SERVER_START}" ]; then
      printf 'Cleanup incomplete: task-owned root PID %s remains.\n' "${SERVER_PID}" >&2
      cleanup_failed=1
    fi
  fi

  if [ -n "${SERVER_PID}" ] && lsof -tiTCP:"${PREVIEW_PORT}" -sTCP:LISTEN >/dev/null 2>&1; then
    printf 'Cleanup incomplete: port %s still has a listener.\n' "${PREVIEW_PORT}" >&2
    lsof -nP -iTCP:"${PREVIEW_PORT}" -sTCP:LISTEN >&2 || true
    cleanup_failed=1
  fi

  if [ "${cleanup_failed}" -eq 0 ]; then
    trash_bin="$(command -v trash || true)"
    if [ -z "${trash_bin}" ]; then
      printf 'Cleanup incomplete: trash command is unavailable.\n' >&2
      cleanup_failed=1
    else
      if [ -n "${RUNTIME_DIR}" ] && [ -d "${RUNTIME_DIR}" ]; then
        "${trash_bin}" "${RUNTIME_DIR}"
      fi
      if [ "${LOCK_OWNED}" -eq 1 ] && [ -d "${LOCK_DIR}" ]; then
        "${trash_bin}" "${LOCK_DIR}"
      fi
    fi
  else
    printf 'Runtime evidence retained at %s and %s.\n' "${RUNTIME_DIR}" "${LOCK_DIR}" >&2
  fi

  if [ "${cleanup_failed}" -ne 0 ] && [ "${command_status}" -eq 0 ]; then
    command_status=1
  fi

  exit "${command_status}"
}

if [ "${1:-}" = "--help" ] || [ "${1:-}" = "-h" ]; then
  usage
  exit 0
fi

require_command node
require_command pnpm
require_command pgrep
require_command lsof
require_command curl
require_command trash

EXPECTED_NODE_VERSION="$(tr -d '[:space:]' < "${REPO_ROOT}/.nvmrc")"
ACTUAL_NODE_VERSION="$(node --version | sed 's/^v//')"

if [ "${ACTUAL_NODE_VERSION}" != "${EXPECTED_NODE_VERSION}" ]; then
  printf 'Node %s is required; current version is %s. Run nvm use first.\n' \
    "${EXPECTED_NODE_VERSION}" "${ACTUAL_NODE_VERSION}" >&2
  exit 1
fi

if ! mkdir "${LOCK_DIR}" 2>/dev/null; then
  printf 'Another local E2E lifecycle owns %s. Do not start a second preview.\n' \
    "${LOCK_DIR}" >&2
  if [ -f "${LOCK_DIR}/lease" ]; then
    sed -n '1,20p' "${LOCK_DIR}/lease" >&2
  fi
  exit 1
fi

LOCK_OWNED=1
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
chmod 700 "${LOCK_DIR}"

if lsof -tiTCP:"${PREVIEW_PORT}" -sTCP:LISTEN >/dev/null 2>&1; then
  printf 'Port %s already has a listener. Reuse is not allowed because this runner cannot own its cleanup.\n' \
    "${PREVIEW_PORT}" >&2
  lsof -nP -iTCP:"${PREVIEW_PORT}" -sTCP:LISTEN >&2 || true
  exit 1
fi

RUNTIME_DIR="$(mktemp -d "/tmp/musclehacking-e2e.${PREVIEW_PORT}.XXXXXX")"
LOG_FILE="${RUNTIME_DIR}/wrangler.log"
NODE_BIN_DIR="$(dirname "$(command -v node)")"
PNPM_BIN="$(command -v pnpm)"

/usr/bin/env PATH="${NODE_BIN_DIR}:${PATH}" \
  "${PNPM_BIN}" --dir "${REPO_ROOT}" build

/usr/bin/env PATH="${NODE_BIN_DIR}:${PATH}" \
  "${PNPM_BIN}" --dir "${REPO_ROOT}" exec wrangler dev --port "${PREVIEW_PORT}" \
  > "${LOG_FILE}" 2>&1 &
SERVER_PID=$!
SERVER_START="$(ps -p "${SERVER_PID}" -o lstart= | sed 's/^[[:space:]]*//')"

{
  printf 'repository=%s\n' "${REPO_ROOT}"
  printf 'root_pid=%s\n' "${SERVER_PID}"
  printf 'root_start=%s\n' "${SERVER_START}"
  printf 'controller_pid=%s\n' "${CONTROLLER_PID}"
  printf 'controller_start=%s\n' "${CONTROLLER_START}"
  printf 'port=%s\n' "${PREVIEW_PORT}"
  printf 'node=%s\n' "${ACTUAL_NODE_VERSION}"
  printf 'command=pnpm exec wrangler dev --port %s\n' "${PREVIEW_PORT}"
} > "${LOCK_DIR}/lease"
chmod 600 "${LOCK_DIR}/lease"

for _ in $(seq 1 60); do
  if curl -fsS "${PREVIEW_URL}" >/dev/null 2>&1; then
    break
  fi

  if ! ps -p "${SERVER_PID}" >/dev/null 2>&1; then
    printf 'Wrangler exited before becoming ready. Recent logs:\n' >&2
    tail -80 "${LOG_FILE}" >&2 || true
    exit 1
  fi

  sleep 1
done

if ! curl -fsS "${PREVIEW_URL}" >/dev/null 2>&1; then
  printf 'Wrangler did not become ready at %s. Recent logs:\n' "${PREVIEW_URL}" >&2
  tail -80 "${LOG_FILE}" >&2 || true
  exit 1
fi

descendant_identities "${SERVER_PID}" > "${LOCK_DIR}/descendants"
chmod 600 "${LOCK_DIR}/descendants"

# The wrapper owns the server, so Playwright must reuse it instead of launching
# another Wrangler process from the webServer configuration.
/usr/bin/env -u CI PATH="${NODE_BIN_DIR}:${PATH}" \
  "${PNPM_BIN}" --dir "${REPO_ROOT}" exec playwright test tests/e2e "$@"
