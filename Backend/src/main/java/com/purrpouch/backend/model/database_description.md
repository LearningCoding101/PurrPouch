# 🐱 PurrPouch Backend - Model Layer

This folder contains the JPA entity definitions for the **PurrPouch** backend, a system designed for personalized cat food kit creation, billing, and order management.

---

## 🧱 Database Structure Overview

The system supports the following functionality:

- User authentication and management (via Firebase or email/password)
- Cat profile creation (one or many cats per user)
- Food catalog with SKUs of different types: wet, dry, topping, snack
- Customized food kits for each cat (with meals: breakfast, lunch, dinner)
- Kit pricing based on cat characteristics (weight, age, etc.)
- Order and transaction tracking with VNPay integration

---

## 🗃️ Entity Descriptions

### `User`

Represents a registered user in the system.

- Fields: `id`, `username`, `email`, `firebaseUid`, `password`, `role`, `enabled`, `photoUrl`
- Roles: `CUSTOMER`, `STAFF`, `ADMIN`
- Each user can have multiple cat profiles

---

### `CatProfile`

Stores information about a user’s cat.

- Fields: `id`, `name`, `weight`, `characteristics`, `birthDate`, `createdAt`
- Linked to one `User`
- One cat can have multiple food kits

---

### `FoodSku`

Represents a specific food item available in the system.

- Fields: `id`, `name`, `type`, `brand`, `unit`, `pricePerUnit`, `description`, `availableStock`
- Enum `FoodType`: `WET`, `DRY`, `TOPPING`, `SNACK`

---

### `FoodKit`

A personalized food set for a specific cat.

- Fields: `id`, `name`, `quantity`, `createdAt`
- Linked to a `CatProfile`
- Contains 3 meals: `BREAKFAST`, `LUNCH`, `DINNER` (via `KitMeal`)

---

### `KitMeal`

Represents a meal slot (breakfast, lunch, or dinner) in a food kit.

- Fields: `id`, `mealType`
- Enum `MealType`: `BREAKFAST`, `LUNCH`, `DINNER`
- Linked to one `FoodKit`
- Contains multiple `KitMealItem` entries

---

### `KitMealItem`

An individual food SKU used in a specific meal.

- Fields: `id`, `quantity`
- Linked to a `KitMeal` and a `FoodSku`

---

### `Order`

Represents a customer's order of one or more kits.

- Fields: `id`, `totalPrice`, `status`, `createdAt`
- Enum `OrderStatus`: `PENDING`, `PAID`, `FAILED`, `CANCELLED`
- Linked to one `User`

---

### `OrderKit`

Link table between `Order` and `FoodKit`.

- Fields: `id`, `kitQuantity`
- Used to track which kits were included in an order

---

### `Transaction`

Tracks VNPay transactions made for an order.

- Fields: `id`, `paymentProvider`, `providerTransactionId`, `amount`, `status`, `paidAt`, `createdAt`
- Enum `TransactionStatus`: `INITIATED`, `SUCCESS`, `FAILED`, `REFUNDED`
- Linked to one `Order`

---

## 🔗 Entity Relationships Diagram

```
User ────< CatProfile ────< FoodKit ────< KitMeal ────< KitMealItem >──── FoodSku
         \                                \
          \                                >──── OrderKit >──── Order ────< Transaction
           \______________________________/
```

---

## ✅ Notes

- All entities use Lombok annotations: `@Getter`, `@Setter`, `@NoArgsConstructor`
- `createdAt` fields use `LocalDateTime.now()` as default
- Add `@JsonIgnore` where needed to prevent circular references in JSON responses
- Business logic and calculations (e.g., price per meal or per kit) should be handled in service classes
