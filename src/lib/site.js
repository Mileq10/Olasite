import fs from 'node:fs';
import path from 'node:path';

export const SITE_NAME = 'Obiektyw na Szczęście';
export const EMAIL_TO = 'obiektywna.szczescie@gmail.com';
export const PHONE = '+48500100200';
export const PHONE_LABEL = '+48 500 100 200';
export const INSTAGRAM_URL = 'https://www.instagram.com/obiektywna.szczescie/';
export const INSTAGRAM_HANDLE = '@obiektywna.szczescie';
export const DEFAULT_DESCRIPTION =
  'Fotografia portretowa, biznesowa i reportażowa. Sesje, śluby, komunie, eventy i sport — Obiektyw na Szczęście.';
export const DEFAULT_OG_IMAGE = '/zdjecia/hero/tlo.jpg';

export const galleries = {
  biznesowa: {
    title: 'Sesja biznesowa',
    folder: 'biznesowa',
    description: 'Galeria sesji biznesowych: portrety korporacyjne, wizerunek i zdjęcia do LinkedIn.'
  },
  portretowa: {
    title: 'Sesja portretowa',
    folder: 'portretowa',
    description: 'Galeria sesji portretowych: naturalne portrety, sesje indywidualne i wizerunkowe.'
  },
  wydarzenia: {
    title: 'Reportaże z wydarzeń',
    type: 'hub',
    description: 'Reportaże ślubne, komunijne oraz relacje z eventów i wydarzeń sportowych.',
    children: [
      { key: 'slubne', title: 'Ślubne', image: '/zdjecia/portfolio/slubne/okladka.jpg' },
      { key: 'komunie', title: 'Komunie', image: '/zdjecia/portfolio/komunie/okladka.jpg' },
      { key: 'eventy-sport', title: 'Eventy i Sport', image: '/zdjecia/portfolio/eventy-sport/okladka.jpg' }
    ]
  },
  slubne: {
    title: 'Ślubne',
    parent: 'wydarzenia',
    folder: 'slubne',
    description: 'Reportaż ślubny: ceremonia, przygotowania i przyjęcie — kadry z realizacji.'
  },
  komunie: {
    title: 'Komunie',
    parent: 'wydarzenia',
    folder: 'komunie',
    description: 'Fotografia komunijna: uroczystość, portrety i reportaż z przyjęcia.'
  },
  'eventy-sport': {
    title: 'Eventy i Sport',
    parent: 'wydarzenia',
    folder: 'eventy-sport',
    description: 'Relacje z eventów i wydarzeń sportowych — dynamika, emocje i kulisy.'
  },
  eventy: {
    title: 'Eventy',
    parent: 'wydarzenia',
    folder: 'eventy',
    description: 'Fotografia eventowa: konferencje, imprezy firmowe i wydarzenia plenerowe.'
  },
  sport: {
    title: 'Sport',
    parent: 'wydarzenia',
    folder: 'sport',
    description: 'Fotografia sportowa: mecze, treningi i relacje z zawodów.'
  }
};

function jpegSize(buf) {
  let offset = 2;
  while (offset + 9 < buf.length) {
    if (buf[offset] !== 0xff) break;
    const marker = buf[offset + 1];
    if (marker === 0xd8 || marker === 0xd9) {
      offset += 2;
      continue;
    }
    const length = buf.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xc3) {
      return {
        height: buf.readUInt16BE(offset + 5),
        width: buf.readUInt16BE(offset + 7)
      };
    }
    offset += 2 + length;
  }
  return null;
}

function pngSize(buf) {
  if (buf.length < 24) return null;
  return {
    width: buf.readUInt32BE(16),
    height: buf.readUInt32BE(20)
  };
}

function photoOrientation(filePath) {
  try {
    const buf = fs.readFileSync(filePath);
    const size =
      buf[0] === 0xff && buf[1] === 0xd8
        ? jpegSize(buf)
        : buf[0] === 0x89 && buf[1] === 0x50
          ? pngSize(buf)
          : null;
    if (!size || !size.width || !size.height) return 'portrait';
    return size.width > size.height ? 'landscape' : 'portrait';
  } catch {
    return 'portrait';
  }
}

export function listPhotos(folder) {
  const dir = path.join(process.cwd(), 'public', 'zdjecia', 'portfolio', folder);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => /\.(jpe?g|png|webp)$/i.test(name) && !/^okladka\./i.test(name))
    .sort()
    .map((name) => {
      const filePath = path.join(dir, name);
      return {
        src: `/zdjecia/portfolio/${folder}/${name}`,
        alt: path.parse(name).name,
        orientation: photoOrientation(filePath)
      };
    });
}
