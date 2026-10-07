import fs from 'fs';
import path from 'path';
import https from 'https';

async function postJson(url, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const req = https.request(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'platform-identifier': 'ServerUI',
          'platform-identifier-version': '1.0.0',
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(body);
          } else {
            reject(new Error(`Status ${res.statusCode}: ${body}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function getJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            resolve(body);
          }
        } else {
          reject(new Error(`Status ${res.statusCode}: ${body}`));
        }
      });
    }).on('error', reject);
  });
}

async function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

async function run() {
  console.log('Building Cloud Android APK for Bloom Saloon...');

  const options = {
    additionalTrustedOrigins: [],
    appVersion: "1.0.0.0",
    appVersionCode: 1,
    backgroundColor: "#141218",
    display: "standalone",
    enableSiteSettingsShortcut: true,
    enableNotifications: false,
    includeSourceCode: false,
    fallbackType: "customtabs",
    features: {
      locationDelegation: { enabled: true },
      playBilling: { enabled: false },
    },
    host: "https://ais-pre-yfsrjxhcomwsw6m6xumysq-143740191243.asia-southeast1.run.app",
    iconUrl: "https://ais-pre-yfsrjxhcomwsw6m6xumysq-143740191243.asia-southeast1.run.app/pwa-512x512.png",
    maskableIconUrl: "https://ais-pre-yfsrjxhcomwsw6m6xumysq-143740191243.asia-southeast1.run.app/pwa-maskable-512x512.png",
    launcherName: "Bloom Saloon",
    name: "Bloom Saloon",
    navigationColor: "#141218",
    navigationColorDark: "#141218",
    navigationDividerColor: "#141218",
    navigationDividerColorDark: "#141218",
    orientation: "portrait",
    packageId: "com.bloomsaloon.app",
    pwaUrl: "https://ais-pre-yfsrjxhcomwsw6m6xumysq-143740191243.asia-southeast1.run.app",
    startUrl: "/",
    themeColor: "#141218",
    splashScreenFadeOutDuration: 300,
    webManifestUrl: "https://ais-pre-yfsrjxhcomwsw6m6xumysq-143740191243.asia-southeast1.run.app/manifest.webmanifest",
    signingMode: "new",
    signing: {
      file: null,
      alias: "bloomsaloon-key",
      fullName: "Bloom Saloon",
      organization: "Bloom Saloon",
      organizationalUnit: "Mobile App",
      countryCode: "IN",
      keyPassword: "BloomSaloon2026!Key",
      storePassword: "BloomSaloon2026!Store",
    },
    shortcuts: [],
  };

  try {
    const enqueueRes = await postJson(
      'https://pwabuilder-cloudapk.azurewebsites.net/enqueuePackageJob',
      options
    );
    const jobId = enqueueRes.trim().replace(/^"|"$/g, '');
    console.log('Enqueued job ID:', jobId);

    // Poll for completion
    let attempts = 0;
    while (attempts < 60) {
      await new Promise((r) => setTimeout(r, 3000));
      attempts++;
      const job = await getJson(
        `https://pwabuilder-cloudapk.azurewebsites.net/getPackageJob?id=${encodeURIComponent(jobId)}`
      );

      console.log(`Poll attempt ${attempts}: status = ${job.status}`);
      if (job.status === 'Completed') {
        console.log('Job completed! Downloading package ZIP...');
        const zipPath = path.resolve('cloud-package.zip');
        await downloadFile(
          `https://pwabuilder-cloudapk.azurewebsites.net/downloadPackageZip?id=${encodeURIComponent(jobId)}`,
          zipPath
        );
        console.log('Downloaded package to:', zipPath);
        return;
      } else if (job.status === 'Failed') {
        console.error('Job failed:', job.logs);
        process.exit(1);
      }
    }
    console.error('Timed out waiting for job completion');
  } catch (err) {
    console.error('Error during cloud packaging:', err);
  }
}

run();
