#!/bin/bash

echo "🔍 Testing Fashion Shop API Endpoints"
echo "===================================="
echo ""

# 1. Health Check
echo "1. ✅ Health Check:"
curl -s http://localhost:3001/health
echo ""
echo "---"

# 2. Get All Products (first 2 only)
echo "2. 📦 Get All Products (first 2):"
curl -s "http://localhost:3001/api/products?limit=2"
echo ""
echo "---"

# 3. Add Product
echo "3. ➕ Add New Product:"
curl -s -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "productCategory": "Footwear",
    "productName": "Test_Sneakers_001",
    "unitsSold": 150,
    "returns": 8,
    "revenue": 7500,
    "customerRating": 4.5,
    "stockLevel": 80,
    "season": "Summer",
    "trendScore": 8.2
  }'
echo ""
echo "---"

# 4. Update Product
echo "4. ✏️ Update Product:"
curl -s -X POST "http://localhost:3001/api/products/update/Test_Sneakers_001" \
  -H "Content-Type: application/json" \
  -d '{"unitsSold": 180, "revenue": 9000}'
echo ""
echo "---"

# 5. Season Totals
echo "5. 📊 Season Totals (Summer):"
curl -s "http://localhost:3001/api/products/season-totals/Summer"
echo ""
echo "---"

# 6. High Sales Filter
echo "6. 🔥 High Sales Filter (Summer > 100):"
curl -s "http://localhost:3001/api/products/high-sales/Summer/100"
echo ""
echo "---"

# 7. Rating Condition
echo "7. ⭐ Rating Condition (Summer > 4.0):"
curl -s "http://localhost:3001/api/products/rating/Summer/greater/4.0"
echo ""
echo "---"

# 8. Delete Product
echo "8. ❌ Delete Product:"
curl -s -X POST "http://localhost:3001/api/products/delete/Test_Sneakers_001"
echo ""
echo "---"

echo "✅ All tests completed!"
