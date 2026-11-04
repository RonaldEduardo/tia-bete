import type { Food } from '../../domain/foods/food';import type { Meal } from '../../domain/foods/meal'
export interface FoodRepository{save(food:Food):Promise<void>;list():Promise<Food[]>}
export interface MealRepository{save(meal:Meal):Promise<void>;list():Promise<Meal[]>;find(id:string):Promise<Meal|undefined>}
