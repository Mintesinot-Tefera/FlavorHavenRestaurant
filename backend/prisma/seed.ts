import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.food.deleteMany();
  await prisma.category.deleteMany();

  const pizza = await prisma.category.create({ data: { name: "Pizza" } });
  const burger = await prisma.category.create({ data: { name: "Burgers" } });
  const pasta = await prisma.category.create({ data: { name: "Pasta" } });
  const salad = await prisma.category.create({ data: { name: "Salads" } });
  const dessert = await prisma.category.create({ data: { name: "Desserts" } });
  const beverage = await prisma.category.create({
    data: { name: "Beverages" },
  });

  await prisma.food.createMany({
    data: [
      {
        name: "Margherita Pizza",
        description:
          "Classic pizza with San Marzano tomato sauce, fresh mozzarella, basil leaves, and extra virgin olive oil on a thin, crispy crust.",
        price: 12.99,
        imageUrl:
          "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=800",
        categoryId: pizza.id,
      },
      {
        name: "Pepperoni Pizza",
        description:
          "Loaded with spicy pepperoni slices, stretchy mozzarella cheese, and our signature tomato sauce on a hand-tossed dough.",
        price: 14.99,
        imageUrl:
          "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800",
        categoryId: pizza.id,
      },
      {
        name: "BBQ Bacon Burger",
        description:
          "Juicy beef patty topped with crispy bacon, cheddar cheese, onion rings, and smoky BBQ sauce on a brioche bun.",
        price: 13.49,
        imageUrl:
          "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=800",
        categoryId: burger.id,
      },
      {
        name: "Classic Cheeseburger",
        description:
          "Quarter-pound beef patty with American cheese, lettuce, tomato, pickles, and our special sauce.",
        price: 10.99,
        imageUrl:
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
        categoryId: burger.id,
      },
      {
        name: "Spaghetti Bolognese",
        description:
          "Al dente spaghetti tossed in a rich, slow-cooked meat sauce with a blend of beef and pork, topped with Parmesan.",
        price: 14.99,
        imageUrl:
          "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800",
        categoryId: pasta.id,
      },
      {
        name: "Fettuccine Alfredo",
        description:
          "Silky fettuccine pasta in a creamy Parmesan alfredo sauce with a hint of garlic and nutmeg.",
        price: 13.99,
        imageUrl:
          "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=800",
        categoryId: pasta.id,
      },
      {
        name: "Caesar Salad",
        description:
          "Crisp romaine lettuce, crunchy croutons, shaved Parmesan, and our house-made Caesar dressing.",
        price: 9.99,
        imageUrl:
          "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=800",
        categoryId: salad.id,
      },
      {
        name: "Greek Salad",
        description:
          "Fresh cucumbers, tomatoes, red onion, Kalamata olives, and feta cheese with a lemon-oregano vinaigrette.",
        price: 10.49,
        imageUrl:
          "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800",
        categoryId: salad.id,
      },
      {
        name: "Chocolate Lava Cake",
        description:
          "Warm, rich chocolate cake with a molten center, served with vanilla ice cream and fresh berries.",
        price: 8.99,
        imageUrl:
          "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800",
        categoryId: dessert.id,
      },
      {
        name: "Tiramisu",
        description:
          "Layers of espresso-soaked ladyfingers and mascarpone cream, dusted with cocoa powder.",
        price: 7.99,
        imageUrl:
          "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800",
        categoryId: dessert.id,
      },
      {
        name: "Fresh Lemonade",
        description:
          "Hand-squeezed lemonade with a hint of mint, served ice cold.",
        price: 4.99,
        imageUrl:
          "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=800",
        categoryId: beverage.id,
      },
      {
        name: "Iced Coffee",
        description:
          "Cold-brewed coffee served over ice with your choice of milk and sweetener.",
        price: 5.49,
        imageUrl:
          "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=800",
        categoryId: beverage.id,
      },
    ],
  });

  console.log("Seed data created successfully!");

  // Upsert admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@flavorhaven.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@flavorhaven.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("Admin user ready: admin@flavorhaven.com / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
