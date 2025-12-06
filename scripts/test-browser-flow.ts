import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Simulate browser request
async function test() {
  const response = await fetch('http://localhost:3003/api/admin/members?status=approved', {
    headers: {
      'Authorization': 'Bearer fake-token-for-testing'
    }
  });
  
  console.log('Status:', response.status);
  console.log('Response:', await response.text());
}

test();
