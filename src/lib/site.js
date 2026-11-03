import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { altForPhoto } from '../data/photo-alts.js';

export const SITE_NAME = 'Obiektyw na Szczęście';
export const EMAIL_TO = 'obiektywna.szczescie@gmail.com';
// Numer podany w briefie. Nie zgaduję innego — potwierdź go przed dalszą promocją strony.
export const PHONE = '+48500100200';
export const PHONE_LABEL = '+48 500 100 200';
export const INSTAGRAM_URL = 'https://www.instagram.com/obiektywna.szczescie/';
export const INSTAGRAM_HANDLE = '@obiektywna.szczescie';
export const NAV_LINKS = [
  { href: '/#portfolio', label: 'Portfolio' },
  { href: '/#oferta', label: 'Oferta' },
  { href: '/#o-mnie', label: 'O mnie' },
  { href: '/#kontakt', label: 'Kontakt' }
];
export const DEFAULT_DESCRIPTION =
  'Fotografia portretowa, biznesowa i reportażowa. Sesje, śluby, komunie, eventy i sport — Obiektyw na Szczęście.';
export const DEFAULT_OG_IMAGE = '/og.jpg';
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const OG_IMAGE_ALT = 'Obiektyw na Szczęście — kadry z sesji i reportaży';

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
  }
};

async function photoMeta(filePath) {
  try {
    const meta = await sharp(filePath).metadata();
    const width = meta.width || 1200;
    const height = meta.height || 1500;
    return {
      width,
      height,
      orientation: width > height ? 'landscape' : 'portrait'
    };
  } catch {
    return { width: 1200, height: 1500, orientation: 'portrait' };
  }
}

export async function publicImageMeta(urlPath) {
  const rel = String(urlPath || '').replace(/^\//, '');
  return photoMeta(path.join(process.cwd(), 'public', rel));
}

export async function listPhotos(folder) {
  const dir = path.join(process.cwd(), 'public', 'zdjecia', 'portfolio', folder);
  if (!fs.existsSync(dir)) return [];
  const names = fs
    .readdirSync(dir)
    .filter((name) => /\.(jpe?g|png|webp)$/i.test(name) && !/^okladka\./i.test(name))
    .sort();
  const photos = [];
  for (let index = 0; index < names.length; index++) {
    const name = names[index];
    const meta = await photoMeta(path.join(dir, name));
    photos.push({
      src: `/zdjecia/portfolio/${folder}/${name}`,
      alt: altForPhoto(folder, name, index, names.length),
      width: meta.width,
      height: meta.height,
      orientation: meta.orientation
    });
  }
  return photos;
}
