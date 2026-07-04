import fs from "fs";

const path = "app/globals.css";
let source = fs.readFileSync(path, "utf8");

if (source.charCodeAt(0) === 0xfeff) {
  source = source.slice(1);
}

source = source.replace(
  /content: " .*?static preview";/,
  'content: " — static preview";'
);

fs.writeFileSync(path, source, { encoding: "utf8" });
console.log("Fixed globals.css (BOM removed, encoding cleaned)");
