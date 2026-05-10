import { Link } from "react-router-dom";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useEffect, useState, FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowUpRight, Mail, Phone, MapPin, Send, ArrowUp, Linkedin, Facebook, Instagram } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const Footer = () => {
  const { content, getImage } = useSiteContent();
  const { toast } = useToast();
  const brandName = (content["brand.name"] ?? "PIHAM").trim();
  const brandTag = (content["brand.tagline"] ?? "Info Services").trim();
  const logoUrl = (content["brand.logo_url"] ?? "").trim() ? getImage("brand.logo_url") : "";
  const tagline = (content["footer.tagline"] ?? "Construire. Innover. Connecter. Solutions BTP, Télécom, Informatique et Fourniture — sous une seule exigence.").trim();
  const email = (content["contact.email"] ?? "pihaminfoservices@gmail.com").trim();
  const phone = (content["contact.phone"] ?? "+228 99 50 00 54").trim();
  const address = (content["contact.address"] ?? "Lomé, Agoè 2 Lions").trim();
  const credit = (content["footer.credit"] ?? "Conçu avec précision.").trim();

  const [pages, setPages] = useState<{ slug: string; title: string }[]>([]);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.from("pages").select("slug,title").eq("published", true).order("title").then(({ data }) => {
      if (data) setPages(data as { slug: string; title: string }[]);
    });
  }, []);

  const onNewsletter = async (e: FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setSubmitting(true);
    // Soft handler — just acknowledge. Wire to a table/webhook later.
    await new Promise((r) => setTimeout(r, 400));
    setSubmitting(false);
    setNewsletterEmail("");
    toast({
      title: "Merci !",
      description: "Vous êtes inscrit à notre lettre d'information.",
    });
  };

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer
      id="footer"
      className="relative isolate overflow-hidden text-white"
      style={{
        background:
          "radial-gradient(120% 80% at 0% 0%, hsl(8 92% 22% / 0.55), transparent 55%), radial-gradient(80% 60% at 100% 100%, hsl(36 75% 35% / 0.35), transparent 60%), linear-gradient(180deg, hsl(24 12% 7%) 0%, hsl(24 14% 4%) 100%)",
      }}
    >
      {/* Top hairline accent */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, hsl(var(--accent) / 0.7), hsl(var(--gold) / 0.6), transparent)" }}
      />
      {/* Subtle grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="container relative pt-20 pb-10">
        {/* Top — brand + newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-14 border-b border-white/10">
          <div className="lg:col-span-7">
            <Link to="/" className="flex items-center gap-3 w-fit group">
              <span className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center overflow-hidden p-1 ring-1 ring-white/20 shadow-[0_8px_24px_-8px_hsl(8_92%_60%/0.5)] transition-transform group-hover:scale-105">
                {logoUrl ? (
                  <img src={logoUrl} alt={brandName} className="h-full w-full object-contain" />
                ) : (
                  <span className="text-neutral-900 font-display font-bold text-xl">{brandName.charAt(0) || "P"}</span>
                )}
              </span>
              <div>
                <div className="font-display font-semibold text-white text-lg leading-none">{brandName}</div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-white/60 mt-1">{brandTag}</div>
              </div>
            </Link>
            <p className="mt-6 max-w-xl text-base text-white/70 leading-relaxed">{tagline}</p>

            {/* Social row */}
            <div className="mt-7 flex items-center gap-3">
              <a
                href={`mailto:${email}`}
                aria-label="Email"
                className="h-10 w-10 rounded-full bg-white/5 hover:bg-[hsl(var(--accent))] hover:text-white border border-white/10 flex items-center justify-center transition-all hover:-translate-y-0.5"
              >
                <Mail className="h-4 w-4" />
              </a>
              <a
                href={`tel:${phone.replace(/\s+/g, "")}`}
                aria-label="Téléphone"
                className="h-10 w-10 rounded-full bg-white/5 hover:bg-[hsl(var(--accent))] hover:text-white border border-white/10 flex items-center justify-center transition-all hover:-translate-y-0.5"
              >
                <Phone className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="h-10 w-10 rounded-full bg-white/5 hover:bg-[hsl(var(--accent))] hover:text-white border border-white/10 flex items-center justify-center transition-all hover:-translate-y-0.5"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="h-10 w-10 rounded-full bg-white/5 hover:bg-[hsl(var(--accent))] hover:text-white border border-white/10 flex items-center justify-center transition-all hover:-translate-y-0.5"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="h-10 w-10 rounded-full bg-white/5 hover:bg-[hsl(var(--accent))] hover:text-white border border-white/10 flex items-center justify-center transition-all hover:-translate-y-0.5"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Newsletter card */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 lg:p-7">
              <div className="text-xs uppercase tracking-[0.25em] text-[hsl(var(--accent-glow))] font-semibold">
                Lettre d'information
              </div>
              <div className="mt-2 font-display text-xl text-white leading-tight">
                Recevez nos projets, études de cas et actualités.
              </div>
              <form onSubmit={onNewsletter} className="mt-5 flex items-center gap-2">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="flex-1 h-12 rounded-xl bg-white/5 border border-white/15 px-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] focus:border-transparent transition"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  aria-label="S'inscrire"
                  className="h-12 px-5 rounded-xl bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent-glow))] text-white font-semibold text-sm flex items-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
                >
                  <Send className="h-4 w-4" />
                  <span className="hidden sm:inline">Envoyer</span>
                </button>
              </form>
              <div className="mt-3 text-[11px] text-white/45">
                Aucun spam. Désabonnement en un clic.
              </div>
            </div>
          </div>
        </div>

        {/* Middle — nav + contact */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 py-12">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-white/50 font-semibold">Navigation</div>
            <ul className="mt-5 space-y-3 text-sm">
              <li><Link to="/#services" className="text-white/80 hover:text-[hsl(var(--accent-glow))] transition-colors inline-flex items-center gap-1 group">Services <ArrowUpRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" /></Link></li>
              <li><Link to="/#showcase" className="text-white/80 hover:text-[hsl(var(--accent-glow))] transition-colors inline-flex items-center gap-1 group">Réalisations <ArrowUpRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" /></Link></li>
              <li><Link to="/#about" className="text-white/80 hover:text-[hsl(var(--accent-glow))] transition-colors inline-flex items-center gap-1 group">À propos <ArrowUpRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" /></Link></li>
              <li><Link to="/#contact" className="text-white/80 hover:text-[hsl(var(--accent-glow))] transition-colors inline-flex items-center gap-1 group">Contact <ArrowUpRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" /></Link></li>
            </ul>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-white/50 font-semibold">Expertises</div>
            <ul className="mt-5 space-y-3 text-sm">
              <li><Link to="/services/btp" className="text-white/80 hover:text-[hsl(var(--accent-glow))] transition-colors">BTP</Link></li>
              <li><Link to="/services/reseaux" className="text-white/80 hover:text-[hsl(var(--accent-glow))] transition-colors">Réseaux & Télécom</Link></li>
              <li><Link to="/services/surete" className="text-white/80 hover:text-[hsl(var(--accent-glow))] transition-colors">Sûreté & Vidéosurveillance</Link></li>
              <li><Link to="/services/fourniture" className="text-white/80 hover:text-[hsl(var(--accent-glow))] transition-colors">Fourniture & Équipements</Link></li>
            </ul>
          </div>

          {pages.length > 0 && (
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-white/50 font-semibold">Ressources</div>
              <ul className="mt-5 space-y-3 text-sm">
                {pages.map((p) => (
                  <li key={p.slug}>
                    <Link to={`/p/${p.slug}`} className="text-white/80 hover:text-[hsl(var(--accent-glow))] transition-colors">{p.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className={pages.length > 0 ? "" : "md:col-span-2"}>
            <div className="text-xs uppercase tracking-[0.25em] text-white/50 font-semibold">Nous joindre</div>
            <ul className="mt-5 space-y-3 text-sm text-white/80">
              <li>
                <a href={`mailto:${email}`} className="inline-flex items-start gap-2 hover:text-[hsl(var(--accent-glow))] transition-colors">
                  <Mail className="h-4 w-4 mt-0.5 text-[hsl(var(--accent-glow))]" />
                  <span className="break-all">{email}</span>
                </a>
              </li>
              <li>
                <a href={`tel:${phone.replace(/\s+/g, "")}`} className="inline-flex items-start gap-2 hover:text-[hsl(var(--accent-glow))] transition-colors">
                  <Phone className="h-4 w-4 mt-0.5 text-[hsl(var(--accent-glow))]" />
                  <span>{phone}</span>
                </a>
              </li>
              <li className="inline-flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-[hsl(var(--accent-glow))]" />
                <span>{address}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/55">
          <div>© {new Date().getFullYear()} <span className="text-white/80 font-medium">{brandName} {brandTag}</span>. Tous droits réservés.</div>
          <div className="flex items-center gap-5">
            <span>{credit}</span>
            <button
              onClick={scrollTop}
              aria-label="Retour en haut"
              className="h-9 w-9 rounded-full bg-white/5 hover:bg-[hsl(var(--accent))] border border-white/10 hover:border-transparent flex items-center justify-center transition-all hover:-translate-y-0.5"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
