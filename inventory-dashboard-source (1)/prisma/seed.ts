import { PrismaClient, MovementType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.stockMovement.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.reorder.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.supplier.deleteMany();

  // Categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: "Electronics" } }),
    prisma.category.create({ data: { name: "Office Supplies" } }),
    prisma.category.create({ data: { name: "Furniture" } }),
    prisma.category.create({ data: { name: "Food & Beverage" } }),
    prisma.category.create({ data: { name: "Tools & Hardware" } }),
  ]);

  const [electronics, office, furniture, food, tools] = categories;

  // Suppliers
  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        name: "TechSource Distributors",
        email: "orders@techsource.com",
        phone: "+1-555-0101",
        address: "1200 Industrial Pkwy, Austin TX",
        leadTimeDays: 5,
        rating: 4.5,
      },
    }),
    prisma.supplier.create({
      data: {
        name: "Office World Inc",
        email: "sales@officeworld.com",
        phone: "+1-555-0102",
        address: "500 Commerce Blvd, Chicago IL",
        leadTimeDays: 3,
        rating: 4.2,
      },
    }),
    prisma.supplier.create({
      data: {
        name: "Global Furnishings Co",
        email: "contact@globalfurnish.com",
        phone: "+1-555-0103",
        address: "78 Manufacturing Rd, Columbus OH",
        leadTimeDays: 10,
        rating: 3.8,
      },
    }),
    prisma.supplier.create({
      data: {
        name: "FreshFoods Supply",
        email: "orders@freshfoods.com",
        phone: "+1-555-0104",
        address: "300 Logistics Way, Fresno CA",
        leadTimeDays: 2,
        rating: 4.7,
      },
    }),
    prisma.supplier.create({
      data: {
        name: "BuildRight Hardware",
        email: "info@buildright.com",
        phone: "+1-555-0105",
        address: "90 Tool Street, Phoenix AZ",
        leadTimeDays: 7,
        rating: 4.0,
      },
    }),
  ]);

  const [techSource, officeWorld, globalFurn, freshFoods, buildRight] = suppliers;

  // Products — mix of healthy stock, low stock, and out-of-stock
  const productDefs = [
    // Electronics
    { sku: "ELEC-001", name: "Wireless Mouse", cat: electronics, sup: techSource, unitCost: 8.5, price: 24.99, stockQty: 145, reorderPoint: 30, reorderQty: 100, unit: "pcs" },
    { sku: "ELEC-002", name: "USB-C Cable 1m", cat: electronics, sup: techSource, unitCost: 2.0, price: 9.99, stockQty: 320, reorderPoint: 50, reorderQty: 200, unit: "pcs" },
    { sku: "ELEC-003", name: "Bluetooth Headphones", cat: electronics, sup: techSource, unitCost: 22.0, price: 59.99, stockQty: 12, reorderPoint: 15, reorderQty: 50, unit: "pcs" },
    { sku: "ELEC-004", name: "HDMI Cable 2m", cat: electronics, sup: techSource, unitCost: 3.5, price: 14.99, stockQty: 0, reorderPoint: 20, reorderQty: 100, unit: "pcs" },
    { sku: "ELEC-005", name: "USB Hub 4-Port", cat: electronics, sup: techSource, unitCost: 6.0, price: 19.99, stockQty: 88, reorderPoint: 25, reorderQty: 80, unit: "pcs" },

    // Office Supplies
    { sku: "OFF-001", name: "A4 Paper Ream", cat: office, sup: officeWorld, unitCost: 3.0, price: 7.99, stockQty: 250, reorderPoint: 50, reorderQty: 200, unit: "ream" },
    { sku: "OFF-002", name: "Ballpoint Pen Blue", cat: office, sup: officeWorld, unitCost: 0.15, price: 0.99, stockQty: 8, reorderPoint: 100, reorderQty: 500, unit: "pcs" },
    { sku: "OFF-003", name: "Sticky Notes Pack", cat: office, sup: officeWorld, unitCost: 1.2, price: 4.99, stockQty: 75, reorderPoint: 30, reorderQty: 100, unit: "pack" },
    { sku: "OFF-004", name: "Stapler Heavy Duty", cat: office, sup: officeWorld, unitCost: 4.5, price: 12.99, stockQty: 18, reorderPoint: 10, reorderQty: 40, unit: "pcs" },
    { sku: "OFF-005", name: "Printer Ink Cartridge", cat: office, sup: officeWorld, unitCost: 12.0, price: 34.99, stockQty: 5, reorderPoint: 8, reorderQty: 30, unit: "pcs" },

    // Furniture
    { sku: "FURN-001", name: "Office Chair Ergonomic", cat: furniture, sup: globalFurn, unitCost: 65.0, price: 149.99, stockQty: 22, reorderPoint: 5, reorderQty: 20, unit: "pcs" },
    { sku: "FURN-002", name: "Standing Desk Converter", cat: furniture, sup: globalFurn, unitCost: 90.0, price: 219.99, stockQty: 7, reorderPoint: 8, reorderQty: 15, unit: "pcs" },
    { sku: "FURN-003", name: "Filing Cabinet 3-Drawer", cat: furniture, sup: globalFurn, unitCost: 45.0, price: 99.99, stockQty: 30, reorderPoint: 5, reorderQty: 15, unit: "pcs" },
    { sku: "FURN-004", name: "Bookshelf 5-Tier", cat: furniture, sup: globalFurn, unitCost: 35.0, price: 79.99, stockQty: 0, reorderPoint: 3, reorderQty: 10, unit: "pcs" },

    // Food & Beverage
    { sku: "FB-001", name: "Premium Coffee Beans 1kg", cat: food, sup: freshFoods, unitCost: 8.0, price: 19.99, stockQty: 60, reorderPoint: 20, reorderQty: 80, unit: "kg" },
    { sku: "FB-002", name: "Green Tea Bags 100ct", cat: food, sup: freshFoods, unitCost: 2.5, price: 8.99, stockQty: 40, reorderPoint: 15, reorderQty: 50, unit: "box" },
    { sku: "FB-003", name: "Bottled Water 24-Pack", cat: food, sup: freshFoods, unitCost: 3.5, price: 6.99, stockQty: 14, reorderPoint: 10, reorderQty: 40, unit: "case" },
    { sku: "FB-004", name: "Assorted Snack Box", cat: food, sup: freshFoods, unitCost: 5.0, price: 12.99, stockQty: 3, reorderPoint: 8, reorderQty: 25, unit: "box" },

    // Tools & Hardware
    { sku: "TOOL-001", name: "Cordless Drill 18V", cat: tools, sup: buildRight, unitCost: 35.0, price: 89.99, stockQty: 15, reorderPoint: 5, reorderQty: 20, unit: "pcs" },
    { sku: "TOOL-002", name: "Screwdriver Set 12pc", cat: tools, sup: buildRight, unitCost: 4.0, price: 14.99, stockQty: 42, reorderPoint: 15, reorderQty: 50, unit: "set" },
    { sku: "TOOL-003", name: "Measuring Tape 5m", cat: tools, sup: buildRight, unitCost: 1.5, price: 5.99, stockQty: 7, reorderPoint: 20, reorderQty: 60, unit: "pcs" },
    { sku: "TOOL-004", name: "Safety Goggles", cat: tools, sup: buildRight, unitCost: 2.0, price: 7.99, stockQty: 55, reorderPoint: 20, reorderQty: 80, unit: "pcs" },
  ];

  const products = [];
  for (const p of productDefs) {
    const product = await prisma.product.create({
      data: {
        sku: p.sku,
        name: p.name,
        description: `${p.name} — quality product sourced from ${p.sup.name}`,
        categoryId: p.cat.id,
        supplierId: p.sup.id,
        unit: p.unit,
        unitCost: p.unitCost,
        price: p.price,
        stockQty: p.stockQty,
        reorderPoint: p.reorderPoint,
        reorderQty: p.reorderQty,
      },
    });
    products.push(product);
  }

  // Generate stock movements over the past 90 days to simulate consumption
  const now = new Date();
  for (const product of products) {
    // Initial stock-in movement
    await prisma.stockMovement.create({
      data: {
        productId: product.id,
        type: MovementType.IN,
        qty: product.stockQty + Math.floor(Math.random() * 100) + 50,
        reason: "Initial stock receipt",
        createdAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      },
    });

    // Generate random OUT movements over 90 days
    const numMovements = Math.floor(Math.random() * 15) + 5;
    let totalOut = 0;
    for (let i = 0; i < numMovements; i++) {
      const daysAgo = Math.floor(Math.random() * 85) + 2;
      const qty = Math.floor(Math.random() * 20) + 1;
      totalOut += qty;
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          type: MovementType.OUT,
          qty,
          reason: ["Sale", "Internal use", "Damaged", "Transfer", "Sample"][Math.floor(Math.random() * 5)],
          createdAt: new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  // Generate alerts based on current stock
  for (const product of products) {
    let severity: "CRITICAL" | "LOW" | "WATCH" | null = null;
    let message = "";

    if (product.stockQty <= 0) {
      severity = "CRITICAL";
      message = `${product.name} is out of stock`;
    } else if (product.stockQty <= product.reorderPoint) {
      severity = "LOW";
      message = `${product.name} is at or below reorder point (${product.stockQty}/${product.reorderPoint})`;
    } else if (product.stockQty <= Math.ceil(product.reorderPoint * 1.5)) {
      severity = "WATCH";
      message = `${product.name} stock is approaching reorder point (${product.stockQty}/${product.reorderPoint})`;
    }

    if (severity) {
      await prisma.alert.create({
        data: {
          productId: product.id,
          severity,
          message,
        },
      });
    }
  }

  // Create a few reorders
  const productWithLowStock = products.find(p => p.sku === "OFF-002")!;
  const productWithCritical = products.find(p => p.sku === "ELEC-004")!;
  await prisma.reorder.create({
    data: {
      productId: productWithLowStock.id,
      supplierId: productWithLowStock.supplierId,
      qty: 500,
      status: "PENDING",
      unitCost: productWithLowStock.unitCost,
      totalCost: Number(productWithLowStock.unitCost) * 500,
      notes: "Urgent restock — pens running low",
    },
  });
  await prisma.reorder.create({
    data: {
      productId: productWithCritical.id,
      supplierId: productWithCritical.supplierId,
      qty: 100,
      status: "SENT",
      unitCost: productWithCritical.unitCost,
      totalCost: Number(productWithCritical.unitCost) * 100,
      notes: "Out of stock — expedited order",
    },
  });

  console.log("Seed completed successfully!");
  console.log(`Created ${categories.length} categories, ${suppliers.length} suppliers, ${products.length} products`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
