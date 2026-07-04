/**
 * Portfolio content — edit this file to update site copy and project data.
 * Set imageSrc on any project when screenshot is uploaded to assets/projects/
 */
(function (global) {
  "use strict";

  global.PORTFOLIO_DATA = {
    profile: {
      name: "Fatih Emre Barutçu",
      shortName: "Fatih Emre Barutçu",
      title: "Full-Stack Geliştirici",
    },

    bio:
      "Bilgisayar Mühendisliği mezunuyum (2025). Flutter/Dart ve React Native ile mobil uygulamalar, TypeScript, React, Next.js ve Node.js ile web uygulamaları geliştiriyorum. AI API entegrasyonu ve canlıya alınmış projeler konusunda saha deneyimim var. Takım odaklı, sorumluluk sahibi, temiz koda önem veren ve yeni teknolojileri öğrenmeye hevesli bir geliştiriciyim.",

    skills: [
      {
        category: "Web",
        items: [
          "Next.js",
          "React",
          "Express.js",
          "Node.js",
          "MongoDB",
          "Tailwind CSS",
          "REST API",
          "Socket.IO",
          "JWT",
        ],
      },
      {
        category: "Mobil",
        items: ["Flutter", "React Native / Expo"],
      },
      {
        category: "AI & Araçlar",
        items: ["Claude API", "GitHub", "Vercel", "Cursor", "Git"],
      },
      {
        category: "Diller",
        items: ["JavaScript", "TypeScript", "Dart", "C", "C++", "Java", "Python"],
      },
    ],

    experience: [
      {
        role: "Serbest Web Geliştirici",
        company: "Serbest çalışan",
        period: "06/2026'dan beri",
        location: "İzmir, Türkiye",
        description:
          "Next.js/TypeScript/Tailwind ile kurumsal web uygulamaları geliştirdim ve canlıya aldım; srnoto.com dahil. Domain, hosting ve müşteri iletişimi süreçlerini yönettim.",
      },
      {
        role: "Mobil Uygulama Geliştirme Stajyeri",
        company: "Privart Yazılım A.Ş.",
        period: "08/2025 – 10/2025",
        location: "İzmir",
        description:
          "Flutter/Dart ile alışkanlık takip uygulaması geliştirdim (CRUD, 7 günlük ilerleme grafiği, seriler, i18n/tema desteği, JSON yedekleme/geri yükleme).",
      },
      {
        role: "Gönüllü Web Geliştirme Stajyeri",
        company: "Kapsül Teknoloji Platformu",
        period: "09/2023 – 10/2023",
        location: "Konya",
        description: "Arka uç geliştirmeye katkı sağladım.",
      },
    ],

    education: [
      {
        degree: "Bilgisayar Mühendisliği",
        school: "Süleyman Demirel Üniversitesi",
        period: "2022 – 2025",
        location: "Isparta",
      },
      {
        degree: "Bilgisayar Mühendisliği",
        school: "Konya Teknik Üniversitesi",
        period: "2020 – 2022",
        location: "Konya",
      },
    ],

    contact: {
      email: "emrecompbarutcu@gmail.com",
      phone: "+90 533 149 02 51",
    },

    clientProjects: {
      eyebrow: "YAPILMIŞ İŞLER",
      heading: "Teslim edilen projeler.",
      subtext:
        "Anlaşma sağlanmış müşteri işleri. Canlıya alınmış veya teslim sürecindeki projeler.",
      items: [
        {
          id: "srnoto",
          title: "SRNoto",
          url: "https://www.srnoto.com/",
          description: "Kurumsal web sitesi · Canlı müşteri projesi",
          status: "CANLI",
          screenshotFile: "srnoto.png",
          screenshotSrc: "assets/projects/srnoto.png",
        },
        {
          id: "zeynep",
          title: "Zeynep — Klinik Psikolog",
          url: "https://klnk-psk.vercel.app/",
          description: "Klinik psikolog web sitesi · Yapım aşaması",
          status: "YAPIM AŞAMASINDA",
          screenshotFile: "zeynep-klinik.png",
          screenshotSrc: "assets/projects/zeynep-klinik.png",
        },
      ],
    },

    personalProjects: {
      heading: "Kişisel projeler.",
      subtext:
        "Kişisel projeler ve sektörel ön çalışma konseptleri. Gerçek marka isimleri kullanılmadan sunulmuştur.",
      items: [
        {
          id: "nexora",
          title: "Nexora",
          url: "https://nexora-six-wheat.vercel.app/",
          description: "Full-stack e-ticaret · MongoDB, Stripe, NextAuth, Groq",
          screenshotFile: "nexora.png",
          screenshotSrc: "assets/projects/nexora.png",
        },
        {
          id: "cv-analyzer",
          title: "CV Analyzer",
          url: "https://cv-analyzer-kohl.vercel.app/",
          description: "AI CV analizi · Next.js, Groq API, TypeScript",
          screenshotFile: "cv-analyzer.png",
          screenshotSrc: "assets/projects/cv-analyzer.png",
        },
        {
          id: "shopbot",
          title: "ShopBot",
          url: "https://chatbot-demo-seven-lovat.vercel.app/",
          description: "E-ticaret AI chatbot · Groq API",
          screenshotFile: "shopbot.png",
          screenshotSrc: "assets/projects/shopbot.png",
        },
        {
          id: "saglik",
          title: "Sağlık Demo",
          url: "https://avil-saglik.vercel.app/",
          description: "Evde sağlık hizmetleri landing page konsepti",
          screenshotFile: "saglik-demo.png",
          screenshotSrc: "assets/projects/saglik-demo.png",
        },
        {
          id: "sanatci",
          title: "Sanatçı Portfolio",
          url: "https://mustafa-bardakcioglu-portfolio.vercel.app/",
          description: "Kişisel portfolio konsepti",
          screenshotFile: "sanatci-portfolio.png",
          screenshotSrc: "assets/projects/sanatci-portfolio.png",
        },
        {
          id: "lezzet",
          title: "Lezzet House",
          url: "https://restoran-sitesi.vercel.app/",
          description: "Restoran landing page konsepti",
          screenshotFile: "lezzet-house.png",
          screenshotSrc: "assets/projects/lezzet-house.png",
        },
      ],
    },

    contactSection: {
      eyebrow: "İletişim",
      headline: "Bir fikrin var — birlikte canlıya alalım.",
      headlineAlt: "Kod yazmaya hazırım. Projenizi konuşalım.",
      subtext:
        "Web veya mobil uygulama, AI entegrasyonu ya da mevcut bir ürünün geliştirilmesi — projenizi dinleyeyim. Doğrudan e-posta veya telefon ile ulaşabilirsiniz; genellikle 48 saat içinde dönüş yapıyorum.",
    },

    decorative: {
      file: "3d-render-mechanical.png",
      src: null,
      alt: "Dekoratif 3D mekanik render",
    },
  };
})(window);
