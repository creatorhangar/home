import { Hero } from "@/components/landing/Hero";
import { ToolsList } from "@/components/landing/ToolsList";
import { Footer } from "@/components/landing/Footer";
import { archivo, instrumentSans, montserrat, robotoFlex } from "@/fonts/home";
import s from "@/components/landing/home.module.css";

export default function Home() {
  return (
    <div lang="en" className={`${s.page} ${robotoFlex.variable} ${instrumentSans.variable} ${archivo.variable} ${montserrat.variable}`}>
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
