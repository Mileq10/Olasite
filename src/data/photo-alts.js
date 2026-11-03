/** Opisy zdjęć do atrybutu alt. Klucz: `folder/plik.jpg`. */
const alts = {};

const folderTitle = {
  biznesowa: 'Sesja biznesowa',
  portretowa: 'Sesja portretowa',
  slubne: 'Reportaż ślubny',
  komunie: 'Reportaż komunijny',
  'eventy-sport': 'Relacja z eventu lub wydarzenia sportowego'
};

export function altForPhoto(folder, filename, index, total) {
  const custom = alts[`${folder}/${filename}`];
  if (custom) return custom;
  const title = folderTitle[folder] || 'Zdjęcie z portfolio';
  return `${title}, kadr ${index + 1} z ${total}`;
}
