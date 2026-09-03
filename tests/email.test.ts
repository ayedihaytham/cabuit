import { describe, expect, it } from 'vitest'
import { escapeHtml, layout } from '@/lib/email'

describe('escapeHtml', () => {
  it('neutralise les balises et attributs', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt;',
    )
    expect(escapeHtml(`" onmouseover="x`)).toBe('&quot; onmouseover=&quot;x')
    expect(escapeHtml("O'Brien & Co")).toBe('O&#39;Brien &amp; Co')
  })

  it('laisse le texte simple intact', () => {
    expect(escapeHtml('Café des Nattes')).toBe('Café des Nattes')
  })
})

describe('layout', () => {
  it('produit un fragment HTML avec le CTA quand fourni', () => {
    const html = layout('Titre', '<p>corps</p>', { href: 'https://x.tn', label: 'Aller' })
    expect(html).toContain('Titre')
    expect(html).toContain('<p>corps</p>')
    expect(html).toContain('href="https://x.tn"')
    expect(html).toContain('Aller')
  })
})
