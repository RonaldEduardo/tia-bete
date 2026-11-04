import { listMeals } from '../../../shared/application/foods/useCases'
import { getMealRepository } from '../../utils/foodMealRepositories'
export default defineEventHandler(async () => listMeals(await getMealRepository()))
