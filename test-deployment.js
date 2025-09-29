#!/usr/bin/env node

/**
 * Test script to verify Vercel deployment
 * Run this after deploying to check if everything is working
 */

const https = require('https');
const http = require('http');

// Get the deployment URL from command line or use default
const deploymentUrl = process.argv[2] || 'https://your-app.vercel.app';

console.log('🔍 Testing Vercel Deployment...');
console.log(`📍 URL: ${deploymentUrl}`);
console.log('');

async function testEndpoint(path, description) {
  return new Promise((resolve) => {
    const url = `${deploymentUrl}${path}`;
    const client = url.startsWith('https') ? https : http;
    
    console.log(`Testing: ${description}`);
    console.log(`URL: ${url}`);
    
    const req = client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`✅ Status: ${res.statusCode}`);
          console.log(`📊 Response:`, json);
          resolve({ success: true, status: res.statusCode, data: json });
        } catch (e) {
          console.log(`✅ Status: ${res.statusCode}`);
          console.log(`📄 Response: ${data.substring(0, 200)}...`);
          resolve({ success: true, status: res.statusCode, data: data });
        }
        console.log('');
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ Error: ${err.message}`);
      console.log('');
      resolve({ success: false, error: err.message });
    });
    
    req.setTimeout(10000, () => {
      console.log('❌ Timeout');
      console.log('');
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });
  });
}

async function runTests() {
  console.log('🚀 Starting deployment tests...\n');
  
  // Test 1: Debug endpoint
  await testEndpoint('/api/debug', 'Environment Variables Check');
  
  // Test 2: Airtable connection
  await testEndpoint('/api/test-airtable', 'Airtable Connection Test');
  
  // Test 3: Detailed Airtable test
  await testEndpoint('/api/test-airtable-detailed', 'Detailed Airtable Test');
  
  // Test 4: Data structure test
  await testEndpoint('/api/test-data', 'Data Structure Analysis');
  
  // Test 5: Comprehensive debug
  await testEndpoint('/api/debug-vercel', 'Comprehensive Debug');
  
  console.log('🏁 Tests completed!');
  console.log('');
  console.log('📋 Next steps:');
  console.log('1. Check the debug endpoint: /api/debug-vercel');
  console.log('2. Verify environment variables in Vercel dashboard');
  console.log('3. Check if ELO/weight fields exist in Airtable');
  console.log('4. Add sample data to Airtable if fields are empty');
  console.log('5. Redeploy if needed');
}

runTests().catch(console.error);
