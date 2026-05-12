/**
 * Accessibility Audit Script — Milestone 6
 *
 * Executa axe-core em todas as páginas do MACAEPREV para validar WCAG 2.1 AA.
 * Usage: npx ts-node scripts/accessibility-audit/audit-a11y.ts
 */

import { createRequire } from 'module'
import { chromium } from 'playwright'
import type { Browser, Page } from 'playwright'
import * as fs from 'fs'
import * as path from 'path'

const BASE_URL = 'http://localhost:3000'
const REPORT_DIR = './reports'
const INCLUDE_PROTECTED_PAGES = process.env.A11Y_INCLUDE_PROTECTED === 'true'
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
]

interface AuditResult {
    page: string
    url: string
    timestamp: string
    violations: {
        id: string
        description: string
        impact: string
        nodes: number
    }[]
    wcagLevel: 'A' | 'AA' | 'AAA' | 'none'
}

async function injectAxe(page: Page): Promise<void> {
    const require = createRequire(import.meta.url)
    const axePath = require.resolve('axe-core/axe.min.js')
    const axeSource = fs.readFileSync(axePath, 'utf8')

    await page.addScriptTag({
        content: axeSource,
    })
}

async function getViolations(page: Page): Promise<any[]> {
    try {
        const violations = await page.evaluate(() => {
            return new Promise((resolve) => {
                const axe = (globalThis as any).axe
                if (!axe) {
                    resolve([])
                    return
                }

                axe.run((results: any) => {
                    resolve(results.violations)
                })
            })
        })

        return Array.isArray(violations) ? violations : []
    } catch (error) {
        console.error('Error running axe:', error)
        return []
    }
}

function determineWCAGLevel(violations: any[]): 'A' | 'AA' | 'AAA' | 'none' {
    const hasCritical = violations.some((v: any) => v.impact === 'critical')
    const hasSerious = violations.some((v: any) => v.impact === 'serious')

    if (hasCritical) return 'none'
    if (hasSerious) return 'A'
    return 'AA'
}

async function auditAccessibility() {
    console.log('Starting Accessibility Audit — WCAG 2.1 AA')

    if (!fs.existsSync(REPORT_DIR)) {
        fs.mkdirSync(REPORT_DIR, { recursive: true })
    }

    const browser: Browser = await chromium.launch({ headless: true })
    const results: AuditResult[] = []
    let totalViolations = 0
    let totalPages = 0
    const pagesToScan = INCLUDE_PROTECTED_PAGES ? PAGES : PAGES.filter(page => !page.requiresAuth)

    if (!INCLUDE_PROTECTED_PAGES) {
        console.log('Protected pages skipped in local run. Set A11Y_INCLUDE_PROTECTED=true to include them.')
    }

    try {
        for (const page of pagesToScan) {
            console.log(`Auditing: ${page.name} (${page.path})`)

            const context = await browser.newContext()
            const pageObj = await context.newPage()

            try {
                const url = `${BASE_URL}${page.path}`
                await pageObj.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 })
                await injectAxe(pageObj)
                await pageObj.waitForLoadState('networkidle').catch(() => undefined)
                await pageObj.waitForTimeout(1000)

                const violations = await getViolations(pageObj)
                const result: AuditResult = {
                    page: page.name,
                    url,
                    timestamp: new Date().toISOString(),
                    violations: violations.map((v: any) => ({
                        id: v.id,
                        description: v.description,
                        impact: v.impact || 'unknown',
                        nodes: v.nodes?.length || 0,
                    })),
                    wcagLevel: determineWCAGLevel(violations),
                }

                results.push(result)
                totalViolations += result.violations.length
                totalPages++

                console.log(`  ${result.violations.length} violations | ${result.wcagLevel}`)
            } catch (error) {
                console.error(`  Error: ${error}`)
            } finally {
                await context.close()
            }
        }

        const reportPath = path.join(REPORT_DIR, `a11y-audit-${Date.now()}.json`)
        fs.writeFileSync(reportPath, JSON.stringify(results, null, 2))

        console.log('')
        console.log(`Report saved: ${reportPath}`)
        console.log(`Pages Audited: ${totalPages}`)
        console.log(`Total Violations: ${totalViolations}`)

        if (totalPages > 0) {
            console.log(`Average Violations per Page: ${(totalViolations / totalPages).toFixed(1)}`)
        }

        const criticalCount = results.reduce(
            (sum, r) => sum + r.violations.filter(v => v.impact === 'critical').length,
            0
        )
        const seriousCount = results.reduce(
            (sum, r) => sum + r.violations.filter(v => v.impact === 'serious').length,
            0
        )
        const minorCount = results.reduce(
            (sum, r) => sum + r.violations.filter(v => v.impact === 'minor').length,
            0
        )

        console.log(`Critical: ${criticalCount}`)
        console.log(`Serious: ${seriousCount}`)
        console.log(`Minor: ${minorCount}`)

        const aaCompliant = results.filter(r => r.wcagLevel === 'AA' || r.wcagLevel === 'AAA').length
        console.log(`Level AA or better: ${aaCompliant}/${totalPages}`)

        if (totalViolations === 0) {
            console.log('All pages WCAG 2.1 AA compliant!')
        } else {
            console.log('Issues found. See report for details.')
        }
    } finally {
        await browser.close()
    }
}

auditAccessibility().catch(console.error)
