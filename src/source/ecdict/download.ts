import fs from 'fs';
import tunnel from 'tunnel';
import got from 'got';

import { workspace } from 'coc.nvim';
import { Agent } from 'http';

function getAgent(): Agent | undefined {
  let proxy = workspace.getConfiguration('http').get<string>('proxy', '');
  if (proxy) {
    let auth = proxy.includes('@') ? proxy.split('@', 2)[0] : '';
    let parts = auth.length ? proxy.slice(auth.length + 1).split(':') : proxy.split(':');
    if (parts.length > 1) {
      let agent = tunnel.httpsOverHttp({
        proxy: {
          headers: {},
          host: parts[0],
          port: parseInt(parts[1], 10),
          proxyAuth: auth
        }
      });
      return agent;
    }
  }
}

export async function download(path: string): Promise<void> {
  let statusItem = workspace.createStatusBarItem(0, { progress: true });
  statusItem.text = 'Downloading ecdict data...';
  statusItem.show();

  const agent = getAgent();

  const url = 'https://raw.githubusercontent.com/skywind3000/ECDICT/master/ecdict.csv';

  return new Promise((resolve, reject) => {
    try {
      got
        .stream(url, { agent })
        .on('downloadProgress', progress => {
          let p = (progress.percent * 100).toFixed(0);
          statusItem.text = `${p}% Downloading ecdict data`;
        })
        .pipe(
          fs.createWriteStream(path)
        )
        .on('end', () => {
          statusItem.hide();
          resolve();
        })
        .on('error', e => {
          reject(e);
        });
    } catch (e) {
      reject(e);
    }
  });
}
