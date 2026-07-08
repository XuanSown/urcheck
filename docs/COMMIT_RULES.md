# Git Commit Rules — URCheck

## 1. Commit Message Format
- Use imperative mood lowercase with scope: `feat(customer): add routines page`, `fix(auth): prevent OTP spam`.
- Prefer Conventional Commits: `feat`, `fix`, `refactor`, `docs`, `chore`.
- Keep the body short (<= 72 chars per line) and relevant.

## 2. Branching
- Work on `main` by default unless a feature-specific branch is provided.
- Never use `git push --force` to remote shared branches.
- Commit before large refactors so changes can be reverted.

## 3. Privacy & Secrets
- Never commit `.env`, `*.secret`, or files containing API keys.
- Use `.env.example` for placeholder variables, not real credentials.

## 4. CD Workflow
- Code push, route handler changes, and general web app updates do NOT need Docker rebuild.
- Build and deploy via Vercel CI (Next.js) or equivalent configured pipeline.
