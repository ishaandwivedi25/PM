const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const SKILL_LIBRARY = {
  general_pm: {
    label: 'General PM Copilot',
    prompt: 'Act as a senior technical PM copilot. Keep responses concise, practical, and action-oriented with clear next steps.',
    summary: 'All-purpose PM support for planning, prioritization, and execution decisions.',
    details: 'Use for broad PM work when you want balanced thinking across product, engineering, and stakeholder constraints.',
  },
  prd_architect: {
    label: 'PRD Architect',
    prompt: 'Act as a PRD architect. Turn ambiguity into decision-ready product requirement drafts with assumptions, tradeoffs, dependencies, risks, and measurable success metrics.',
    summary: 'Build clear, decision-ready PRDs from rough notes.',
    details: 'Use when defining product goals, non-goals, scope, metrics, and dependencies for new initiatives.',
  },
  sprint_risk_manager: {
    label: 'Sprint Risk Manager',
    prompt: 'Act as a sprint risk manager. Track execution health, identify schedule and dependency risk early, and propose mitigation/escalation actions with owners and timing.',
    summary: 'Spot delivery risk early and create mitigation plans.',
    details: 'Use for weekly control towers, blocker management, and execution-focused updates to leadership.',
  },
  stakeholder_comms: {
    label: 'Stakeholder Comms Strategist',
    prompt: 'Act as a stakeholder communication strategist. Draft crisp updates for executives, engineering, and cross-functional partners with clear asks and decisions.',
    summary: 'Generate crisp updates tuned for each audience.',
    details: 'Use when you need one source narrative transformed into executive, team, and partner-ready communication.',
  },
  launch_readiness_reviewer: {
    label: 'Launch Readiness Reviewer',
    prompt: 'Act as a launch readiness reviewer. Evaluate go/no-go based on reliability, security, support readiness, rollback confidence, and outstanding risks.',
    summary: 'Run structured launch go/no-go checks.',
    details: 'Use before release to identify readiness gaps, launch conditions, and rollback requirements.',
  },
  incident_analyst: {
    label: 'Incident-to-Roadmap Analyst',
    prompt: 'Act as an incident analyst for product teams. Convert incidents into root-cause insights and prioritized roadmap actions that reduce recurrence risk.',
    summary: 'Convert incidents into roadmap-level prevention actions.',
    details: 'Use post-incident to capture root causes, preventive initiatives, and prioritization rationale.',
  },
};

function sendJson(res, code, payload) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}

function serveStatic(req, res) {
  const route = req.url === '/' ? '/index.html' : req.url;
  const safePath = path.normalize(route).replace(/^\.\.(\/|\\|$)/, '');
  const filePath = path.join(__dirname, 'web', safePath);

  if (!filePath.startsWith(path.join(__dirname, 'web'))) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    let contentType = 'text/plain';
    if (filePath.endsWith('.html')) contentType = 'text/html; charset=utf-8';
    if (filePath.endsWith('.css')) contentType = 'text/css; charset=utf-8';
    if (filePath.endsWith('.js')) contentType = 'application/javascript; charset=utf-8';
    if (filePath.endsWith('.json')) contentType = 'application/json; charset=utf-8';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

function buildTranscript(messages = []) {
  return messages
    .filter((item) => item && typeof item.content === 'string' && typeof item.role === 'string')
    .map((item) => `${item.role.toUpperCase()}: ${item.content}`)
    .join('\n\n');
}

function downloadSkillPack(_req, res) {
  const sourceDir = path.join(__dirname, 'skills', 'pm-agentic-workflows');
  const targetFile = path.join(os.tmpdir(), `pm-agentic-workflows-${Date.now()}.skill`);

  const script = [
    'import pathlib, zipfile',
    `source = pathlib.Path(${JSON.stringify(sourceDir)})`,
    `target = pathlib.Path(${JSON.stringify(targetFile)})`,
    'with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED) as zf:',
    '    for p in source.rglob("*"):',
    '        if p.is_file():',
    '            zf.write(p, p.relative_to(source.parent))',
    'print(target)',
  ].join('\n');

  const proc = spawn('python3', ['-c', script], { stdio: ['ignore', 'pipe', 'pipe'] });

  let stderr = '';
  proc.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  proc.on('close', (code) => {
    if (code !== 0) {
      sendJson(res, 500, { error: `Failed to build skill pack: ${stderr.trim()}` });
      return;
    }

    fs.readFile(targetFile, (err, data) => {
      fs.unlink(targetFile, () => {});
      if (err) {
        sendJson(res, 500, { error: 'Failed to read generated skill pack.' });
        return;
      }

      res.writeHead(200, {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="pm-agentic-workflows.skill"',
      });
      res.end(data);
    });
  });
}

async function chat(req, res) {
  if (!OPENAI_API_KEY) {
    sendJson(res, 500, { error: 'Missing OPENAI_API_KEY on server.' });
    return;
  }

  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', async () => {
    try {
      const input = JSON.parse(body || '{}');
      const transcript = buildTranscript(input.messages || []);
      const selectedSkillKey = input.skill && SKILL_LIBRARY[input.skill] ? input.skill : 'general_pm';
      const selectedSkill = SKILL_LIBRARY[selectedSkillKey];

      const prompt = [
        selectedSkill.prompt,
        'Use markdown when useful. Prefer bullet points and explicit next actions (owner + due date where possible).',
        'If details are missing, make reasonable assumptions and label them clearly.',
        `Active skill: ${selectedSkill.label}`,
        'Conversation so far:',
        transcript || 'USER: No messages yet.',
      ].join('\n\n');

      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4.1-mini',
          input: prompt,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        const message = data.error?.message || 'OpenAI request failed';
        sendJson(res, 502, { error: message });
        return;
      }

      sendJson(res, 200, {
        output: data.output_text || 'No output received.',
        activeSkill: { key: selectedSkillKey, label: selectedSkill.label },
      });
    } catch (err) {
      sendJson(res, 400, { error: err.message });
    }
  });
}

function listSkills(_req, res) {
  const skills = Object.entries(SKILL_LIBRARY).map(([key, value]) => ({
    key,
    label: value.label,
    prompt: value.prompt,
    summary: value.summary,
    details: value.details,
  }));
  sendJson(res, 200, {
    skills,
    download: {
      label: 'Download PM skill pack (.skill)',
      href: '/api/skills/download',
    },
  });
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && (req.url === '/api/chat' || req.url === '/api/generate')) {
    chat(req, res);
    return;
  }
  if (req.method === 'GET' && req.url === '/api/skills') {
    listSkills(req, res);
    return;
  }
  if (req.method === 'GET' && req.url === '/api/skills/download') {
    downloadSkillPack(req, res);
    return;
  }
  if (req.method === 'GET') {
    serveStatic(req, res);
    return;
  }
  res.writeHead(405);
  res.end('Method not allowed');
});

server.listen(PORT, () => {
  console.log(`PM workflow app listening on http://localhost:${PORT}`);
});
