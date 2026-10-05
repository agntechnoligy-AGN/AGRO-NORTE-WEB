import fs from 'node:fs';
import path from 'node:path';

const file = path.resolve('.vercel/output/functions/_render.func/.vc-config.json');
const config = JSON.parse(fs.readFileSync(file, 'utf8'));
config.runtime = 'nodejs24.x';
fs.writeFileSync(file, JSON.stringify(config, null, '\t') + '\n');
console.log('Vercel runtime:', config.runtime);
