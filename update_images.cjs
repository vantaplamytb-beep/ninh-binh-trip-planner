const fs = require('fs');
const https = require('https');

function searchImage(query) {
    return new Promise((resolve) => {
        const url = 'https://www.bing.com/images/search?q=' + encodeURIComponent(query + ' Ninh Binh');
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const match = data.match(/murl&quot;:&quot;(.*?)&quot;/);
                if (match) {
                    resolve(match[1]);
                } else {
                    resolve(null);
                }
            });
        }).on('error', () => resolve(null));
    });
}

async function run() {
    const filePath = 'src/data/destinations.js';
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Extract all objects: id, name, and current image position
    const regex = /name:\s*"([^"]+)",\s*image:\s*"([^"]+)"/g;
    let match;
    const items = [];
    
    while ((match = regex.exec(content)) !== null) {
        items.push({
            name: match[1],
            oldImage: match[2],
            fullMatch: match[0]
        });
    }
    
    console.log('Found ' + items.length + ' items to update.');
    
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        console.log('Searching for: ' + item.name);
        const newUrl = await searchImage(item.name);
        if (newUrl) {
            console.log(' -> Found: ' + newUrl);
            const newText = 'name: "' + item.name + '",\n    image: "' + newUrl + '"';
            content = content.replace(item.fullMatch, newText);
        } else {
            console.log(' -> No image found, keeping old.');
        }
        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 500));
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully updated destinations.js');
}

run();
