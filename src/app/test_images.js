const playerIds = [407632, 248404, 3276664];
const imageVersions = [58, 12, 10]; // Sample versions

const urls = [
  // 1. Lowercase athletes with v1
  "https://imagecache.365scores.com/image/upload/f_auto,w_120,h_120,c_limit,q_auto:eco,d_athletes:default.png/v1/athletes/407632",
  // 2. Lowercase athletes with version
  "https://imagecache.365scores.com/image/upload/f_auto,w_120,h_120,c_limit,q_auto:eco,d_athletes:default.png/v58/athletes/407632",
  // 3. Uppercase Athletes with version
  "https://imagecache.365scores.com/image/upload/f_auto,w_120,h_120,c_limit,q_auto:eco,d_athletes:default.png/v58/Athletes/407632",
  // 4. Uppercase Athletes with v1
  "https://imagecache.365scores.com/image/upload/f_auto,w_120,h_120,c_limit,q_auto:eco,d_athletes:default.png/v1/Athletes/407632",
];

async function test() {
  for (const url of urls) {
    try {
      const res = await fetch(url, { method: "HEAD" });
      console.log(`URL: ${url}`);
      console.log(`Status: ${res.status}, Type: ${res.headers.get("content-type")}`);
    } catch (err) {
      console.error(`Failed: ${url}`, err.message);
    }
  }
}

test();
