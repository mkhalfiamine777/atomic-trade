const fs = require('fs');
const path = require('path');

const dirs = ['./session_reports', './active_tasks', '.'];
const excludeFiles = ['README.md', 'LICENSE', 'AI_mkhalfiAmine.md', 'AI_CONTEXT.md'];

let totalFiles = 0;
let allContent = '';
let headers = [];

const walkSync = function (dir, filelist) {
    if (!fs.existsSync(dir)) return filelist;
    const files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function (file) {
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== 'web' && file !== 'ai_chat_archive') {
                // skip subdirs for now as we specified exact dirs
            }
        } else {
            if (file.endsWith('.md') && !excludeFiles.includes(file)) {
                filelist.push(path.join(dir, file));
            }
        }
    });
    return filelist;
};

let allMdFiles = [];
dirs.forEach(d => {
    allMdFiles = allMdFiles.concat(walkSync(d));
});

// Remove duplicates if any
allMdFiles = [...new Set(allMdFiles)];

allMdFiles.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        totalFiles++;

        // Extract headers
        const lines = content.split('\n');
        lines.forEach(line => {
            if (line.trim().startsWith('# ') || line.trim().startsWith('## ')) {
                headers.push(line.trim().replace(/#/g, '').trim());
            }
        });

        allContent += content + ' ';
    } catch (e) {
        console.error('Error reading ' + file);
    }
});

// Word frequency analysis
const words = allContent.toLowerCase().match(/\b\w+\b/g) || [];
const wordCount = {};
const stopWords = ['the', 'and', 'to', 'of', 'in', 'for', 'a', 'on', 'with', 'is', 'as', 'this', 'that', 'from', 'by', 'an', 'at', 'be', 'are', 'was', 'were', 'will', 'not', 'or', 'it', 'can', 'has', 'have', 'all', '1', '2', '3', 'md', 'في', 'من', 'على', 'إلى', 'تم', 'مع', 'هذا', 'التي', 'الذي', 'و', 'أو', 'لا', 'أن', 'عن', 'ما', 'لـ', 'عبر', 'كل', 'ها'];

words.forEach(word => {
    if (word.length > 3 && !stopWords.includes(word)) {
        wordCount[word] = (wordCount[word] || 0) + 1;
    }
});

const topWords = Object.entries(wordCount).sort((a, b) => b[1] - a[1]).slice(0, 30);

const report = `
Total Reports Analyzed: ${totalFiles}

--- Top 30 Keywords ---
${topWords.map(w => `${w[0]}: ${w[1]}`).join('\n')}

--- Random 50 Headers Extracted ---
${headers.sort(() => 0.5 - Math.random()).slice(0, 50).join('\n')}
`;

fs.writeFileSync('reports_summary.txt', report);
console.log('Analysis complete. Wrote to reports_summary.txt');
