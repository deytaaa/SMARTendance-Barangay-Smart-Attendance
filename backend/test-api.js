const axios = require('axios');

async function testAPI() {
  try {
    // Get token first
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@smartendance.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, got token');
    
    // Get users
    const usersResponse = await axios.get('http://localhost:5000/api/users', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('\n📊 API Response:');
    console.log('Success:', usersResponse.data.success);
    console.log('Count:', usersResponse.data.count);
    console.log('Total:', usersResponse.data.total);
    console.log('\nUsers:', usersResponse.data.data.map(u => `${u.firstName} ${u.lastName} (${u.email})`));
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testAPI();
