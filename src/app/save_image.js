const fs = require("fs");

async function check(name, url) {
  try {
    const res = await fetch(url);
    const buffer = await res.arrayBuffer();
    console.log(`${name}: status: ${res.status}, size: ${buffer.byteLength} bytes`);
    if (buffer.byteLength > 2000) {
      fs.writeFileSync(`src/app/${name}.png`, Buffer.from(buffer));
    }
  } catch (err) {
    console.error(`Error on ${name}:`, err.message);
  }
}

async function run() {
  // Emiliano Martinez (athleteId 6787)
  await check(
    "emi_club",
    "https://imagecache.365scores.com/image/upload/f_png,w_100,h_100,c_limit,q_auto:eco,dpr_3,d_Athletes:default.png,r_max,c_thumb,g_face,z_0.65/v58/Athletes/6787"
  );
  await check(
    "emi_national",
    "https://imagecache.365scores.com/image/upload/f_png,w_100,h_100,c_limit,q_auto:eco,dpr_3,d_Athletes:default.png,r_max,c_thumb,g_face,z_0.65/v58/Athletes/NationalTeam/6787"
  );

  // Ousmane Dembélé (athleteId 39779)
  await check(
    "dembele_club",
    "https://imagecache.365scores.com/image/upload/f_png,w_100,h_100,c_limit,q_auto:eco,dpr_3,d_Athletes:default.png,r_max,c_thumb,g_face,z_0.65/v83/Athletes/39779"
  );
  await check(
    "dembele_national",
    "https://imagecache.365scores.com/image/upload/f_png,w_100,h_100,c_limit,q_auto:eco,dpr_3,d_Athletes:default.png,r_max,c_thumb,g_face,z_0.65/v83/Athletes/NationalTeam/39779"
  );
}

run();
