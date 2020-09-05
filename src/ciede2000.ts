function floorMod(x: number, y: number): number {
  const mod = x % y;
  return (y > 0 ? mod < 0 : mod > 0) ? mod + y : mod;
}

function wrap(x: number, low: number, high: number): number {
  return floorMod(x - low, high - low) + low;
}

function hpmFn(hp1: number, hp2: number): number {
  let hp = (hp1 + hp2) * 0.5;
  if (Math.abs(hp1 - hp2) > Math.PI) hp -= Math.PI;
  if (hp < 0) hp += 2 * Math.PI;
  return hp;
}

// Reference: http://www2.ece.rochester.edu/~gsharma/ciede2000/ciede2000noteCRNA.pdf
function ciede2000(L1: number, a1: number, b1: number, L2: number, a2: number, b2: number): number {
  // (2)
  const Cab1 = Math.hypot(a1, b1);
  const Cab2 = Math.hypot(a2, b2);
  // (3)
  const Cabm = (Cab1 + Cab2) * 0.5;
  // (4)
  const G = 0.5 * (1 - Math.sqrt((Cabm ** 7) / (Cabm ** 7 + 6103515625)));
  // (5)
  const ap1 = (1 + G) * a1;
  const ap2 = (1 + G) * a2;
  // (6)
  const Cp1 = Math.hypot(ap1, b1);
  const Cp2 = Math.hypot(ap2, b2);
  // (7)
  const hp1 = Math.atan2(b1, ap1);
  const hp2 = Math.atan2(b2, ap2);
  // (8)
  const dLp = L2 - L1;
  // (9)
  const dCp = Cp2 - Cp1;
  // (10)
  const dhp = Cp1 * Cp2 && wrap(hp2 - hp1, -Math.PI, Math.PI);
  // (11)
  const dHp = 2 * Math.sqrt(Cp1 * Cp2) * Math.sin(dhp / 2);
  // (12)
  const Lpm = (L1 + L2) * 0.5;
  // (13)
  const Cpm = (Cp1 + Cp2) * 0.5;
  // (14)
  const hpm = Cp1 * Cp2 ? hpmFn(hp1, hp2) : hp1 + hp2;
  // (15)
  const T = 1 - 0.17 * Math.cos(hpm - 0.16666666666666666 * Math.PI) + 0.24 * Math.cos(2 * hpm)
    + 0.32 * Math.cos(3 * hpm + 0.03333333333333333 * Math.PI) - 0.20 * Math.cos(4 * hpm - 0.35 * Math.PI);
  // (16)
  const dt = 0.16666666666666666 * Math.PI * Math.exp(-(((hpm - 1.5277777777777777 * Math.PI) / (0.1388888888888889 * Math.PI)) ** 2));
  // (17)
  const RC = 2 * Math.sqrt(Cpm ** 7 / (Cpm ** 7 + 6103515625));
  // (18)
  const Lpm502 = (Lpm - 50) ** 2;
  const SL = 1 + (0.015 * Lpm502) / Math.sqrt(20 + Lpm502);
  // (19)
  const SC = 1 + 0.045 * Cpm;
  // (20)
  const SH = 1 + 0.015 * Cpm * T;
  // (21)
  const RT = -Math.sin(2 * dt) * RC;
  // (22)
  const tL = dLp / SL;
  const tC = dCp / SC;
  const tH = dHp / SH;
  return Math.sqrt(tL ** 2 + tC ** 2 + tH ** 2 + RT * tC * tH);
}

export = ciede2000;
