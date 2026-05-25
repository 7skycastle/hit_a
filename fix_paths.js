const fs = require('fs');
const path = require('path');

const replaceInFile = (file, search, replace) => {
  const p = path.resolve(__dirname, 'server/src', file);
  let c = fs.readFileSync(p, 'utf8');
  c = c.replace(search, replace);
  fs.writeFileSync(p, c);
  console.log(`Replaced in ${file}`);
};

// 1. index.ts
replaceInFile('index.ts', 
  "const generatedImagesPath = path.join(__dirname, '../generated/images');",
  "const generatedImagesPath = process.env.NODE_ENV === 'production' ? '/tmp/hit_a/generated/images' : path.join(__dirname, '../generated/images');\nif(!fs.existsSync(generatedImagesPath)) fs.mkdirSync(generatedImagesPath, {recursive: true});"
);

// 2. contentRoutes.ts
replaceInFile('routes/contentRoutes.ts',
  "const dest = path.join(__dirname, '../../uploads/company');",
  "const dest = process.env.NODE_ENV === 'production' ? '/tmp/hit_a/uploads/company' : path.join(__dirname, '../../uploads/company');\n    if(!fs.existsSync(dest)) fs.mkdirSync(dest, {recursive: true});"
);
replaceInFile('routes/contentRoutes.ts',
  "const originalPdfPath = path.relative(path.join(__dirname, '../../'), file.path);",
  "const originalPdfPath = process.env.NODE_ENV === 'production' ? path.relative('/tmp/hit_a', file.path) : path.relative(path.join(__dirname, '../../'), file.path);"
);

// 3. examRoutes.ts
replaceInFile('routes/examRoutes.ts',
  "const dest = path.join(__dirname, '../../uploads/exam');",
  "const dest = process.env.NODE_ENV === 'production' ? '/tmp/hit_a/uploads/exam' : path.join(__dirname, '../../uploads/exam');\n    if(!fs.existsSync(dest)) fs.mkdirSync(dest, {recursive: true});"
);
replaceInFile('routes/examRoutes.ts',
  "const originalPdfPath = path.relative(path.join(__dirname, '../../'), file.path);",
  "const originalPdfPath = process.env.NODE_ENV === 'production' ? path.relative('/tmp/hit_a', file.path) : path.relative(path.join(__dirname, '../../'), file.path);"
);

// 4. dbService.ts
replaceInFile('services/dbService.ts',
  "private static companyPath = path.join(__dirname, '../data/companyContents.json');\n  private static examPath = path.join(__dirname, '../data/examContents.json');\n  private static reportPath = path.join(__dirname, '../data/reports.json');",
  `private static get companyPath() { const p = process.env.NODE_ENV === 'production' ? '/tmp/hit_a/data/companyContents.json' : path.join(__dirname, '../data/companyContents.json'); if(!fs.existsSync(path.dirname(p))) fs.mkdirSync(path.dirname(p), {recursive: true}); return p; }
  private static get examPath() { const p = process.env.NODE_ENV === 'production' ? '/tmp/hit_a/data/examContents.json' : path.join(__dirname, '../data/examContents.json'); if(!fs.existsSync(path.dirname(p))) fs.mkdirSync(path.dirname(p), {recursive: true}); return p; }
  private static get reportPath() { const p = process.env.NODE_ENV === 'production' ? '/tmp/hit_a/data/reports.json' : path.join(__dirname, '../data/reports.json'); if(!fs.existsSync(path.dirname(p))) fs.mkdirSync(path.dirname(p), {recursive: true}); return p; }`
);

// 5. pdfService.ts
replaceInFile('services/pdfService.ts',
  "private static uploadDir = path.join(__dirname, '../../uploads');\n  private static generatedDir = path.join(__dirname, '../../generated');",
  `private static get uploadDir() { const p = process.env.NODE_ENV === 'production' ? '/tmp/hit_a/uploads' : path.join(__dirname, '../../uploads'); if(!fs.existsSync(p)) fs.mkdirSync(p, {recursive: true}); return p; }
  private static get generatedDir() { const p = process.env.NODE_ENV === 'production' ? '/tmp/hit_a/generated' : path.join(__dirname, '../../generated'); if(!fs.existsSync(p)) fs.mkdirSync(p, {recursive: true}); return p; }`
);
