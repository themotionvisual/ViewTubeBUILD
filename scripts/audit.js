import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

async function runAudit() {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    const errors = [];
    const consoleLogs = [];

    // Capture console messages
    page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        consoleLogs.push({ type, text });
        if (type === 'error') errors.push(text);
    });

    // Capture page errors
    page.on('pageerror', error => {
        errors.push(error.message);
    });

    try {
        console.log('--- STARTING VIEW TUBE AUDIT ---');
        await page.goto('http://localhost:5174', { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Wait for potential dynamic loads
        await new Promise(r => setTimeout(r, 2000));

        // Take a verification screenshot
        const screenshotPath = path.join(process.cwd(), 'audit_screenshot.png');
        await page.screenshot({ path: screenshotPath, fullPage: true });

        const report = {
            timestamp: new Date().toISOString(),
            status: errors.length > 0 ? 'CRITICAL' : 'STABLE',
            errorCount: errors.length,
            errors: errors,
            logs: consoleLogs,
            screenshot: screenshotPath
        };

        fs.writeFileSync('audit_report.json', JSON.stringify(report, null, 2));
        console.log(`Audit Complete. Status: ${report.status}. Errors: ${report.errorCount}`);
        console.log(`Screenshot saved to: ${screenshotPath}`);

    } catch (e) {
        console.error('Audit failed to connect to dev server at http://localhost:5173');
        console.error(e.message);
    } finally {
        await browser.close();
    }
}

runAudit();
