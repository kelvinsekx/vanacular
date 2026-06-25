import fs from 'node:fs';
import path from 'node:path';

const yorubaDir = path.resolve(process.cwd(), 'prisma/seeds/contents/yoruba');
const files = fs.readdirSync(yorubaDir);
const result: unknown[] = [];

for (const file of files) {
  if (path.extname(file) === '.json') {
    const data = fs.readFileSync(path.join(yorubaDir, file), 'utf8');
    result.push(JSON.parse(data));
  }
}

export { result };
