
const fetch = require('node-fetch');

async function testChat() {
    const currentCode = `
\\documentclass{article}
\\begin{document}
\\section{Header}
This is a test resume.
\\end{document}
`;

    try {
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ role: 'user', content: 'Change the header to "My Resume"' }],
                currentCode: currentCode
            })
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));
        if (data.error) {
            console.log('Full Error:', data.error);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

testChat();
