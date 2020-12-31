const { PI, atan2, cos, exp, hypot, sin, sqrt } = Math;
const PI_2 = 2 * PI;

// Reference: http://www2.ece.rochester.edu/~gsharma/ciede2000/ciede2000noteCRNA.pdf
function ciede2000(L1: number, a1: number, b1: number, L2: number, a2: number, b2: number): number {
  // (2)
  const Cab1 = hypot(a1, b1);
  const Cab2 = hypot(a2, b2);
  // (3)
  const Cabm = (Cab1 + Cab2) * 0.5;
  // (4)
  const G = 0.5 * (1 - sqrt((Cabm ** 7) / (Cabm ** 7 + 6103515625)));
  // (5)
  const ap1 = (1 + G) * a1;
  const ap2 = (1 + G) * a2;
  // (6)
  const Cp1 = hypot(ap1, b1);
  const Cp2 = hypot(ap2, b2);
  // (7)
  const hp1 = atan2(b1, ap1);
  const hp2 = atan2(b2, ap2);
  // (8)
  const dLp = L2 - L1;
  // (9)
  const dCp = Cp2 - Cp1;
  // (10)
  const dhpt = hp2 - hp1;
  const dhp = Cp1 * Cp2 === 0 ? 0 : dhpt > PI ? dhpt - PI_2 : dhpt < -PI ? dhpt + PI_2 : dhpt;
  // (11)
  const dHp = 2 * sqrt(Cp1 * Cp2) * sin(dhp / 2);
  // (12)
  const Lpm = (L1 + L2) * 0.5;
  // (13)
  const Cpm = (Cp1 + Cp2) * 0.5;
  // (14)
  const hpmt = (hp1 + hp2) * 0.5;
  const hpm = Cp1 * Cp2 === 0 ? hp1 + hp2 : dhpt > PI || dhpt < -PI ? hpmt < PI ? hpmt + PI : hpmt - PI : hpmt;
  // (15)
  const T = 1 - 0.17 * cos(hpm - 0.16666666666666666 * PI) + 0.24 * cos(2 * hpm)
    + 0.32 * cos(3 * hpm + 0.03333333333333333 * PI) - 0.20 * cos(4 * hpm - 0.35 * PI);
  // (16)
  const dt = 0.16666666666666666 * PI * exp(-(((hpm - 1.5277777777777777 * PI) / (0.1388888888888889 * PI)) ** 2));
  // (17)
  const RC = 2 * sqrt(Cpm ** 7 / (Cpm ** 7 + 6103515625));
  // (18)
  const SLt = (Lpm - 50) ** 2;
  const SL = 1 + (0.015 * SLt) / sqrt(20 + SLt);
  // (19)
  const SC = 1 + 0.045 * Cpm;
  // (20)
  const SH = 1 + 0.015 * Cpm * T;
  // (21)
  const RT = -sin(2 * dt) * RC;
  // (22)
  const tL = dLp / SL;
  const tC = dCp / SC;
  const tH = dHp / SH;
  return sqrt(tL ** 2 + tC ** 2 + tH ** 2 + RT * tC * tH);
}

export = ciede2000;
