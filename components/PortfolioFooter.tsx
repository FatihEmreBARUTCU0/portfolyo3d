export function PortfolioFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="portfolio-footer">
      <p>© {year} Fatih Emre Barutçu. Tüm hakları saklıdır.</p>
    </footer>
  );
}
