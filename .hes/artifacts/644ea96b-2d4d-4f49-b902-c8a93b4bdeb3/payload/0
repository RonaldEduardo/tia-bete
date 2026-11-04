import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { afterEach, describe, expect, it } from 'vitest'
import { SqliteMealRepository } from '../../../server/infrastructure/foods/sqliteFoodMealRepositories'

const sql = readFileSync(resolve('server/infrastructure/foods/migrations/005_create_foods_meals.sql'), 'utf8')
const directories: string[] = []

afterEach(() => directories.splice(0).forEach(directory => rmSync(directory, { recursive: true, force: true })))

const meal = (id: string, items: { foodId: string, foodName: string, grams: number, carbsPer100g: number, carbohydrates: number }[]) => ({
  id,
  occurredAt: '2026-11-04T08:00:00.000Z',
  createdAt: '2026-11-04T08:01:00.000Z',
  timeZone: 'UTC',
  totalCarbohydrates: items.reduce((total, item) => total + item.carbohydrates, 0),
  items,
})

describe('SqliteMealRepository', () => {
  it('keeps the persisted nutritional snapshot after the food changes and restart', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'food-'))
    directories.push(directory)
    const path = join(directory, 'food.sqlite')
    const repository = new SqliteMealRepository(path, [{ version: '005', sql }])
    const item = { foodId: 'food-1', foodName: 'Alimento sintético', grams: 150, carbsPer100g: 20, carbohydrates: 30 }

    await repository.save(meal('meal-snapshot', [item]))
    const database = new DatabaseSync(path)
    database.prepare('INSERT INTO foods VALUES(?,?,?,?)').run('food-1', 'Alimento sintético', 20, '2026-11-04T07:00:00.000Z')
    database.prepare('UPDATE foods SET carbs_per_100g=? WHERE id=?').run(40, 'food-1')
    database.close()

    const restarted = new SqliteMealRepository(path, [{ version: '005', sql }])
    await expect(restarted.find('meal-snapshot')).resolves.toEqual(meal('meal-snapshot', [item]))
  })

  it('rolls back the meal when an item insert fails', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'food-'))
    directories.push(directory)
    const repository = new SqliteMealRepository(join(directory, 'food.sqlite'), [{ version: '005', sql }])
    const item = { foodId: 'same', foodName: 'A', grams: 10, carbsPer100g: 10, carbohydrates: 1 }

    await expect(repository.save(meal('meal-1', [item, { ...item, foodName: 'B' }]))).rejects.toThrow()
    await expect(repository.list()).resolves.toEqual([])
  })
})
