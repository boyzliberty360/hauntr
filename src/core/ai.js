import Groq from 'groq-sdk';

let _client = null;

function getClient() {
  if (!_client) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error(
        'GROQ_API_KEY is not set.\n' +
        '  Set it with: $env:GROQ_API_KEY="gsk_..."\n' +
        '  Get a free key at: https://console.groq.com'
      );
    }
    _client = new Groq({ apiKey });
  }
  return _client;
}

export async function enrichIssue(issue, fileContent) {
  const client = getClient();

  const prompt = `You are Hauntr, an expert code reviewer. A static analysis rule found the following issue:

Rule: ${issue.rule}
Severity: ${issue.severity}
Message: ${issue.message}
File: ${issue.file}${issue.line ? `\nLine: ${issue.line}` : ''}

Relevant file content:
\`\`\`
${truncate(fileContent, 3000)}
\`\`\`

Respond ONLY with a JSON object in this exact shape (no markdown, no preamble):
{
  "explanation": "A 1-2 sentence plain-English explanation of WHY this is a problem and what risk it carries.",
  "fix": "The minimal corrected code snippet that resolves this specific issue. Code only, no explanation."
}`;

  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = response.choices[0]?.message?.content ?? '{}';

  try {
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    return {
      explanation: parsed.explanation ?? '',
      fix: parsed.fix ?? '',
    };
  } catch {
    return { explanation: raw.trim(), fix: '' };
  }
}

export async function enrichAll(issues, fileContents, onProgress) {
  const BATCH_SIZE = 3;
  const enriched = [];

  for (let i = 0; i < issues.length; i += BATCH_SIZE) {
    const batch = issues.slice(i, i + BATCH_SIZE);

    const results = await Promise.all(
      batch.map(async (issue) => {
        const content = fileContents.get(issue.file) ?? '';
        const ai = await enrichIssue(issue, content);
        return { ...issue, ai };
      })
    );

    enriched.push(...results);
    onProgress?.(Math.min(i + BATCH_SIZE, issues.length), issues.length);
  }

  return enriched;
}

function truncate(str, maxChars) {
  if (str.length <= maxChars) return str;
  return str.slice(0, maxChars) + '\n... (truncated)';
}