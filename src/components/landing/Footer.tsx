/**
 * Base discreta do painel.
 *
 * Os links de contato e legais anteriores apontavam para "#" (sem destino
 * real), por isso não são exibidos. Adicione aqui quando houver URLs:
 *   const LINKS = [{ label: "Contato", href: "mailto:..." }, ...]
 */
const LINKS: { label: string; href: string }[] = [];

export function Footer({ className }: { className?: string }) {
    // Sem links, não há rodapé (nem espaço reservado).
    if (LINKS.length === 0) return null;
    return (
        <footer className={className}>
            <nav aria-label="Links legais e contato">
                {LINKS.map((l, i) => (
                    <span key={l.href}>
                        {i > 0 && " · "}
                        <a href={l.href} style={{ color: "inherit" }}>
                            {l.label}
                        </a>
                    </span>
                ))}
            </nav>
        </footer>
    );
}
