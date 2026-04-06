import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const prisma = new PrismaClient();

const adminId = process.env.ROOT_ADMIN_ID;

async function main() {
  const books = [
    {
      ISBN: "9780143127550",
      title: "The Martian",
      author: "Andy Weir",
      categories: ["Science Fiction", "Adventure"],
      thumbnail_url: "https://example.com/martian.jpg",
      description: "A stranded astronaut must survive on Mars.",
      pages: 369,
      publisher: "Crown Publishing Group",
      language: "English",
      published_year: 2011,
      createdBy: adminId,
    },
    {
      ISBN: "9780544003415",
      title: "The Lord of the Rings",
      author: "J.R.R. Tolkien",
      categories: ["Fantasy", "Classic"],
      thumbnail_url: "https://example.com/lotr.jpg",
      description: "The epic fight against the Dark Lord Sauron.",
      pages: 1178,
      publisher: "Houghton Mifflin Harcourt",
      language: "English",
      published_year: 1954,
      createdBy: adminId,
    },
    {
      ISBN: "9780441569595",
      title: "Neuromancer",
      author: "William Gibson",
      categories: ["Cyberpunk", "Fiction"],
      thumbnail_url: "https://example.com/neuromancer.jpg",
      description: "The novel that defined the cyberpunk genre.",
      pages: 271,
      publisher: "Ace Books",
      language: "English",
      published_year: 1984,
      createdBy: adminId,
    },
  ];

  console.log("Start seeding...");

  for (const book of books) {
    const result = await prisma.book.upsert({
      where: { ISBN: book.ISBN },
      update: {},
      create: book,
    });
    console.log(`Created/Updated book: ${result.title}`);
  }

  console.log("Seeding finished.");
}

main()  
  .catch( (e) => {
    console.error(e);
    process.exit(1);
  }).finally(async () => {
    await prisma.$disconnect();
  })
