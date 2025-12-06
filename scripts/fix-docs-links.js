import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getAllMarkdownFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllMarkdownFiles(filePath, fileList);
    } else if (file.endsWith('.md')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function fixDocsLinks() {
  const docsDir = path.join(__dirname, '../docs/docs');
  const files = getAllMarkdownFiles(docsDir);
  
  let totalReplacements = 0;
  let filesModified = 0;
  
  files.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Replace https://docs.disclosurely.com with https://disclosurely.com/docs
    content = content.replace(/https:\/\/docs\.disclosurely\.com/g, 'https://disclosurely.com/docs');
    // Replace http://docs.disclosurely.com with https://disclosurely.com/docs
    content = content.replace(/http:\/\/docs\.disclosurely\.com/g, 'https://disclosurely.com/docs');
    // Replace docs.disclosurely.com (without protocol) with disclosurely.com/docs
    content = content.replace(/docs\.disclosurely\.com/g, 'disclosurely.com/docs');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      const count = (originalContent.match(/docs\.disclosurely\.com/g) || []).length;
      totalReplacements += count;
      filesModified++;
      const relativePath = path.relative(docsDir, filePath);
      console.log(`✓ Fixed ${relativePath} (${count} replacements)`);
    }
  });
  
  console.log(`\n✅ Total files modified: ${filesModified}`);
  console.log(`✅ Total replacements: ${totalReplacements}`);
}

fixDocsLinks();

