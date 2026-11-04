CREATE TABLE foods (id TEXT PRIMARY KEY NOT NULL,name TEXT NOT NULL,carbs_per_100g REAL NOT NULL CHECK(carbs_per_100g >= 0),created_at TEXT NOT NULL);
CREATE TABLE meals (id TEXT PRIMARY KEY NOT NULL,occurred_at TEXT NOT NULL,created_at TEXT NOT NULL,time_zone TEXT NOT NULL,total_carbohydrates REAL NOT NULL);
CREATE TABLE meal_items (meal_id TEXT NOT NULL,food_id TEXT NOT NULL,food_name TEXT NOT NULL,grams REAL NOT NULL CHECK(grams > 0),carbs_per_100g REAL NOT NULL CHECK(carbs_per_100g >= 0),carbohydrates REAL NOT NULL,PRIMARY KEY(meal_id,food_id),FOREIGN KEY(meal_id) REFERENCES meals(id));
