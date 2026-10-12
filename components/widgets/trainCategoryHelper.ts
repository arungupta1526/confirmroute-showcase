/**
 * trainCategoryHelper.ts
 *
 * Dedicated helper to resolve official Indian Railways train categories
 * adhering to the Indian Railways 5-Digit Numbering Standard and premium rake brands.
 */

/**
 * Resolves the official train category using the Indian Railways 5-Digit Numbering System
 * and specific premium train brand rake identifiers.
 *
 * Official Indian Railways 5-Digit Numbering Standard:
 * - 1st Digit:
 *   - '0': Special Trains (Festival, Holiday, Summer, Exam Specials)
 *   - '1' or '2': Long-Distance Mail / Express / Superfast
 *   - '5': Conventional Passenger Trains
 *   - '6': MEMU (Mainline Electric Multiple Unit)
 *   - '7': DEMU (Diesel Electric Multiple Unit) & Railbus
 *   - '8': Suvidha Express
 *   - '3' or '4': Suburban Trains
 * - 2nd Digit (for 1xxxx and 2xxxx series):
 *   - '2': Designates Superfast Trains (12xxx and 22xxx)
 *   - '0', '1', '3'-'9': Designates Railway Operating Zones for regular Mail / Express
 */
export function resolveTrainCategory(
  trainNumber: string,
  trainName: string,
  rawType?: string | null
): string | null {
  const num = String(trainNumber || "").trim();
  const name = String(trainName || "").toUpperCase();
  const type = String(rawType || "").trim().toUpperCase();

  // 1. Premium & Modern Train Brands (Brand identity takes priority)
  // Check hybrid Tejas Rajdhani before pure Rajdhani or Tejas
  if (
    name.includes("TEJAS RAJ") ||
    (name.includes("TEJAS") && (name.includes("RAJ") || type === "R"))
  ) {
    return "Tejas Rajdhani";
  }

  if (name.includes("VANDE BHARAT") || type === "V") return "Vande Bharat";
  if (name.includes("RAJDHANI") || type === "R") return "Rajdhani";
  if (name.includes("SHATABDI") && !name.includes("JAN")) return "Shatabdi";
  if (name.includes("JAN SHATABDI") || type === "J") return "Jan Shatabdi";
  if (name.includes("DURONTO") || type === "D") return "Duronto";
  if (name.includes("GARIB RATH") || type === "G") return "Garib Rath";
  if (name.includes("TEJAS") || type === "T") return "Tejas";
  if (name.includes("HUMSAFAR") || type === "H") return "Humsafar";
  if (name.includes("AMRIT BHARAT")) return "Amrit Bharat";
  if (name.includes("ANTYODAYA")) return "Antyodaya";

  // 2. Official Indian Railways 5-Digit Numbering System
  if (num.length >= 5) {
    const firstDigit = num[0];
    const secondDigit = num[1];

    // '0': Special Trains (Summer, Holiday, Festival Specials like 09822, 04210)
    if (firstDigit === "0") {
      return "Special";
    }

    // '1' or '2': Long-Distance Mail / Express / Superfast
    if (firstDigit === "1" || firstDigit === "2") {
      // 2nd Digit = '2' indicates Superfast (12xxx and 22xxx series)
      if (secondDigit === "2") {
        return "Superfast";
      }
      // Other 1xxxx and 2xxxx trains are standard Mail or Express
      return "Mail / Express";
    }

    // '5': Passenger Trains
    if (firstDigit === "5") return "Passenger";

    // '6': MEMU
    if (firstDigit === "6") return "MEMU";

    // '7': DEMU
    if (firstDigit === "7") return "DEMU";

    // '8': Suvidha Express
    if (firstDigit === "8") return "Suvidha";

    // '3' or '4': Suburban
    if (firstDigit === "3" || firstDigit === "4") return "Suburban";
  }

  // 3. Heuristics fallback for unpadded 4-digit or named trains
  if (num.startsWith("0") || name.includes("SPL") || name.includes("SPECIAL") || type === "SPL") {
    return "Special";
  }
  if (
    num.startsWith("12") ||
    num.startsWith("22") ||
    name.includes(" SF") ||
    name.includes("SUPERFAST") ||
    type === "S" ||
    type === "SUF"
  ) {
    return "Superfast";
  }
  if (
    name.includes("MAIL") ||
    name.includes("EXP") ||
    name.includes("EXPRESS") ||
    type === "O" ||
    type === "EXP"
  ) {
    return "Mail / Express";
  }
  if (name.includes("PASSENGER") || type === "PASS") return "Passenger";
  if (name.includes("MEMU") || type === "MEMU") return "MEMU";
  if (name.includes("DEMU") || type === "DEMU") return "DEMU";

  return null;
}
