import { createError, getRouterParam } from 'h3'
import { getMealRepository } from '../../utils/foodMealRepositories'
export default defineEventHandler(async event => { const meal = await (await getMealRepository()).find(getRouterParam(event, 'id') || ''); if (!meal) throw createError({ statusCode: 404 }); return meal })
