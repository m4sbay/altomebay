"use client";
import { Button } from '@/components/ui/Button';
// Never render an error object, driver message, connection URL, or stack trace.
export default function AdminError({reset}:{reset:()=>void}) {
 return <div className="admin-shell"><main className="admin-main"><section className="admin-panel admin-login"><h1 className="text-xl font-semibold">Admin belum dapat diakses</h1><p role="alert" className="mt-3">Basis data belum siap atau sementara tidak dapat dihubungi. Coba lagi atau hubungi pengelola.</p><Button className="mt-5" onClick={reset}>Coba Lagi</Button></section></main></div>;
}
