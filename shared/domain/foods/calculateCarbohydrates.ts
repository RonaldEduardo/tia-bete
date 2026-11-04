// shortcut: TB-FOOD-001 covers valid inputs only; add input validation with H11.
export const calculateCarbohydrates = (grams: number, carbsPer100g: number) => (grams * carbsPer100g) / 100
