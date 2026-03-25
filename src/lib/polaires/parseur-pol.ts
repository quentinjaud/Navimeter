import type { DonneesPolaire } from './types';

export function parsePOL(texte: string): DonneesPolaire {
  const lignes = texte.trim().replace(/\r\n/g, '\n').split('\n').filter(l => l.trim());
  if (lignes.length < 2) throw new Error('Fichier vide ou trop court');

  const cellsHeader = lignes[0].split('\t');
  if (!cellsHeader[0].includes('TWA') || !cellsHeader[0].includes('TWS')) {
    throw new Error('Header invalide (attendu: TWA\\TWS)');
  }

  const tws = cellsHeader.slice(1).map((v, i) => {
    const n = parseFloat(v.trim());
    if (isNaN(n)) throw new Error(`TWS invalide colonne ${i + 2}: "${v}"`);
    return n;
  });

  const twa: number[] = [];
  const speeds: number[][] = [];

  for (let i = 1; i < lignes.length; i++) {
    const cells = lignes[i].split('\t');
    const angle = parseFloat(cells[0].trim());
    if (isNaN(angle)) throw new Error(`TWA invalide ligne ${i + 1}: "${cells[0]}"`);

    const row = cells.slice(1).map((v, j) => {
      const n = parseFloat(v.trim());
      if (isNaN(n)) throw new Error(`Vitesse invalide ligne ${i + 1}, col ${j + 2}: "${v}"`);
      return n;
    });

    while (row.length < tws.length) row.push(0);
    if (row.length > tws.length) row.length = tws.length;

    twa.push(angle);
    speeds.push(row);
  }

  return { tws, twa, speeds };
}

export function exportPOL(donnees: DonneesPolaire): string {
  const { tws, twa, speeds } = donnees;
  let contenu = 'TWA\\TWS';
  tws.forEach(v => { contenu += '\t' + v; });
  contenu += '\n';

  twa.forEach((angle, ri) => {
    contenu += angle.toString();
    speeds[ri].forEach(spd => { contenu += '\t' + spd.toFixed(1); });
    contenu += '\n';
  });

  return contenu;
}

export function validerNavimetrix(donnees: DonneesPolaire): string[] {
  const w: string[] = [];
  if (donnees.tws.length === 0 || donnees.tws[0] !== 0) {
    w.push('Il est recommande que la premiere valeur de TWS soit 0.');
  }
  if (donnees.tws.length === 0 || donnees.tws[donnees.tws.length - 1] < 40) {
    w.push('Il est recommande que la derniere valeur de TWS soit >= 40.');
  }
  if (donnees.twa.length === 0 || donnees.twa[0] !== 0) {
    w.push('Il est recommande que la premiere valeur de TWA soit 0.');
  }
  return w;
}

export function trierDonnees(donnees: DonneesPolaire): DonneesPolaire {
  const combined = donnees.twa.map((angle, i) => ({ angle, row: donnees.speeds[i] }));
  combined.sort((a, b) => a.angle - b.angle);
  const twa = combined.map(c => c.angle);
  let speeds = combined.map(c => c.row);

  const twsOrder = donnees.tws.map((v, i) => ({ v, i }));
  twsOrder.sort((a, b) => a.v - b.v);
  const tws = twsOrder.map(o => o.v);
  speeds = speeds.map(row => twsOrder.map(o => row[o.i]));

  return { tws, twa, speeds };
}
