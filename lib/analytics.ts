// FR-07 (opsional/tahap 2): sambungkan ke Vercel Analytics / Umami / GA di sini nanti.
type AnalyticsEvent = "whatsapp_click" | "maps_click";

export function trackEvent(event: AnalyticsEvent, meta?: Record<string, unknown>) {
  if (process.env.NODE_ENV !== "production") {
    console.debug("[analytics stub]", event, meta);
  }
}
