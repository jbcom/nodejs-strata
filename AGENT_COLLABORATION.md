# Agent Collaboration Guide

## Authentication

All agents should use `GITHUB_JBCOM_TOKEN` for GitHub API access:

```bash
GH_TOKEN="$GITHUB_JBCOM_TOKEN" gh <command>
```

---

## Available Agents & Capabilities

### 🤖 Full Capability Agents (Code + Review)

These agents can be tasked with **code contributions** AND **reviews**:

#### @claude (Anthropic Claude)
```
@claude <task description>
@claude Please implement X
@claude Please review this PR
```

#### /q (Amazon Q Developer)
```
/q <task description>
/q Please fix the memory leak in X
/q review
```

#### @cursor (Cursor AI)
```
@cursor <task description>
@cursor Please refactor this function
@cursor review
```

### 📋 Review-Only Agents

#### /gemini (Google Gemini Code Assist)
```
/gemini review
```
**Note**: Gemini can ONLY be requested for review, not code tasks.

#### @copilot (GitHub Copilot)
**⚠️ IMPORTANT**: Copilot must be added as a reviewer FIRST before it will respond.

1. Go to PR → Reviewers → Add `@copilot`
2. Then it will auto-review

---

## Usage Examples

### Request Code Help
```
@claude Please implement the noise test coverage for edge cases

/q Please fix the type errors in src/core/state/store.ts

@cursor Please add JSDoc comments to all exported functions
```

### Request Reviews
```
@claude Please review this extraction for completeness

/q review

/gemini review

@cursor review
```

### Multi-Agent Review (Recommended)
For comprehensive review, request from multiple agents:
```
@claude Please review for architecture and patterns
/q review
/gemini review
@cursor review
```

---

## Team Roles

| Agent | Code Tasks | Reviews | Notes |
|-------|------------|---------|-------|
| @claude | ✅ | ✅ | Best for architecture, complex logic |
| /q | ✅ | ✅ | Good for AWS/security, bug fixes |
| @cursor | ✅ | ✅ | Good for refactoring, quick fixes |
| /gemini | ❌ | ✅ | Review only |
| @copilot | ❌ | ✅ | Must add as reviewer first |

---

## Best Practices

1. **For extraction PRs**: Request review from all agents
2. **For complex tasks**: Assign to @claude first
3. **For quick fixes**: Use @cursor or /q
4. **For security review**: Include /q
5. **Always**: Add @copilot as reviewer on PRs
