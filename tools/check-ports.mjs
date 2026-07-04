const ports = [3000, 3001, 8080];
for (const port of ports) {
  try {
    const html = await fetch(`http://127.0.0.1:${port}/`, { signal: AbortSignal.timeout(3000) }).then((r) => r.text());
    const cssLinks = [...html.matchAll(/href="([^"]+\.css[^"]*)"/g)].map((m) => m[1]);
    const legacyCss = html.includes('href="styles.css"');
    console.log(`Port ${port}: cssLinks=${cssLinks.length}, legacyStyles=${legacyCss}, nextApp=${html.includes('_next')}`);
    if (cssLinks[0]) {
      const css = await fetch(`http://127.0.0.1:${port}${cssLinks[0]}`).then((r) => r.text());
      console.log(`  CSS len=${css.length}, hero-scroll=${css.includes('.hero-scroll')}`);
    }
  } catch (e) {
    console.log(`Port ${port}: ${e.message}`);
  }
}
