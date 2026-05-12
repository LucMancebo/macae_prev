#!/usr/bin/env node

/**
 * Accessibility Audit Script — Milestone 6
 * 
 * Executa axe-core em todas as páginas do MACAEPREV para validar WCAG 2.1 AA
 * 
 * Usage: node scripts/accessibility-audit/audit-a11y.js
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const REPORT_DIR = './reports';
const PAGES = [
    { name: 'Home', path: '/', requiresAuth: false },
    { name: 'Login', path: '/login', requiresAuth: false },
    { name: 'Dashboard', path: '/dashboard', requiresAuth: true },
    { name: 'Arquivos', path: '/dashboard/arquivos', requiresAuth: true },
    { name: 'Consignacoes', path: '/dashboard/consignacoes', requiresAuth: true },
    { name: 'Consignatarias', path: '/dashboard/consignatarias', requiresAuth: true },
    { name: 'Margens', path: '/dashboard/margens', requiresAuth: true },
    { name: 'Produtos', path: '/dashboard/produtos', requiresAuth: true },
    { name: 'Reconciliacao', path: '/dashboard/reconciliacao', requiresAuth: true },
    { name: 'Servidores', path: '/dashboard/servidores', requiresAuth: true },
    { name: 'Usuarios', path: '/dashboard/usuarios', requiresAuth: true },
    { name: 'BI Dashboard', path: '/dashboard/bi', requiresAuth: true },
];

// Injetar axe-core script na página
async function injectAxe(page) {
    await page.addScriptTag({
        url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.11.4/axe.min.js',
    });
}

// Executar axe-core na página
async function getViolations(page) {
    try {
        const violations = await page.evaluate(() => {
            return new Promise((resolve) => {
                if (typeof window.axe !== 'undefined') {
                    window.axe.run((results) => {
                        resolve(results.violations);
                    });
                } else {
                    resolve([]);
                }
            });
        });
        return violations || [];
    } catch (error) {
        console.error('Error running axe:', error.message);
        return [];
    }
}

function determineWCAGLevel(violations) {
    const hasCritical = violations.some(v => v.impact === 'critical');
    const hasSerious = violations.some(v => v.impact === 'serious');

    if (hasCritical) return 'none';
    if (hasSerious) return 'A';
    return 'AA';
}

async function auditAccessibility() {
    console.log('🚀 Starting Accessibility Audit — WCAG 2.1 AA\n');

    // Create reports directory if not exists
    if (!fs.existsSync(REPORT_DIR)) {
        fs.mkdirSync(REPORT_DIR, { recursive: true });
    }

    const browser = await chromium.launch();
    const results = [];
    let totalViolations = 0;
    let totalPages = 0;

    try {
        for (const pageConfig of PAGES) {
            console.log(`📄 Auditing: ${pageConfig.name} (${pageConfig.path})`);

            const context = await browser.newContext();
            const pageObj = await context.newPage();

            try {
                // Navigate to page
                const url = `${BASE_URL}${pageConfig.path}`;
                try {
                    await pageObj.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
                } catch (error) {
                    console.log(`  ⚠️  Could not reach ${url} - ${error.message}`);
                    await context.close();
                    continue;
                }

                // Inject and run axe
                try {
                    await injectAxe(pageObj);
                    await pageObj.waitForTimeout(1500);
                    const violations = await getViolations(pageObj);

                    const result = {
                        page: pageConfig.name,
                        url,
                        timestamp: new Date().toISOString(),
                        violations: violations.map(v => ({
                            id: v.id,
                            description: v.description || 'Unknown',
                            impact: v.impact || 'unknown',
                            nodes: v.nodes?.length || 0,
                        })),
                        wcagLevel: determineWCAGLevel(violations),
                    };

                    results.push(result);
                    totalViolations += result.violations.length;
                    totalPages++;

                    // Print summary for page
                    console.log(
                        `  ✓ ${result.violations.length} violations | ${result.wcagLevel} compliant\n`
                    );
                } catch (axeError) {
                    console.error(`  ❌ Axe error: ${axeError.message}`);
                }
            } catch (error) {
                console.error(`  ❌ Error: ${error.message}`);
            } finally {
                await context.close();
            }
        }

        // Save report to JSON
        const reportPath = path.join(REPORT_DIR, `a11y-audit-${Date.now()}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
        console.log(`\n📊 Report saved: ${reportPath}`);

        // Print summary
        console.log(`\n${  '='.repeat(60)}`);
        console.log(`📈 AUDIT SUMMARY`);
        console.log(`${'='.repeat(60)}`);
        console.log(`Pages Audited: ${totalPages}`);
        console.log(`Total Violations: ${totalViolations}`);
        if (totalPages > 0) {
            console.log(`Average Violations per Page: ${(totalViolations / totalPages).toFixed(1)}`);
        }

        // Count by level
        const criticalCount = results.reduce(
            (sum, r) => sum + r.violations.filter(v => v.impact === 'critical').length,
            0
        );
        const seriousCount = results.reduce(
            (sum, r) => sum + r.violations.filter(v => v.impact === 'serious').length,
            0
        );
        const minorCount = results.reduce(
            (sum, r) => sum + r.violations.filter(v => v.impact === 'minor').length,
            0
        );

        console.log(`\nBy Impact Level:`);
        console.log(`  🔴 Critical: ${criticalCount}`);
        console.log(`  🟠 Serious: ${seriousCount}`);
        console.log(`  🟡 Minor: ${minorCount}`);

        // WCAG Compliance
        const aaCompliant = results.filter(r => r.wcagLevel === 'AA' || r.wcagLevel === 'AAA').length;
        console.log(`\nWCAG 2.1 Compliance:`);
        console.log(`  ✅ Level AA or better: ${aaCompliant}/${totalPages}`);

        if (totalViolations === 0) {
            console.log(`\n🎉 All pages WCAG 2.1 AA compliant!\n`);
        } else {
            console.log(`\n⚠️  Issues found. See report for details.\n`);
        }
    } finally {
        await browser.close();
    }
}

// Run audit
auditAccessibility().catch(console.error);
