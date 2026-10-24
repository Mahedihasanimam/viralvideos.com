const BENGALI_MONTHS = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
]

const BENGALI_NUMERALS: Record<string, string> = {
  '0': '০',
  '1': '১',
  '2': '২',
  '3': '৩',
  '4': '৪',
  '5': '৫',
  '6': '৬',
  '7': '৭',
  '8': '৮',
  '9': '৯',
}

export function toBengaliNumerals(str: string | number): string {
  return String(str).replace(/[0-9]/g, digit => BENGALI_NUMERALS[digit] || digit)
}

export function formatBengaliDate(dateInput: string | Date): string {
  try {
    const d = new Date(dateInput)
    if (isNaN(d.getTime())) return ''
    const day = toBengaliNumerals(d.getDate())
    const month = BENGALI_MONTHS[d.getMonth()]
    const year = toBengaliNumerals(d.getFullYear())
    return `${month} ${day}, ${year}`
  } catch {
    return ''
  }
}
