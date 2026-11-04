import { describe, expect, it } from 'vitest'

import { calculateCarbohydrates } from '../../../shared/domain/foods/calculateCarbohydrates'

describe('TB-FOOD-001', () => {
  it('returns 15 g of carbohydrates for 150 g of a synthetic food with 10 g per 100 g', () => {
    expect(calculateCarbohydrates(150, 10)).toBe(15)
  })
})
