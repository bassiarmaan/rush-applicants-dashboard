const fs = require('fs');
const path = require('path');

const envContent = `# Airtable Configuration
AIRTABLE_API_KEY=your_airtable_api_key_here
AIRTABLE_BASE_ID=your_airtable_base_id_here

# Dashboard Password (change this to a secure password)
DASHBOARD_PASSWORD=your_secure_password_here

# JWT Secret for authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Perplexity API
PERPLEXITY_API_KEY=your_perplexity_api_key_here
`;

const envPath = path.join(__dirname, '.env.local');

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file with your Airtable credentials');
  console.log('⚠️  Please change the DASHBOARD_PASSWORD and JWT_SECRET for security');
} else {
  console.log('ℹ️  .env.local file already exists');
}
