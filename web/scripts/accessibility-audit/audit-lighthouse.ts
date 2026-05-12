/**
 * Lighthouse Audit Script — Milestone 6
 * 
 * Gera relatórios Lighthouse (performance, accessibility, best practices)
 * para cada página
 * 
 * Usage: npx ts-node scripts/accessibility-audit/audit-lighthouse.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import * as chromeLauncher from 'chrome-launcher'

const BASE_URL = 'http://localhost:3000'
const REPORT_DIR = './reports'
const PAGES = [
    { name: 'Home', path: '/' },
    { name: 'Login', path: '/login' },
]

interface LighthouseScore {
    page: string
    url: string
    scores: {
        performance: number
        accessibility: number
        best_practices: number
        seo: number
    }
    metrics: {
        lcp: number // Largest Contentful Paint
        fid: number // First Input Delay
        cls: number // Cumulative Layout Shift
    }
    failedAccessibilityAudits: {
        id: string
        title: string
        score: number
    }[]
}

async function auditLighthouse() {
    console.log('🚀 Starting Lighthouse Audit — Core Web Vitals\n')

    if (!fs.existsSync(REPORT_DIR)) {
        fs.mkdirSync(REPORT_DIR, { recursive: true })
    }

    const scores: LighthouseScore[] = []
    let chrome: any

    try {
        // Launch Chrome
        chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] })
        const lighthouseModule = await import('lighthouse')
        const lighthouse = lighthouseModule.default ?? lighthouseModule

        const opts = {
            logLevel: 'info' as any,
            output: 'json',
            port: chrome.port,
        }

        for (const page of PAGES) {
            console.log(`📄 Auditing: ${page.name} (${page.path})`)

            const url = `${BASE_URL}${page.path}`

            try {
                const runnerResult = await lighthouse(url, opts as any)

                if (!runnerResult) {
                    console.log(`  ❌ No result for ${page.name}`)
                    continue
                }

                const lhr = runnerResult.lhr as any
                const score: LighthouseScore = {
                    page: page.name,
                    url,
                    scores: {
                        performance: Math.round((lhr.categories.performance?.score ?? 0) * 100),
                        accessibility: Math.round((lhr.categories.accessibility?.score ?? 0) * 100),
                        best_practices: Math.round((lhr.categories['best-practices']?.score ?? 0) * 100),
                        seo: Math.round((lhr.categories.seo?.score ?? 0) * 100),
                    },
                    metrics: {
                        lcp: lhr.audits['largest-contentful-paint']?.numericValue || 0,
                        fid: lhr.audits['max-potential-fid']?.numericValue || lhr.audits['first-input-delay']?.numericValue || 0,
                        cls: lhr.audits['cumulative-layout-shift']?.numericValue || 0,
                    },
                    failedAccessibilityAudits: Object.values(lhr.audits)
                        .filter((audit: any) => audit?.scoreDisplayMode !== 'notApplicable' && audit?.score !== null && audit?.score < 1)
                        .filter((audit: any) => {
                            const category = audit?.scoreDisplayMode ? lhr.categories.accessibility?.auditRefs?.some((ref: any) => ref.id === audit.id) : false
                            return category
                        })
                        .map((audit: any) => ({
                            id: audit.id,
                            title: audit.title,
                            score: audit.score,
                        })),
                }

                scores.push(score)

                console.log(
                    `  ✓ Performance: ${score.scores.performance} | A11y: ${score.scores.accessibility}`
                )
                console.log(
                    `    LCP: ${(score.metrics.lcp / 1000).toFixed(2)}s | CLS: ${score.metrics.cls.toFixed(3)}\n`
                )
                if (score.failedAccessibilityAudits.length > 0) {
                    console.log('    Failed accessibility audits:')
                    for (const audit of score.failedAccessibilityAudits) {
                        console.log(`      - ${audit.id}: ${audit.title}`)
                    }
                    console.log('')
                }
            } catch (error) {
                console.error(`  ❌ Error: ${error}`)
            }
        }

        // Save summary report
        const reportPath = path.join(REPORT_DIR, `lighthouse-audit-${Date.now()}.json`)
        fs.writeFileSync(reportPath, JSON.stringify(scores, null, 2))
        console.log(`📊 Report saved: ${reportPath}`)

        // Print summary
        console.log(`\n${'='.repeat(60)}`)
        console.log(`📈 LIGHTHOUSE SUMMARY`)
        console.log(`${'='.repeat(60)}`)

        const avgPerformance = scores.length
            ? scores.reduce((sum, s) => sum + s.scores.performance, 0) / scores.length
            : 0
        const avgAccessibility = scores.length
            ? scores.reduce((sum, s) => sum + s.scores.accessibility, 0) / scores.length
            : 0
        const avgBestPractices = scores.length
            ? scores.reduce((sum, s) => sum + s.scores.best_practices, 0) / scores.length
            : 0

        console.log(`Pages Audited: ${scores.length}`)
        console.log(`\nAverage Scores:`)
        console.log(`  Performance: ${Math.round(avgPerformance)}/100`)
        console.log(`  Accessibility: ${Math.round(avgAccessibility)}/100`)
        console.log(`  Best Practices: ${Math.round(avgBestPractices)}/100`)

        // Core Web Vitals status
        const goodLCP = scores.filter(s => s.metrics.lcp < 2500).length
        const goodCLS = scores.filter(s => s.metrics.cls < 0.1).length

        console.log(`\nCore Web Vitals Status:`)
        console.log(`  ✅ LCP < 2.5s: ${goodLCP}/${scores.length}`)
        console.log(`  ✅ CLS < 0.1: ${goodCLS}/${scores.length}`)

        if (avgAccessibility >= 90 && goodLCP === scores.length) {
            console.log(`\n🎉 Core Web Vitals and accessibility targets met!\n`)
        } else {
            console.log(`\n⚠️  Areas for improvement identified. See report for details.\n`)
        }
    } finally {
        if (chrome) {
            await chrome.kill()
        }
    }
}

auditLighthouse().catch(console.error)
