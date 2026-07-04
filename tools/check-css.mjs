const base = "http://127.0.0.1:3000";
const html = await fetch(base).then((r) => r.text());
const cssLinks = [...html.matchAll(/href="([^"]+\.css[^"]*)"/g)].map((m) => m[1]);
console.log("CSS links:", cssLinks);

if (cssLinks.length === 0) {
  console.log("NO CSS LINKS FOUND");
  console.log(html.slice(0, 2000));
  process.exit(1);
}

const css = await fetch(base + cssLinks[0]).then((r) => {
  console.log("CSS status:", r.status);
  return r.text();
});

console.log("CSS length:", css.length);
console.log("has .hero-scroll:", css.includes(".hero-scroll"));
console.log("has .loading-wrap:", css.includes(".loading-wrap"));
console.log("has .section--about:", css.includes(".section--about"));
