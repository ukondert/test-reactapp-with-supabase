const fs = require('fs');
const path = require('path');
const https = require('https');

const projectRef = process.env.SUPABASE_PROJECT_REF || process.argv[2];
const tokenFilePath = process.env.SUPABASE_ACCESS_TOKEN_FILE || path.join(__dirname, '.access_token');
const dbFunctionsDir = path.join(__dirname, 'db-functions');

if (!projectRef) {
  console.error('Missing Supabase project ref. Pass it as first argument or set SUPABASE_PROJECT_REF.');
  console.error('Usage: node supabase/deploy-db-functions.js [project-ref]');
  process.exit(1);
}

if (!fs.existsSync(dbFunctionsDir)) {
  console.error(`DB functions folder not found: ${dbFunctionsDir}`);
  process.exit(1);
}

const sqlFiles = fs.readdirSync(dbFunctionsDir)
  .filter(file => file.toLowerCase().endsWith('.sql'))
  .sort();

if (sqlFiles.length === 0) {
  console.error(`No SQL files found in: ${dbFunctionsDir}`);
  process.exit(1);
}

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

function deploySqlFile(sqlFileName) {
  return new Promise((resolve, reject) => {
    const sqlFilePath = path.join(dbFunctionsDir, sqlFileName);
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    const bodyStr = JSON.stringify({ query: sql });
    const body = Buffer.from(bodyStr, 'utf8');

    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${projectRef}/database/query`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': body.length,
      },
    };

    console.log(`Deploying DB function: ${sqlFileName}`);

    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`Successfully deployed ${sqlFileName}`);
          resolve();
        } else {
          reject(new Error(`Deployment failed for ${sqlFileName} (HTTP ${res.statusCode}): ${data}`));
        }
      });
    });

    req.on('error', err => reject(err));
    req.write(body);
    req.end();
  });
}

(async () => {
  console.log(`Deploying ${sqlFiles.length} DB function(s) to Supabase project: ${projectRef}`);
  for (const sqlFileName of sqlFiles) {
    try {
      await deploySqlFile(sqlFileName);
    } catch (err) {
      console.error(err.message);
      process.exit(1);
    }
  }
  console.log('\nAll DB functions deployed successfully.');
})();
