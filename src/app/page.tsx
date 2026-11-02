import { Hero } from "@/components/landing/Hero";
import { ToolsList } from "@/components/landing/ToolsList";
import { Footer } from "@/components/landing/Footer";
import s from "@/components/landing/home.module.css";
import { preload } from "react-dom";

export default function Home() {
  // Fontes da home (ver @font-face em globals.css).
  preload("/fonts/licensed/NeueMetana-Regular.otf", { as: "font", type: "font/otf", crossOrigin: "anonymous" });
  preload("/fonts/licensed/DxBrutalist-Medium.woff2", { as: "font", type: "font/woff2", crossOrigin: "anonymous" });

  return (
    <div className={s.page}>
      <div className={s.layout}>
        <Hero />
        <main>
          <ToolsList />
          <Footer className={s.footMobile} />
        </main>
      </div>
    </div>
  );
}
