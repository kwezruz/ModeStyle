import { SizeGuideItem } from '../types';

export const DEFAULT_APPAREL_SIZE_GUIDES: Record<string, SizeGuideItem> = {
  XS: {
    size: 'XS',
    heightRange: '155 – 165 sm',
    weightRange: '45 – 53 kg',
    minHeight: 155,
    maxHeight: 165,
    minWeight: 45,
    maxWeight: 53,
    note: 'Slim / Kichik',
  },
  S: {
    size: 'S',
    heightRange: '160 – 170 sm',
    weightRange: '52 – 63 kg',
    minHeight: 160,
    maxHeight: 170,
    minWeight: 52,
    maxWeight: 63,
    note: 'Standart / Slim',
  },
  M: {
    size: 'M',
    heightRange: '168 – 177 sm',
    weightRange: '63 – 74 kg',
    minHeight: 168,
    maxHeight: 177,
    minWeight: 63,
    maxWeight: 74,
    note: 'Ommabop / Normal',
  },
  L: {
    size: 'L',
    heightRange: '175 – 184 sm',
    weightRange: '74 – 85 kg',
    minHeight: 175,
    maxHeight: 184,
    minWeight: 74,
    maxWeight: 85,
    note: 'Kengroq / Qulay',
  },
  XL: {
    size: 'XL',
    heightRange: '182 – 190 sm',
    weightRange: '85 – 96 kg',
    minHeight: 182,
    maxHeight: 190,
    minWeight: 85,
    maxWeight: 96,
    note: 'Oversize / Katta',
  },
  XXL: {
    size: 'XXL',
    heightRange: '188 – 198 sm',
    weightRange: '95 – 115 kg',
    minHeight: 188,
    maxHeight: 198,
    minWeight: 95,
    maxWeight: 115,
    note: 'Katta razmer',
  },
};

export const DEFAULT_SNEAKER_SIZE_GUIDES: Record<string, SizeGuideItem> = {
  '39': {
    size: '39',
    footLength: '24.5 sm',
    heightRange: '160 – 168 sm',
    weightRange: '50 – 62 kg',
    minHeight: 160,
    maxHeight: 168,
    minWeight: 50,
    maxWeight: 62,
    note: 'Oyoq 24.5 sm',
  },
  '40': {
    size: '40',
    footLength: '25.0 sm',
    heightRange: '165 – 172 sm',
    weightRange: '58 – 68 kg',
    minHeight: 165,
    maxHeight: 172,
    minWeight: 58,
    maxWeight: 68,
    note: 'Oyoq 25 sm',
  },
  '41': {
    size: '41',
    footLength: '26.0 sm',
    heightRange: '170 – 176 sm',
    weightRange: '65 – 76 kg',
    minHeight: 170,
    maxHeight: 176,
    minWeight: 65,
    maxWeight: 76,
    note: 'Oyoq 26 sm',
  },
  '42': {
    size: '42',
    footLength: '26.5 sm',
    heightRange: '174 – 181 sm',
    weightRange: '70 – 84 kg',
    minHeight: 174,
    maxHeight: 181,
    minWeight: 70,
    maxWeight: 84,
    note: 'Oyoq 26.5 sm',
  },
  '43': {
    size: '43',
    footLength: '27.5 sm',
    heightRange: '178 – 186 sm',
    weightRange: '78 – 92 kg',
    minHeight: 178,
    maxHeight: 186,
    minWeight: 78,
    maxWeight: 92,
    note: 'Oyoq 27.5 sm',
  },
  '44': {
    size: '44',
    footLength: '28.0 sm',
    heightRange: '182 – 192 sm',
    weightRange: '85 – 100 kg',
    minHeight: 182,
    maxHeight: 192,
    minWeight: 85,
    maxWeight: 100,
    note: 'Oyoq 28 sm',
  },
  '45': {
    size: '45',
    footLength: '29.0 sm',
    heightRange: '186 – 198 sm',
    weightRange: '92 – 115 kg',
    minHeight: 186,
    maxHeight: 198,
    minWeight: 92,
    maxWeight: 115,
    note: 'Oyoq 29 sm',
  },
};

export function generateDefaultSizeGuides(category: string, sizes: string[]): SizeGuideItem[] {
  const isSneakers = category === 'sneakers';
  const dict = isSneakers ? DEFAULT_SNEAKER_SIZE_GUIDES : DEFAULT_APPAREL_SIZE_GUIDES;
  return sizes.map((sz) => {
    const cleanSz = sz.trim().toUpperCase();
    if (dict[cleanSz]) {
      return { ...dict[cleanSz], size: sz.trim() };
    }
    return {
      size: sz.trim(),
      heightRange: '165 – 180 sm',
      weightRange: '60 – 80 kg',
      note: 'Standart o\'lcham',
    };
  });
}
