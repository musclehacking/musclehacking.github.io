# Local Test Runtime Lifecycle

Use `scripts/run-e2e-local.sh` for local E2E testing. It owns one Wrangler preview from startup through cleanup, so failed or interrupted test runs cannot silently leave development processes running.

## Run the suite

Select the repository runtime, then invoke the lifecycle wrapper from any directory:

```bash
nvm use "$(tr -d '[:space:]' < /Users/sacino/musclehacking/.nvmrc)"
/Users/sacino/musclehacking/scripts/run-e2e-local.sh
```

Pass ordinary Playwright arguments after the script name when a focused run is required. The wrapper always builds first and serves the Cloudflare Worker on `127.0.0.1:8787`.

## Ownership contract

The wrapper:

- Requires the exact Node version from `.nvmrc`.
- Uses an atomic lock under `/tmp` so concurrent tasks cannot start overlapping previews.
- Refuses to reuse an existing port-8787 listener because it cannot prove ownership of that process.
- Records the controller and root PIDs with their start times, repository, port, runtime version, and command in a mode-0600 lease, with known descendant identities in a mode-0600 companion file.
- Runs Playwright against the task-owned preview without allowing the Playwright `webServer` configuration to start another copy.
- Sends `TERM` only to the exact leased root and descendant PIDs after revalidating their start times.
- Verifies that the owned descendants and port listener are gone.
- Moves its task-owned runtime directory and lock to Trash after successful cleanup.

If exact cleanup cannot be proved, the wrapper exits non-zero and retains the runtime directory and lease paths printed in the error. Inspect those exact paths and processes before taking further action.

## Prohibited test startup paths

- Do not manually pre-start `wrangler dev` for an automated E2E run.
- Do not use `astro preview` for E2E work. It does not reproduce the Cloudflare Worker runtime.
- Do not start a second preview after a timeout. Read the printed Wrangler log and resolve the owned lifecycle first.
- Do not use process-name matching, group signals, or forceful termination for cleanup.
