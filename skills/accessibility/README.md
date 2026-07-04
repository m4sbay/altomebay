# Accessibility (a11y) — Best Practices & Helpers

Kumpulan pattern aksesibilitas yang sering dibutuhkan dalam project web modern.

Referensi: WAI-ARIA Authoring Practices, Apple HIG Accessibility

---

## Screen reader utilities

Class untuk teks yang hanya bisa dibaca screen reader:

```tsx
<span className="absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0,0,0,0)]">
  Navigasi utama
</span>
```

Komponen `VisuallyHidden` (salin ke `components/` atau `lib/a11y.ts` bila dipakai runtime):

```tsx
function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0,0,0,0)]">
      {children}
    </span>
  );
}
```

---

## Focus management

Focus ring visible — ala macOS:

```ts
const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:focus-visible:outline-white";
```

Focus ring untuk background gelap:

```ts
const focusRingLight =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
```

---

## ARIA patterns

Props untuk elemen draggable (mis. di `WidgetShell`):

```ts
function draggableProps(label: string) {
  return {
    role: "button" as const,
    tabIndex: 0,
    "aria-roledescription": "draggable",
    "aria-label": label,
  };
}
```

Props untuk tombol toggle (mis. dark mode):

```ts
function toggleProps(label: string, pressed: boolean) {
  return {
    role: "button" as const,
    "aria-label": label,
    "aria-pressed": pressed,
  };
}
```

---

## Skip link

Tempatkan di awal `<body>`:

```tsx
<a
  href="#main-content"
  className={
    "sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] " +
    "focus:rounded-lg focus:bg-zinc-950 focus:px-4 focus:py-2 focus:text-sm " +
    "focus:font-medium focus:text-white dark:focus:bg-white dark:focus:text-zinc-950"
  }
>
  Skip to content
</a>
```

---

## Color contrast notes (WCAG AA)

| Pairing | Ratio | Level |
|---------|-------|-------|
| zinc-950 on white | 19.1:1 | AAA |
| zinc-600 on white | 5.9:1 | AA |
| zinc-50 on zinc-950 | 16.8:1 | AAA |
| zinc-300 on zinc-950 | 8.6:1 | AAA |
| zinc-400 on white | 3.5:1 | AA Large only |
| zinc-300 on white | 1.9:1 | Fail |

Sumber: https://webaim.org/resources/contrastchecker/
