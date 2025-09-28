/**
 * Debug token script
 */

async function debugToken() {
    try {
        console.log('🔍 Debugging development token...\n');
        
        // Step 1: Login to get token
        console.log('1. Getting token...');
        const loginResponse = await fetch('http://localhost:3001/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'demo@test.com',
                password: 'test123'
            })
        });
        
        const loginData = await loginResponse.json();
        const token = loginData.data.session.access_token;
        console.log('Full token:', token);
        console.log('Token starts with dev:', token.startsWith('dev.'));
        
        if (token.startsWith('dev.')) {
            const payload = token.substring(4);
            console.log('Base64 payload:', payload);
            
            try {
                const decoded = Buffer.from(payload, 'base64').toString();
                console.log('Decoded payload:', decoded);
                
                const parsedPayload = JSON.parse(decoded);
                console.log('Parsed payload:', JSON.stringify(parsedPayload, null, 2));
                
                console.log('User ID from token:', parsedPayload.sub);
                console.log('Token expiry:', new Date(parsedPayload.exp * 1000).toISOString());
                console.log('Current time:', new Date().toISOString());
                console.log('Token expired:', parsedPayload.exp < Math.floor(Date.now() / 1000));
            } catch (decodeError) {
                console.error('Failed to decode token:', decodeError.message);
            }
        }
        
    } catch (error) {
        console.error('Debug failed:', error.message);
    }
}

debugToken();