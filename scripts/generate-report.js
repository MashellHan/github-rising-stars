#!/usr/bin/env node
/**
 * GitHub 新星速报 - 报告生成器
 * 
 * 用法:
 *   node generate-report.js --date 2026-03-16 --projects projects.json
 * 
 * projects.json 格式:
 * {
 *   "projects": [
 *     {
 *       "id": "trump-code",
 *       "name": "sstklen/trump-code",
 *       "stars": 198,
 *       "index": 98.0,
 *       "language": "Python",
 *       "description": "AI解码川普推文与美股关联",
 *       "content": "HTML内容..."
 *     }
 *   ]
 * }
 */

const fs = require('fs');
const path = require('path');

// 解析命令行参数
const args = process.argv.slice(2);
const getArg = (name) => {
    const idx = args.indexOf(`--${name}`);
    return idx !== -1 ? args[idx + 1] : null;
};

const date = getArg('date') || new Date().toISOString().split('T')[0];
const projectsFile = getArg('projects');

// 路径配置
const ROOT = path.resolve(__dirname, '..');
const TEMPLATES_DIR = path.join(ROOT, 'templates');
const REPORTS_DIR = path.join(ROOT, 'reports');
const MANIFEST_PATH = path.join(REPORTS_DIR, 'manifest.json');

// 格式化日期
function formatDate(dateStr) {
    const d = new Date(dateStr);
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日 · ${weekdays[d.getDay()]}`;
}

// 生成项目导航
function generateProjectNav(projects) {
    return projects.map(p => `
        <li>
            <a href="#${p.id}">
                ${p.name.split('/')[1]}
                <span class="stars">⭐${p.stars}</span>
            </a>
        </li>
    `).join('');
}

// 生成项目内容
function generateProjectContent(projects) {
    return projects.map((p, i) => `
        <section id="${p.id}" class="project-section">
            <div class="section-badge">
                <span class="section-number">${String(i + 1).padStart(2, '0')}</span>
            </div>
            <h2 class="section-title">${p.name.split('/')[1]}：${p.description}</h2>
            
            <div class="stats-inline">
                <span class="stat">⭐ ${p.stars} Stars</span>
                <span class="stat">📈 指数 ${p.index}</span>
                <span class="stat">🔧 ${p.language}</span>
            </div>
            
            ${p.content}
            
            <div class="project-link">
                <span>📂 项目地址：</span>
                <a href="https://github.com/${p.name}" target="_blank">https://github.com/${p.name}</a>
            </div>
        </section>
    `).join('\n<hr>\n');
}

// 更新 manifest
function updateManifest(date, projects) {
    let manifest = { reports: [], lastUpdated: null };
    
    if (fs.existsSync(MANIFEST_PATH)) {
        manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    }
    
    // 移除旧的同日期报告
    manifest.reports = manifest.reports.filter(r => r.date !== date);
    
    // 添加新报告到开头
    manifest.reports.unshift({
        date,
        title: 'GitHub 新星速报',
        projectCount: projects.length,
        totalStars: projects.reduce((sum, p) => sum + p.stars, 0),
        topIndex: Math.max(...projects.map(p => p.index)),
        projects: projects.map(p => ({
            name: p.name,
            stars: p.stars,
            index: p.index
        }))
    });
    
    manifest.lastUpdated = new Date().toISOString();
    
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
    console.log(`✅ Updated manifest.json`);
}

// 生成报告
function generateReport(date, projects) {
    const template = fs.readFileSync(path.join(TEMPLATES_DIR, 'report.html'), 'utf8');
    
    const title = `${projects.length}个GitHub新星项目速报`;
    const timestamp = new Date().toLocaleString('zh-CN', { 
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    let html = template
        .replace(/\{\{TITLE\}\}/g, title)
        .replace(/\{\{DATE\}\}/g, date)
        .replace(/\{\{DATE_FORMATTED\}\}/g, formatDate(date))
        .replace(/\{\{PROJECT_COUNT\}\}/g, projects.length)
        .replace(/\{\{TIMESTAMP\}\}/g, timestamp)
        .replace(/\{\{PROJECT_NAV\}\}/g, generateProjectNav(projects))
        .replace(/\{\{CONTENT\}\}/g, generateProjectContent(projects));
    
    // 创建报告目录
    const reportDir = path.join(REPORTS_DIR, date);
    fs.mkdirSync(reportDir, { recursive: true });
    fs.mkdirSync(path.join(reportDir, 'images'), { recursive: true });
    
    // 写入 HTML
    fs.writeFileSync(path.join(reportDir, 'index.html'), html);
    console.log(`✅ Generated reports/${date}/index.html`);
    
    // 更新 manifest
    updateManifest(date, projects);
}

// 主函数
function main() {
    if (!projectsFile) {
        console.log('用法: node generate-report.js --date 2026-03-16 --projects projects.json');
        console.log('\n或者直接在代码中调用 generateReport(date, projects)');
        process.exit(1);
    }
    
    const projects = JSON.parse(fs.readFileSync(projectsFile, 'utf8')).projects;
    generateReport(date, projects);
}

// 导出供外部使用
module.exports = { generateReport, updateManifest, formatDate };

// 如果直接运行
if (require.main === module) {
    main();
}
