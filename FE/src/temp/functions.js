// Calculate total price function
const calculateTotalPrice = (mealKit, qty = quantity) => {
  if (!mealKit || !foodSkus || foodSkus.length === 0) return;

  let price = 0;
  // Loop through all meals and their food items
  mealKit.meals.forEach((meal) => {
    meal.foodItems.forEach((item) => {
      // Find the matching SKU in our foodSkus array
      const skuInfo = foodSkus.find((sku) => sku.id === item.foodSkuId);
      if (skuInfo && skuInfo.price) {
        price += skuInfo.price * item.quantity;
      }
    });
  });

  // If no price information is found, set a default price
  if (price === 0) {
    price = 150000; // Default price if no SKU prices are available
  }

  // Multiply by quantity
  price = price * qty;

  setTotalPrice(price);
  return price;
};

// Generate meal kit function
const handleGenerateMealKit = async () => {
  try {
    setGeneratingMeal(true);

    // Get chat history for context or use empty array
    const chatHistory = getChatHistory(id) || [];

    // Call the API to generate a meal kit
    const response = await generateAiMealKit(id, chatHistory);

    if (response.data) {
      setGeneratedMealKit(response.data);
      calculateTotalPrice(response.data);
    }
  } catch (err) {
    console.error("Error generating AI meal kit:", err);
    // If there's an error, set a mock meal kit for testing
    const mockMealKit = {
      kitId: 1,
      kitName: `${profile?.name || "Cat"}'s Daily Meal Kit`,
      catProfileId: id,
      meals: [
        {
          mealId: 1,
          mealType: "BREAKFAST",
          foodItems: [
            {
              foodSkuId: 2,
              name: "Royal Canin Chicken in Gravy",
              type: "WET",
              brand: "Royal Canin",
              quantity: 1.0,
              unit: "ml",
            },
            {
              foodSkuId: 11,
              name: "Me-O Salmon Topping #2",
              type: "TOPPING",
              brand: "Me-O",
              quantity: 0.5,
              unit: "gram",
            },
          ],
        },
        {
          mealId: 2,
          mealType: "LUNCH",
          foodItems: [
            {
              foodSkuId: 263,
              name: "Purina ONE Kitten Formula #71",
              type: "DRY",
              brand: "Purina ONE",
              quantity: 1.0,
              unit: "gram",
            },
            {
              foodSkuId: 204,
              name: "ANF Crunchy Treats #50",
              type: "SNACK",
              brand: "ANF",
              quantity: 0.5,
              unit: "gram",
            },
          ],
        },
        {
          mealId: 3,
          mealType: "DINNER",
          foodItems: [
            {
              foodSkuId: 30,
              name: "SmartHeart Chicken in Gravy #7",
              type: "WET",
              brand: "SmartHeart",
              quantity: 1.0,
              unit: "ml",
            },
            {
              foodSkuId: 31,
              name: "SmartHeart Tuna Flakes #7",
              type: "TOPPING",
              brand: "SmartHeart",
              quantity: 0.5,
              unit: "gram",
            },
          ],
        },
      ],
    };

    setGeneratedMealKit(mockMealKit);
    calculateTotalPrice(mockMealKit);
  } finally {
    setGeneratingMeal(false);
  }
};
