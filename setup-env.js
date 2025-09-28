const fs = require('fs');
const path = require('path');

const envContent = `# Airtable Configuration
AIRTABLE_API_KEY=pat5MZBuJCCU105MQ.8bcbff2a02b3a16fd465d2f1a152f87d96164ebaf598fbe689eac8bb746a4d2f
AIRTABLE_BASE_ID=appEmD27JyhYr4osO

# Dashboard Password (change this to a secure password)
DASHBOARD_PASSWORD=rush2025admin

# JWT Secret for authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
`;

const envPath = path.join(__dirname, '.env.local');

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file with your Airtable credentials');
  console.log('⚠️  Please change the DASHBOARD_PASSWORD and JWT_SECRET for security');
} else {
  console.log('ℹ️  .env.local file already exists');
}
