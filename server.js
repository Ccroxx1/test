const express = require("express");
const path = require("path");
const cheerio = require("cheerio");

const app = express();
const PORT = process.env.PORT || 3000;
const SOURCE = "https://torrentgalaxy.one";

app.use(express.static(path.join(__dirname, "dist")));

function clean(text, keepNewlines = false) {
  if (!text) return "";
  if (keepNewlines) {
    return text.replace(/\u00a0/g, " ").replace(/[ \t]+/g, " ").trim();
  }
  return text.replace(/\s+/g, " ").replace(/\u00a0/g, " ").trim();
}

function absUrl(value) {
  if (!value) return "";
  try { return new URL(value, SOURCE).href; } catch { return ""; }
}

function imageFrom(el) {
  const images = el.find("img").toArray();
  let foundUrl = "";

  for (const imgEl of images) {
    const img = cheerio.load(imgEl)("img");
    const url = img.attr("src") ||
      img.attr("data-src") ||
      img.attr("data-lazy-src") ||
      img.attr("data-original") ||
      "";

    if (!url) continue;

    // Skip known icon/category patterns
    const lowerUrl = url.toLowerCase();
    if (
      lowerUrl.includes("/categories/") ||
      lowerUrl.includes("/template/") ||
      lowerUrl.includes("ico_") ||
      lowerUrl.includes("icon") ||
      lowerUrl.includes("logo") ||
      lowerUrl.includes("banner")
    ) continue;

    foundUrl = url;
    break;
  }

  // If no poster found, check for a data-poster attribute on the row itself
  if (!foundUrl) {
    foundUrl = el.attr("data-poster") || el.attr("data-thumb") || "";
  }

  // Try to upgrade thumbnail to full image if it's a known TorrentGalaxy pattern
  if (foundUrl.includes("/images/torrents/t/")) {
    foundUrl = foundUrl.replace("/images/torrents/t/", "/images/torrents/f/");
  }

  return foundUrl ? absUrl(foundUrl) : "";
}

function findByPattern(text, patterns) {
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return clean(m[1]);
  }
  return "";
}

