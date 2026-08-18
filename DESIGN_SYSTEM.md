# JobTracker Design System

> **Theme**: Clean Modern SaaS (*Stripe & Craft inspired*)  
> **Vibe**: Trustworthy, crisp, delightful micro-interactions, bright neutrals, tactile ergonomics  
> **Typography**: **General Sans** (Headings & UI) + **Inter Tight** (Body & Meta) + **JetBrains Mono** (Tabular Numerals)

---

## 1. Design Philosophy & Visual Language

1. **Crisp Clarity & White Space**: Bright, breathable canvas with crisp white cards (`#ffffff`) floating over ultra-clean slate canvas (`#f8fafc`).
2. **Tactile Ergonomics**: Buttons with subtle top-highlight bevels, crisp 1px borders (`#e2e8f0`), and realistic pressed feedback.
3. **Soft Spring Micro-Interactions**: Cards and interactive elements respond with snappy spring timing curves (`cubic-bezier(0.16, 1, 0.3, 1)`), avoiding sluggish transitions.
4. **Stripe-Grade Shadows**: Multi-layered, diffused shadows with low opacity for an authentic, premium SaaS feel.

---

## 2. Color System & Design Tokens

### 2.1 Core Neutral Canvas

| Token Name | Hex Code | Purpose |
| :--- | :--- | :--- |
| `--bg-canvas` | `#F8FAFC` (Slate 50) | Global application background |
| `--surface-card` | `#FFFFFF` | Primary card, panel, and modal background |
| `--surface-subtle` | `#F1F5F9` (Slate 100) | Secondary containers, table headers, inactive tabs |
| `--surface-hover` | `#F8FAFC` (Slate 50) | Interactive row / item hover state |
| `--border-default` | `#E2E8F0` (Slate 200) | Standard crisp 1px borders and dividers |
| `--border-subtle` | `#F1F5F9` (Slate 100) | Sub-element dividers & inner borders |
| `--border-focus` | `#2563EB` (Royal Blue) | Focus rings and active card borders |

---

### 2.2 Brand & Semantic Accents

| Token Name | Hex Code | Tailwind / HSL | Usage |
| :--- | :--- | :--- | :--- |
| `--primary-blue` | `#2563EB` | Royal Blue (600) | Primary actions, CTA buttons, links |
| `--primary-blue-hover`| `#1D4ED8` | Blue (700) | Primary hover & active states |
| `--primary-blue-subtle`| `rgba(37, 99, 235, 0.08)` | Blue tint | Active pill backgrounds, selected rows |
| `--accent-emerald` | `#059669` | Teal Emerald (600) | Job offers, positive salary stats, success badges |
| `--accent-emerald-subtle`| `rgba(5, 150, 105, 0.08)`| Emerald tint | Offer status background, positive metric pills |
| `--accent-amber` | `#D97706` | Amber (600) | Screening stages, urgent follow-up warnings |
| `--accent-violet` | `#7C3AED` | Violet (600) | Interview stage badges, AI recommendations |
| `--accent-rose` | `#E11D48` | Rose (600) | Rejections, destructive actions |

---

### 2.3 Typography & Content Hierarchy

```
Primary Text:     #0F172A (Slate 900 - High contrast, crisp headers and labels)
Secondary Text:   #475569 (Slate 600 - Body copy, descriptions, card metadata)
Muted Text:       #7C8896 (Slate 500 - Contrast-checked timestamps, helper text)
Inverted Text:    #FFFFFF (White - Badges, primary button labels)
```

---

### 2.4 Pipeline Stage System

Every job application status uses a semantic pill with a soft pastel background, a vibrant text color, and a live status dot:

