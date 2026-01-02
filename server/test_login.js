const fetch = require('node-fetch');

async function testLogin() {
    try {
        console.log('Attempting login...');
        const response = await fetch('http://localhost:3002/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'admin123' })
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', data);
    } catch (e) {
        console.error('Error:', e.message);
    }
}

testLogin();
