import { Reveal } from "@/components/Reveal";
import { CONTACT, CONTACT_SECTION } from "@/lib/portfolio-data";

export function ContactSection() {
  return (
    <section className="section section--contact" id="contact" aria-labelledby="contact-heading">
      <div className="section-inner">
        <Reveal>
          <div className="contact-block">
            <p className="section-eyebrow">{CONTACT_SECTION.eyebrow}</p>
            <h2 className="section-title" id="contact-heading">
              {CONTACT_SECTION.headline}
            </h2>
            <p className="section-body">{CONTACT_SECTION.subtext}</p>

            <ul className="contact-channels" aria-label="İletişim bilgileri">
              <li>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="contact-channel"
                  aria-label="E-posta gönder"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M4 4h16v16H4V4zm8 8.5L6.5 7h11L12 12.5zm0 1l5.5 4.5h-11L12 13.5z"
                      fill="currentColor"
                    />
                  </svg>
                  <span>{CONTACT.email}</span>
                </a>
              </li>
              <li>
                <a href={CONTACT.phoneHref} className="contact-channel" aria-label="Telefon et">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M6.6 10.8c1.5 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.3 0 .7-.2 1L6.6 10.8z"
                      fill="currentColor"
                    />
                  </svg>
                  <span>{CONTACT.phone}</span>
                </a>
              </li>
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
