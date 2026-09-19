import { SizeRuleConfig } from '../types';

export interface ParsedSizeQuery {
  height: number | null;
  weight: number | null;
  rawQuery: string;
  explicitSize?: string;
}

/**
 * Parses user input for height, weight, or specific size mentions.
 * Supports multiple formats:
 * - "170 sm 77 kg", "170sm, 77kg", "170 77"
 * - "bo'yim 170 vaznim 77"
 * - "170/77", "170-77"
 * - "2xl razmer", "xl qanday"
 */
export function parseHeightAndWeight(text: string): ParsedSizeQuery {
  const clean = text.toLowerCase();
  let height: number | null = null;
  let weight: number | null = null;
  let explicitSize: string | undefined = undefined;

  // Check explicit size mentions
  const sizeMatch = clean.match(/\b(xs|s|m|l|xl|2xl|xxl|3xl|xxxl|4xl)\b/i);
  if (sizeMatch) {
    explicitSize = sizeMatch[1].toUpperCase();
    if (explicitSize === 'XXL') explicitSize = '2XL';
    if (explicitSize === 'XXXL') explicitSize = '3XL';
  }

  // 1. Explicit labels: "bo'y 170", "170 sm", "170 cm"
  const hMatch = clean.match(/(?:bo['`’]?y(?:im)?\s*[:=]?\s*|(\d{2,3})\s*(?:sm|cm|metr|m\b))(\d{2,3})?/i);
  if (hMatch) {
    const val = parseInt(hMatch[1] || hMatch[2]);
    if (val >= 130 && val <= 230) {
      height = val;
    }
  }

  // 2. Explicit labels for weight: "vazn 77", "77 kg", "77 kilo"
  const wMatch = clean.match(/(?:vazn(?:im)?\s*[:=]?\s*|(\d{2,3})\s*(?:kg|kilo|kilogram\b))(\d{2,3})?/i);
  if (wMatch) {
    const val = parseInt(wMatch[1] || wMatch[2]);
    if (val >= 35 && val <= 200) {
      weight = val;
    }
  }

  // 3. Fallback: pair of numbers e.g. "170 77" or "170/77" or "170, 77"
  if (!height || !weight) {
    const nums = clean.match(/\b\d{2,3}\b/g);
    if (nums && nums.length >= 2) {
      const n1 = parseInt(nums[0]);
      const n2 = parseInt(nums[1]);

      if (n1 >= 140 && n1 <= 220 && n2 >= 40 && n2 <= 160) {
        if (!height) height = n1;
        if (!weight) weight = n2;
      } else if (n2 >= 140 && n2 <= 220 && n1 >= 40 && n1 <= 160) {
        if (!height) height = n2;
        if (!weight) weight = n1;
      }
    }
  }

  return { height, weight, rawQuery: text, explicitSize };
}

/**
 * Finds the best matching size rule from the admin-configured rules list.
 */
export function findBestSizeRule(
  height: number,
  weight: number,
  rules: SizeRuleConfig[]
): SizeRuleConfig | null {
  if (!rules || rules.length === 0) return null;

  // 1. Exact range fit
  const exactMatches = rules.filter((r) => {
    const inH = height >= r.minHeight && height <= r.maxHeight;
    const inW = weight >= r.minWeight && weight <= r.maxWeight;
    return inH && inW;
  });

  if (exactMatches.length > 0) {
    // If multiple exact matches, pick the one where midpoints are closest
    exactMatches.sort((a, b) => {
      const midHa = (a.minHeight + a.maxHeight) / 2;
      const midWa = (a.minWeight + a.maxWeight) / 2;
      const distA = Math.abs(height - midHa) + Math.abs(weight - midWa) * 1.5;

      const midHb = (b.minHeight + b.maxHeight) / 2;
      const midWb = (b.minWeight + b.maxWeight) / 2;
      const distB = Math.abs(height - midHb) + Math.abs(weight - midWb) * 1.5;

      return distA - distB;
    });
    return exactMatches[0];
  }

  // 2. Tolerance fit (+/- 3 cm / kg)
  const tolerantMatches = rules.filter((r) => {
    const inH = height >= r.minHeight - 3 && height <= r.maxHeight + 3;
    const inW = weight >= r.minWeight - 3 && weight <= r.maxWeight + 3;
    return inH && inW;
  });

  if (tolerantMatches.length > 0) {
    return tolerantMatches[0];
  }

  // 3. Weight-centric closest rule
  const sortedByDistance = [...rules].sort((a, b) => {
    const midHa = (a.minHeight + a.maxHeight) / 2;
    const midWa = (a.minWeight + a.maxWeight) / 2;
    const distA = Math.abs(height - midHa) * 0.8 + Math.abs(weight - midWa) * 2;

    const midHb = (b.minHeight + b.maxHeight) / 2;
    const midWb = (b.minWeight + b.maxWeight) / 2;
    const distB = Math.abs(height - midHb) * 0.8 + Math.abs(weight - midWb) * 2;

    return distA - distB;
  });

  return sortedByDistance[0] || null;
}

/**
 * Generates Operator Jacob's structured advice message.
 */
export function generateJacobAdvice(
  height: number,
  weight: number,
  rules: SizeRuleConfig[],
  operatorName: string = 'Jacob'
): string {
  const rule = findBestSizeRule(height, weight, rules);

  if (!rule) {
    return `Assalomu alaykum! Siz kiritgan parametrlar (${height} sm bo'y, ${weight} kg vazn) bo'yicha eng qulay tanlov: 2XL yoki XL razmer. Agar oversize yoqtirsangiz 2XL eng ideal variant bo'ladi!`;
  }

  // Generate tailored message
  return `Assalomu alaykum! Siz kiritgan parametrlar: ${height} sm bo'y va ${weight} kg vazn.

🎯 Tavsiya etilgan razmer: 【 ${rule.size} 】
📏 Razmer me'yori: ${rule.heightRange} | ${rule.weightRange}
💡 Operator ${operatorName} maslahati: ${rule.recommendationNote}

Kiyimlarni bemalol ${rule.size} razmerda savatchaga qo'shishingiz mumkin! Savollaringiz bo'lsa marhamat.`;
}
