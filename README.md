# PM Agentic Workflows

This repo includes:

1. A Codex skill for reusable PM workflows (`skills/pm-agentic-workflows`)
2. A web app with a **chat-first PM copilot interface**, skill picker, and PM Skills tab

## Run the website locally

```bash
OPENAI_API_KEY=your_key_here node server.js
```

Then open `http://localhost:3000`.

## Can this run on GitHub itself?

Yes, but with an important caveat:

- **GitHub Pages alone is static-only** and cannot safely host your server-side OpenAI key.
- Use GitHub as source control + CI, and deploy the Node app to a host like **Render, Railway, Fly.io, or a VM**.
- If you use **GitHub Codespaces**, you can run it for development/testing with the same command above.

## Web app interaction model

- Starts as a single prompt box (no complex setup)
- After first message, transforms into a chat interface
- Includes a `+` menu in the composer for:
  - Skills
  - Attach file
  - Connect Jira (placeholder)
  - Connect Notion (placeholder)
- Includes a **PM Skills tab** with skill cards, expandable details, and one-click “Use in Chat”
- Includes a **download button** for the PM skill pack (`.skill`), generated on-demand by the server (no committed binary)

## Built-in web skills and prompts

The app exposes `GET /api/skills` and each skill has a dedicated prompt profile in `server.js` (`SKILL_LIBRARY`).
You can extend this map to add your own company-specific PM modes.

> Important: keep API keys server-side in environment variables, never in frontend code.

## Included skill package

- `skills/pm-agentic-workflows` — end-to-end workflows for:
  - PRD creation and refinement
  - Weekly execution/risk management
  - Stakeholder updates
  - Incident-to-roadmap learning loops
  - Launch readiness and post-launch review

## Skill quick start

1. Copy `skills/pm-agentic-workflows` into your Codex skills directory.
2. Ask Codex for a workflow by outcome:
   - "Run the PM weekly control tower workflow for my project."
   - "Use the PM agentic workflow to draft a PRD from these notes."
3. Follow the generated checklist and artifacts.
