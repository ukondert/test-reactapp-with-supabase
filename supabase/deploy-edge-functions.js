const { execSync } = require('child_process');
const { readdirSync, statSync } = require('fs');
const path = require('path');

const projectRef = process.env.SUPABASE_PROJECT_REF || process.argv[2];
const supabaseCLI = process.env.SUPABASE_CLI_PATH || 'npx';
const supabaseCommand = supabaseCLI === 'npx' ? 'npx supabase' : supabaseCLI;

if (!projectRef) {
  console.error('Missing SUPABASE_PROJECT_REF. Set it as env var or pass it as first argument.');
  console.error('Example: SUPABASE_PROJECT_REF=your-ref node supabase/deploy-functions.js');
  console.error('Or: node supabase/deploy-functions.js your-ref');
  process.exit(1);
}

const functionsDir = path.resolve(__dirname, 'functions');

let entries;
try {
  entries = readdirSync(functionsDir);
} catch (err) {
  console.error('Unable to read supabase/functions folder:', err.message);
  process.exit(1);
}

const functionFolders = entries.filter((name) => {
  const fullPath = path.join(functionsDir, name);
  return statSync(fullPath).isDirectory();
});

if (functionFolders.length === 0) {
  console.error('No Edge Function folders found under supabase/functions.');
  process.exit(1);
}

console.log('Deploying Supabase Edge Functions for project ref:', projectRef);

for (const fnName of functionFolders) {
  const functionPath = path.join(functionsDir, fnName);
  console.log(`\nDeploying function: ${fnName}`);
  try {
    execSync(
      `${supabaseCommand} functions deploy ${fnName} --project-ref ${projectRef}`,
      {
        stdio: 'inherit',
        cwd: path.resolve(__dirname),
      }
    );
  } catch (err) {
    console.error(`Failed to deploy ${fnName}:`, err.message);
    process.exit(1);
  }
}

console.log('\nAll functions deployed successfully.');
