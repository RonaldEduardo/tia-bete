import {createFood,type FoodInput}from'../../domain/foods/food';import{createMeal,type MealInput}from'../../domain/foods/meal';import type{FoodRepository,MealRepository}from'./repositories'
const deps={now:()=>new Date().toISOString(),id:()=>crypto.randomUUID()}
export const registerFood=async(input:FoodInput,repo:FoodRepository,d=deps)=>{const r=createFood({...input,id:d.id(),createdAt:d.now()});if('errors'in r)return r;try{await repo.save(r.food);return r}catch{return{error:'persistence-failed' as const}}}
export const recordMeal=async(input:MealInput,foods:FoodRepository,meals:MealRepository,d=deps)=>{const r=createMeal({...input,id:d.id(),createdAt:d.now(),foods:await foods.list()});if('errors'in r)return r;try{await meals.save(r.meal);return r}catch{return{error:'persistence-failed' as const}}}
export const listMeals=async(repo:MealRepository)=>(await repo.list()).sort((a,b)=>b.occurredAt.localeCompare(a.occurredAt))
