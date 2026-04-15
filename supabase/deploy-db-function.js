const fs   = require('fs');
const path = require('path');
const https = require('https');

// ── CLI args & env ────────────────────────────────────────────────────────────
// Usage: node supabase/deploy-db-function.js <sql-file> [project-ref]
//   or:  SUPABASE_PROJECT_REF=xxx node supabase/deploy-db-function.js <sql-file>
const sqlFileArg   = process.argv[2];
const projectRef   = process.env.SUPABASE_PROJECT_REF || process.argv[3];
const tokenFilePath = process.env.SUPABASE_ACCESS_TOKEN_FILE
  || path.join(__dirname, '.access_token');

if (!sqlFileArg) {
  console.error('Missing SQL file argument.');
  console.error('Usage: node supabase/deploy-db-function.js <sql-file> [project-ref]');
  console.error('Example: node supabase/deploy-db-function.js borrow_book');
  process.exit(1);
}

if (!projectRef) {
  console.error('Missing Supabase project ref.');
  console.error('Pass it as second argument or set SUPABASE_PROJECT_REF.');
  process.exit(1);
}

// ── Resolve SQL file path ─────────────────────────────────────────────────────
function resolveSqlFile(input) {
  if (path.isAbsolute(input)) return input;

  const withExt = input.endsWith('.sql') ? input : `${input}.sql`;

  // 1. supabase/db-functions/<name>.sql  (next to this script)
  const inDbFunctions = path.join(__dirname, 'db-functions', withExt);
  if (fs.existsSync(inDbFunctions)) return inDbFunctions;

  // 2. Relative to cwd
  const fromCwd = path.resolve(process.cwd(), withExt);
  if (fs.existsSync(fromCwd)) return fromCwd;

  return inDbFunctions; // will fail with a clear error below
}

const sqlFilePath = resolveSqlFile(sqlFileArg);

if (!fs.existsSync(sqlFilePath)) {
  console.error(`SQL file not found: ${sqlFilePath}`);
  process.exit(1);
}

// ── Read access token ─────────────────────────────────────────────────────────
if (!fs.existsSync(tokenFilePath)) {
  console.error(`Missing access token file: ${tokenFilePath}`);
  console.error('Create the file and add your Supabase access token there.');
  process.exit(1);
}

const rawLines = fs.readFileSync(tokenFilePath, 'utf8')
  .split('\n')
  .map(l => l.trim())
  .filter(Boolean);

if (rawLines.length === 0) {
  console.error(`Access token file is empty: ${tokenFilePath}`);
  process.exit(1);
}

let accessToken = rawLines[0];
const kvMatch = accessToken.match(/^SUPABASE_ACCESS_TOKEN\s*=\s*(.+)$/);
if (kvMatch) accessToken = kvMatch[1].replace(/^"|"$/g, '');
accessToken = accessToken.replace(/^"|"$/g, '');

if (!accessToken) {
  console.error(`No valid access token found in: ${tokenFilePath}`);
  process.exit(1);
}

// ── Read SQL ──────────────────────────────────────────────────────────────────
const sql = fs.readFileSync(sqlFilePath, 'utf8');

// ── Deploy via Supabase Management API ───────────────────────────────────────
const bodyStr = JSON.stringify({ query: sql });
const options = {
  hostname: 'api.supabase.com',
  path: `/v1/projects/${projectRef}/database/query`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type':  'application/json',
    'Content-Length': Buffer.byteLength(bodyStr),
  },
};

console.log(`Deploying DB function from: ${sqlFilePath}`);
console.log(`Project ref: ${projectRef}`);

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('DB function deployed successfully.');
    } else {
      console.error(`Deployment failed (HTTP ${res.statusCode}): ${data}`);
      process.exit(1);
    }
  });
});

req.on('error', (err) => {
  console.error(`Request error: ${err.message}`);
  process.exit(1);
});

req.write(bodyStr);
req.end();