function parseStats(row) {
  const raw = clean(row.text());
  let seeds = "0", leechers = "0";

  const seedHtml = row.html() || "";
  const green = seedHtml.match(/color=["']green["'][^>]*>.*?<b>([\\d,]+)/is);
  const red = seedHtml.match(/color=["']#ff0000["'][^>]*>.*?<b>([\\d,]+)/is);

  if (green) seeds = green[1].replace(/,/g, "");
  if (red) leechers = red[1].replace(/,/g, "");

  // Fallback: common S/L or "seeders/leechers" text patterns.
  const sl = raw.match(/(?:S\/L|Seeders\s*\/\s*Leechers)\s*[:\-]?\s*(\d[\d,]*)\s*\/\s*(\d[\d,]*)/i);
  if (sl) {
    seeds = sl[1].replace(/,/g, "");
    leechers = sl[2].replace(/,/g, "");
  }
  return { seeds, leechers };
}

function parseRow(row) {
  const cells = row.find(".tgxtablecell").toArray();
  if (cells.length < 3) return null;

  let titleAnchor = row.find("a.txlight").first();
  if (!titleAnchor.length) titleAnchor = row.find("a").filter((_, a) => clean(cheerio.load(a).text())).first();
  if (!titleAnchor.length) return null;

  const title = clean(titleAnchor.attr("title") || titleAnchor.text());
  if (!title) return null;

  const href = row.attr("data-href") || titleAnchor.attr("href") || "";
  const url = absUrl(href);
  if (!url) return null;

  const image = imageFrom(row);
  const rowText = clean(row.text());
  const { seeds, leechers } = parseStats(row);

  const size = findByPattern(rowText, [
    /(?:^|\\s)(\\d+(?:\\.\\d+)?\\s*(?:TB|GB|MB|KB))(?:\\s|$)/i
  ]) || "—";

  const year = (title.match(/\\b(19\\d{2}|20\\d{2})\\b/) || [])[1] || "";
  const quality = (title.match(/\\b(2160p|4K|1080p|720p|480p|WEB-DL|WEBRip|BluRay|HDR|REMUX|CAM|HDCAM|TS|TELESYNC)\\b/i) || [])[1] || "";

  // Enhanced Categorization
  let category = findByPattern(rowText, [
    /(?:category|cat)\\s*[:\\-]\\s*([^|]+)/i
  ]) || "";

  const titleLower = title.toLowerCase();
  const catLower = category.toLowerCase();

  // 1. CAMs Detection
  if (titleLower.match(/\\b(cam|hdcam|ts|telesync|workprint)\\b/i) || catLower.includes("cam")) {
    category = "CAMs";
  }
  // 2. Split Scenes Detection
  else if (catLower.includes("split scene") || catLower.includes("split-scene")) {
    category = "Split Scenes";
  }
  // 3. TV Packs (Full Season / Complete Series)
  else if (
    titleLower.match(/s\\d{1,2}(?!e\\d)/i) || // Matches S01 but NOT S01E01
    titleLower.match(/season\\s?\\d+/i) ||
    titleLower.match(/complete\\s(series|season)/i) ||
    titleLower.match(/s\\d{1,2}-s\\d{1,2}/i) || // Matches S01-S05
    (catLower.includes("pack") && catLower.includes("tv"))
  ) {
    category = "TV Packs";
  }
  // 4. TV Episodes
  else if (titleLower.match(/s\\d{1,2}e\\d{1,2}/i) || catLower.includes("episode")) {
    category = "TV Episodes";
  }
  // 5. Movies (Default if not TV/CAM/Scene)
  else if (catLower.includes("movie") || quality || titleLower.includes("bluray") || titleLower.includes("web-dl")) {
    category = "Movies";
  }
  // 6. Generic TV Fallback
  else if (catLower.includes("tv")) {
    category = "TV Episodes";
  }

  const magnet = row.find('a[href^="magnet:"]').attr("href") || "";

  return {
    title, url, image, size, seeds, leechers, year, quality,
    category, summary: rowText.slice(0, 300), magnet
  };
}

async function fetchHtml(url) {
  console.log("Fetching:", url);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": SOURCE
      }
    });
    if (!response.ok) throw new Error(`Source returned HTTP ${response.status}`);
    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

async function sourceBrowse(page = 1, category = "") {
  const suffix = Number(page) > 1 ? `&page=${Number(page) - 1}` : "";
  let url = `${SOURCE}/torrents.php?sort=id&order=desc${suffix}`;

  if (category === "Movies") url = `${SOURCE}/torrents.php?parent_cat=Movies${suffix}`;
  if (category === "TV Episodes") url = `${SOURCE}/torrents.php?parent_cat=TV&category=41${suffix}`; // Example ID for Episodes
  if (category === "TV Packs") url = `${SOURCE}/torrents.php?parent_cat=TV&category=43${suffix}`; // Example ID for Packs
  if (category === "CAMs") url = `${SOURCE}/torrents.php?category=1${suffix}`; // Example ID for CAMs
  if (category === "Split Scenes") url = `${SOURCE}/torrents.php?category=48${suffix}`; // Example ID for Split Scenes

  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const results = [];

  $(".tgxtablerow").each((_, el) => {
    const item = parseRow($(el));
    if (!item || results.some(x => x.url === item.url)) return;
    results.push(item);
  });

  return { source: SOURCE, page: Number(page) || 1, category, results };
}

async function sourceSearch(query, page = 1, category = "") {
  const q = encodeURIComponent(query.trim());
  let catId = "";

  if (category === "Movies") catId = "parent_cat=Movies";
  else if (category === "TV Episodes") catId = "category=41";
  else if (category === "TV Packs") catId = "category=43";
  else if (category === "CAMs") catId = "category=1";
  else if (category === "Split Scenes") catId = "category=48";

  const suffix = Number(page) > 1 ? `&page=${Number(page) - 1}` : "";
  const url = `${SOURCE}/torrents.php?search=${q}${catId ? '&' + catId : ''}${suffix}&sort=id&order=desc`;

  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const results = [];

  // Try standard row first
  $(".tgxtablerow").each((_, el) => {
    const item = parseRow($(el));
    if (item && !results.some(x => x.url === item.url)) results.push(item);
  });

  // If no results, try fallback for different layouts
  if (!results.length) {
    $(".tgxtable tr, .table-striped tr").each((_, el) => {
      const item = parseRow($(el));
      if (item && !results.some(x => x.url === item.url)) results.push(item);
    });
  }

  return { source: SOURCE, query, page: Number(page) || 1, category, results };
}

app.get("/api/health", (_, res) => {
  res.json({ ok: true, service: "Atlas Personal UI", source: SOURCE });
});

app.get("/api/search", async (req, res) => {
  const q = clean(req.query.q);
  const page = Number(req.query.page) || 1;
  const category = clean(req.query.category);
  if (!q) return res.status(400).json({ error: "Missing q parameter." });

  try {
    res.json(await sourceSearch(q, page, category));
  } catch (error) {
    res.status(502).json({
      error: "Unable to read the source site right now.",
      details: error.message
    });
  }
});

app.get("/api/latest", async (req, res) => {
  const page = Number(req.query.page) || 1;
  const category = clean(req.query.category);
  try {
    res.json(await sourceBrowse(page, category));
  } catch (error) {
    res.status(502).json({
      error: "Unable to read the source site right now.",
      details: error.message
    });
  }
});

app.get("/api/details", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "Missing url parameter." });

  let target;
  try { target = new URL(url); } catch {
    return res.status(400).json({ error: "Invalid URL." });
  }
  if (target.origin !== SOURCE) {
    return res.status(400).json({ error: "Only the configured source domain is allowed." });
  }

  try {
    const html = await fetchHtml(target.href);
    const $ = cheerio.load(html);

    const title = clean($("h1").first().text()) || clean($("title").text());
    const poster = absUrl(
      $('img[alt="Cover"]').attr("src") ||
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content") || ""
    );
    const magnet = $('a[href^="magnet:"]').first().attr("href") || "";
    const torrent = $('a[href$=".torrent"]').first().attr("href") || "";

    // Extract structured data from the info table
    const info = {};
    $("table.table-striped tr").each((_, tr) => {
      const key = clean($(tr).find("th, td").first().text()).replace(":", "");
      const val = $(tr).find("td").last();
      if (key && val.length) {
        if (key === "Checked by") {
          info.verified = val.text().includes("verified") || val.find(".glyphicon-ok").length > 0;
          info.checkedBy = clean(val.text());
        } else if (key === "Stats") {
          info.seeds = clean(val.find(".badge-success, [style*='green']").first().text());
          info.leechers = clean(val.find(".badge-danger, [style*='red']").first().text());
          info.completed = clean(val.find(".badge-info").first().text());
        } else if (key === "Genres") {
          info.genres = val.find(".badge").map((_, b) => clean($(b).text())).get();
        } else {
          info[key] = clean(val.text());
        }
      }
    });

    // Technical info / Description
    let metadata = "";
    const techInfo = $("pre").filter((_, el) => $(el).text().length > 50).first();
    if (techInfo.length) metadata = clean(techInfo.text(), true);

    // File list
    const fileList = [];
    $(".table-responsive table tr").each((i, tr) => {
      if (i === 0) return; // skip header
      const name = clean($(tr).find("td").first().text());
      const size = clean($(tr).find("td").last().text());
      if (name) fileList.push({ name, size });
    });

    res.json({
      source: SOURCE,
      title,
      url: target.href,
      poster,
      magnet,
      torrent: absUrl(torrent),
      info,
      metadata,
      fileList
    });
  } catch (error) {
    res.status(502).json({ error: "Unable to read the detail page right now.", details: error.message });
  }
});

// Fallback for React SPA: Serve index.html for any non-API GET requests
app.use((req, res, next) => {
  if (req.method === "GET" && !req.path.startsWith("/api")) {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  } else {
    next();
  }
});

app.listen(PORT, () => console.log(`Atlas running at http://localhost:${PORT}`));