```
┌─────────────────┬───────────┬──────────────────────┬───────────────────────────────┐
│ Stage           │ Dot / Hex │ Soft Pill Background │ Description                   │
├─────────────────┼───────────┼──────────────────────┼───────────────────────────────┤
│ 1. Wishlist     │ #64748B   │ rgba(100,116,139,0.08)│ Bookmarked for research       │
│ 2. Applied      │ #2563EB   │ rgba(37, 99, 235, 0.08)│ Application submitted         │
│ 3. Screening    │ #D97706   │ rgba(217, 119, 6, 0.08)│ Recruiter call / OA scheduled │
│ 4. Interviewing │ #7C3AED   │ rgba(124, 58, 237, 0.08)│ Tech / Behavioral / Onsite loop│
│ 5. Offer        │ #059669   │ rgba(5, 150, 105, 0.10)│ Offer extended / Negotiating  │
│ 6. Rejected     │ #E11D48   │ rgba(225, 29, 72, 0.08)│ Position closed or declined   │
│ 7. Archived     │ #71717A   │ rgba(113,113,122,0.08)│ Ghosted / Withdrawn           │
└─────────────────┴───────────┴──────────────────────┴───────────────────────────────┘
```

---

## 3. Typography Hierarchy

- **Headings & UI Controls**: `'General Sans', 'Inter Tight', -apple-system, sans-serif`
- **Body & Metadata**: `'Inter Tight', 'General Sans', sans-serif`
- **Numerical & Tabular Data**: `'JetBrains Mono', 'SF Mono', monospace` (applied to salaries, conversion %, dates)

```css
/* Typography Scale */
--text-xs:    0.75rem;    /* 12px - Status dots, helper badges, micro timestamps */
--text-sm:    0.875rem;   /* 14px - Table content, card role meta, input labels */
--text-base:  1.00rem;    /* 16px - Standard body, primary button text */
--text-lg:    1.125rem;   /* 18px - Section headers, card titles */
--text-xl:    1.25rem;    /* 20px - Modal titles, drawer headlines */
--text-2xl:   1.50rem;    /* 24px - Dashboard page titles, primary KPI numbers */
--text-3xl:   1.875rem;   /* 30px - Overview stats & hero totals */
```

---

## 4. Elevation, Shadows & Tactile Borders

```css
/* Multi-layer Soft Shadows */
--shadow-xs: 0 1px 2px 0 rgba(15, 23, 42, 0.04);
--shadow-sm: 0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04);
--shadow-card: 0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 2px 4px -2px rgba(15, 23, 42, 0.03);
--shadow-card-hover: 0 12px 24px -4px rgba(15, 23, 42, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.03);
--shadow-modal: 0 20px 25px -5px rgba(15, 23, 42, 0.10), 0 8px 10px -6px rgba(15, 23, 42, 0.04);
--shadow-dropdown: 0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.03);

/* Tactile Button Shadows */
--shadow-button-primary: 0 1px 2px 0 rgba(37, 99, 235, 0.25), inset 0 1px 0 0 rgba(255, 255, 255, 0.18);
--shadow-button-secondary: 0 1px 2px 0 rgba(15, 23, 42, 0.05), inset 0 1px 0 0 #ffffff;

/* Radii Scale */
--radius-sm: 6px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;
```

---

## 5. CSS Tokens Foundation

```css
@import url('https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');

:root {
  --bg-canvas: #f8fafc;
  --surface-card: #ffffff;
  --surface-subtle: #f1f5f9;
  --surface-hover: #f8fafc;

  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #7c8896;

  --border-default: #e2e8f0;
  --border-subtle: #f1f5f9;
  --border-focus: #2563eb;

  --primary-blue: #2563eb;
  --primary-blue-hover: #1d4ed8;
  --primary-blue-subtle: rgba(37, 99, 235, 0.08);

  --accent-emerald: #059669;
  --accent-emerald-subtle: rgba(5, 150, 105, 0.08);

  --accent-amber: #d97706;
  --accent-amber-subtle: rgba(217, 119, 6, 0.08);

  --accent-violet: #7c3aed;
  --accent-violet-subtle: rgba(124, 58, 237, 0.08);

  --accent-rose: #e11d48;
  --accent-rose-subtle: rgba(225, 29, 72, 0.08);

  --font-display: 'General Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-body: 'Inter Tight', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  --transition-spring: all 200ms cubic-bezier(0.16, 1, 0.3, 1);
}
```
