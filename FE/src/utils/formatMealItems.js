// Helper function to format meal items for display in chat
const formatMealItems = (meal) => {
  if (!meal || !meal.foodItems || !meal.foodItems.length) {
    return "No items";
  }

  return meal.foodItems
    .map(
      (item) => `- ${item.name} (${item.brand}): ${item.quantity} ${item.unit}`
    )
    .join("\n");
};

// Export the function
export { formatMealItems };

// Add this function to your MealPlans component just before the handleAddToCart function
