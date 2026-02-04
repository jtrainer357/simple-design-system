const fs = require('fs');
const path = require('path');
const https = require('https');

// Read .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        env[match[1]] = match[2];
    }
});

const SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL'];
const SUPABASE_ANON_KEY = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
const SUPABASE_SERVICE_ROLE_KEY = env['SUPABASE_SERVICE_ROLE_KEY'];

console.log(`Checking connection to: ${SUPABASE_URL}\n`);

async function checkUrl(url, name, headers = {}) {
    return new Promise((resolve) => {
        const req = https.get(url, { headers }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const status = res.statusCode;
                // Supabase REST root often returns 200 (swagger) or something reachable.
                // 401/403 means bad key.
                // 5xx means server error.
                // 404 might just mean endpoint not found but reachable.

                let valid = false;
                if (status >= 200 && status < 300) valid = true;
                // For Auth health check, 200 is expected.

                resolve({ name, url, status, valid, data: data.slice(0, 100) + (data.length > 100 ? '...' : '') });
            });
        });

        req.on('error', (e) => {
            resolve({ name, url, status: 'ERROR', valid: false, data: e.message });
        });
    });
}

async function runChecks() {
    // 1. Check URL reachability (Auth Health)
    const healthResult = await checkUrl(`${SUPABASE_URL}/auth/v1/health`, 'Supabase URL (Auth Health)');
    printResult(healthResult);

    // 2. Check Anon Key (REST Root - usually returns Swagger/OpenAPI spec if authorized)
    const anonResult = await checkUrl(`${SUPABASE_URL}/rest/v1/`, 'Anon Key', {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    });
    printResult(anonResult);

    // 3. Check Service Role Key (REST Root or Auth Admin)
    // We'll verify it works on REST root as well, checking for 200 OK.
    const serviceResult = await checkUrl(`${SUPABASE_URL}/rest/v1/`, 'Service Role Key', {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
    });
    printResult(serviceResult);
}

function printResult(result) {
    if (result.valid || result.status === 200) {
        console.log(`✅ ${result.name}: Success (Status: ${result.status})`);
    } else {
        console.log(`❌ ${result.name}: Failed (Status: ${result.status})`);
        console.log(`   Internal Response: ${result.data}`);
    }
}

runChecks();
