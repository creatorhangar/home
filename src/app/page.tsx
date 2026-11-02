import { Hero } from "@/components/landing/Hero";
import { ToolsList } from "@/components/landing/ToolsList";
import { Footer } from "@/components/landing/Footer";
import s from "@/components/landing/home.module.css";

export default function Home() {
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
