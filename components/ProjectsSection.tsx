"use client";

import { RevealBrowserCard } from "@/components/BrowserCard";
import { Reveal } from "@/components/Reveal";
import { CLIENT_PROJECTS, PERSONAL_PROJECTS } from "@/lib/portfolio-data";

export function ProjectsSection() {
  return (
    <section className="section section--work" id="work" aria-labelledby="work-heading">
      <div
        className="work-decor placeholder-media work-decor-render"
        role="img"
        aria-label="Dekoratif 3D render"
      >
        <span className="placeholder-label">Yerine koy: assets/3d-render-mechanical.png</span>
      </div>

      <div className="section-inner">
        <Reveal>
          <div className="work-subsection">
            <p className="section-eyebrow">YAPILMIŞ İŞLER</p>
            <h2 className="section-title" id="work-heading">
              Teslim edilen projeler.
            </h2>
            <p className="section-subtext">
              Anlaşma sağlanmış müşteri işleri. Canlıya alınmış veya teslim sürecindeki projeler.
            </p>
            <div className="browser-grid browser-grid--client" id="client-work-grid">
              {CLIENT_PROJECTS.map((project) => (
                <RevealBrowserCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="work-subsection work-subsection--personal">
            <h2 className="section-title section-title--sm">Kişisel projeler.</h2>
            <p className="section-subtext">
              Kişisel projeler ve sektörel ön çalışma konseptleri. Gerçek marka isimleri kullanılmadan
              sunulmuştur.
            </p>
            <div className="browser-grid browser-grid--personal" id="personal-work-grid">
              {PERSONAL_PROJECTS.map((project) => (
                <RevealBrowserCard key={project.id} project={project} compact />
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
