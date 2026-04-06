import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning database...");
  // Order matters: Delete books first because they reference Users
  await prisma.book.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seeding Users...");

  // 1. Create the Admin who will "own" the books
  const admin = await prisma.user.create({
    data: {
      email: 'admin@library.com',
      password: 'alice_admin',
      firstName: 'Alice',
      lastName: 'Asthana',
      role: 'ADMIN', // Ensure this matches your Enum in schema.prisma
    },
  });

  // 2. Create the Readers
  const readers = await prisma.user.createMany({
    data: [
      { email: 'reader.bob@example.com', password: 'bob_reader', firstName: 'Bob', lastName: 'Burma', role: 'READER' },
      { email: 'reader.charlie@example.com', password:'charlie_reader', firstName: 'Charlie', lastName: 'Chaturwedi', role: 'READER' },
    ],
  });

  console.log(`Users created: 1 Admin, 2 Readers.`);

  console.log("Seeding Books...");

  // 3. Create Books linked to the Admin ID
  const booksData = [
    {
      ISBN: "9780143127550",
      title: "The Martian",
      author: "Andy Weir",
      categories: ["Science Fiction", "Survival"],
      description: "A stranded astronaut must survive on Mars using his ingenuity.",
      pages: 369,
      publisher: "Crown Publishing Group",
      language: "English",
      published_year: 2011,
      createdBy: admin.id, // Linking to the Admin we just created
    },
    {
      ISBN: "9780544003415",
      title: "The Lord of the Rings",
      author: "J.R.R. Tolkien",
      categories: ["Fantasy", "Adventure"],
      description: "The epic journey to destroy the One Ring.",
      pages: 1178,
      publisher: "Houghton Mifflin Harcourt",
      language: "English",
      published_year: 1954,
      createdBy: admin.id,
    },
    {
      ISBN: "9780441569595",
      title: "Neuromancer",
      author: "William Gibson",
      categories: ["Cyberpunk", "Fiction"],
      description: "The matrix before the Matrix was cool.",
      pages: 271,
      publisher: "Ace Books",
      language: "English",
      published_year: 1984,
      createdBy: admin.id,
    }
  ];

  for (const book of booksData) {
    await prisma.book.create({ data: book });
  }

  console.log("Seeding complete! 🌱");
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