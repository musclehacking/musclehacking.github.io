# Repository Git identity isolation

Date: 28 October 2026. Source revision before this work: `afced65`. The user authorises a fixed Culpable identity for other projects, a Muscle Hacking exception for this checkout, and no history rewrite.

## Reproduction and cause

Bulma commit `557c11f8` records the Muscle Hacking author. Vercel blocks its deployment from `Culpable/bulma` because that author has no access to team Jake. Its later Culpable-authored documentation commit deploys successfully. No Muscle Hacking Vercel project or hosting change is involved.

The existing `set_git_account` function and `chpwd` hook in `/Users/sacino/.zshrc` rewrite the shared global Git author whenever a shell changes directory. A replay loads only that original hook and redirects its writes to a disposable `GIT_CONFIG_GLOBAL` file. Entering the real Muscle Hacking directory then querying Bulma's predicted author produces Muscle Hacking, reproducing the cross-project failure without creating a commit or changing the real global configuration.

## Fix

- Removed the directory-change identity function and hook from `/Users/sacino/.zshrc`.
- Added `/Users/sacino/.config/git/default-identity.gitconfig` with the Culpable default and included it last in `/Users/sacino/.gitconfig`. The final include also protects effective author identity from old open shells that still hold the original function: their writes alter the earlier values, while normal Git reads still resolve the final default.
- Retained the existing Muscle Hacking repository-local name/email in `.git/config`. Local configuration takes precedence over the default include.
- Preserved the separate `github.com-musclehacking` SSH alias, its key, the repository remote, and all other SSH configuration. Author identity and push authentication remain separate.
- Preserved other repository-local settings, including Embeddings' existing Culpable noreply email alias. No commit is amended, rebased, reset or recreated.

## Verification

Raw results are Git-ignored at `.artifacts/git_identity/20261028/`:

- `before.json`: expected Bulma author Culpable; actual author Muscle Hacking after the old hook runs. Failure reproduced.
- `after.json`: the same stale-hook replay returns Culpable for Bulma and Muscle Hacking for this checkout in both directory orders. All 57 top-level checkouts resolve to their intended GitHub account.
- A fresh interactive zsh enters Muscle Hacking, Bulma, then Muscle Hacking again. Predicted authors follow repository configuration, and the shared global configuration hash remains unchanged.
- `zsh -n /Users/sacino/.zshrc` passes. The SSH configuration hash and source HEAD remain unchanged across the fix.
- `zshrc.patch` and `gitconfig.patch` retain the reviewed machine-configuration diff. A private backup outside the repository retains the original files.

Replay the effective-author check without creating commits:

```bash
zsh -n /Users/sacino/.zshrc
git -C /Users/sacino/musclehacking var GIT_AUTHOR_IDENT
git -C /Users/sacino/bulma var GIT_AUTHOR_IDENT
git -C /Users/sacino/ranked-build var GIT_AUTHOR_IDENT
```

Expected: Muscle Hacking for the first repository; Culpable for the other two. The raw after record retains the full 57-repository inventory. The first inventory assertion incorrectly required one exact Culpable email spelling and flagged Embeddings' unchanged, valid account alias; the final check recognises both existing Culpable noreply forms without changing that repository.

## Durable lesson

Never select a Git author by rewriting global settings from a shell directory hook. Keep the shared default fixed and put exceptions in repository-local configuration. Check the effective author and its configuration origin when diagnosing a deployment permission failure; the SSH account used to push does not determine the author recorded in a commit.

Excluded edge cases: moving this checkout without its `.git/config`, external applications explicitly overriding Git author environment variables, and creating future repositories with conflicting local identities. No application tests or real deployment are needed to validate this machine-configuration fix.
