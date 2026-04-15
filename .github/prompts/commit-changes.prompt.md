---
description: 'Generiert eine aussagekräftige Commit Message und führt den Commit durch'
agent: agent
tools: ['execute/getTerminalOutput', 'execute/runTask', 'execute/getTaskOutput', 'execute/runInTerminal', 'execute/runTests', 'read/terminalSelection', 'read/terminalLastCommand', 'edit/createFile', 'edit/editFiles', 'search', 'web', 'github.vscode-pull-request-github/copilotCodingAgent', 'github.vscode-pull-request-github/issue_fetch', 'github.vscode-pull-request-github/suggest-fix', 'github.vscode-pull-request-github/searchSyntax', 'github.vscode-pull-request-github/doSearch', 'github.vscode-pull-request-github/renderIssues', 'github.vscode-pull-request-github/activePullRequest', 'github.vscode-pull-request-github/openPullRequest']
---

# Git Commit mit aussagekräftiger Message

Analysiere die aktuellen Änderungen im Git-Repository und erstelle eine strukturierte Commit Message nach Conventional Commits Standard.

## Schritte:

1. **Zeige Git Status:**
   ```bash
   git status
   ```

2. **Zeige die Änderungen:**
   ```bash
   git diff --staged
   git diff
   ```

3. **Analysiere die Änderungen** und erstelle eine Commit Message mit folgender Struktur:

   ```
   <type>(<scope>): <subject>

   <body>

   <footer>
   ```

   **Types:**
   - `feat`: Neues Feature
   - `fix`: Bugfix
   - `docs`: Nur Dokumentation
   - `style`: Formatierung, fehlende Semikolons, etc.
   - `refactor`: Code-Änderung ohne Bugfix oder Feature
   - `perf`: Performance-Verbesserung
   - `test`: Tests hinzufügen/korrigieren
   - `build`: Build-System oder externe Dependencies
   - `ci`: CI-Konfiguration
   - `chore`: Sonstiges (keine Änderungen an src oder test)

   **Subject:** Max 50 Zeichen, imperativ ("Add" nicht "Added")
   
   **Body:** 
   - Erkläre WAS und WARUM geändert wurde (nicht WIE)
   - Nutze Bullet Points für mehrere Änderungen
   - Referenziere Issue Numbers (#123)
   
   **Footer:**
   - BREAKING CHANGE: falls vorhanden
   - Closes #issue-nummer

4. **Stage alle Änderungen** (falls noch nicht staged):
   ```bash
   git add .
   ```

5. **Führe den Commit durch:**
   ```bash
   git commit -m "<die generierte message>"
   ```

6. **Bestätige** das Commit:
   ```bash
   git log -1
   ```

## Beispiel Commit Messages:

**Einfaches Feature:**
```
feat(user-auth): Add password reset functionality

- Implement reset token generation
- Add email notification service
- Create reset password form component

Closes #42
```

**Dokumentation:**
```
docs(best-practices): Add complex business logic example to user-stories2tasks

- Add "Cancel Ride" example with time-window validation
- Include Gherkin scenarios for all cancellation cases
- Show proper layer separation (Domain, Application, Infrastructure)
- Add code examples for Use Case and Domain Service orchestration
- Include architecture layers diagram with task mapping

BREAKING CHANGE: Template structure extended - existing docs should be reviewed
```

**Refactoring:**
```
refactor(chatmode): Move architecture resources to .agent-resources

- Relocate .github-copilot/architecture to .agent-resources/architecture
- Update all references in software-architect.chatmode.md
- Update README.md to reflect new structure
```

Bitte analysiere die Änderungen und erstelle einen passenden Commit!