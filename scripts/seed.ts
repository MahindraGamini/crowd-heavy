// scripts/seed.ts
import mongoose from "mongoose";
import { connectDB } from "../app/lib/db";
import { FoodCourt } from "../app/models/FoodCourt";

const courts = [
  { name: "Oasis",   vendors: ["Purple Grapes", "Royal Caters", "Chettai's", "MDP Coffee"] },
  { name: "Mythri",  vendors: ["Subham", "Annapurna"] },
  { name: "Arena",   vendors: ["Subham", "Chettai's"] },
  { name: "Magna",   vendors: [] }, // add vendors when you have them
  { name: "Fiesta",  vendors: ["Chettai's", "Subham"] },
  { name: "Enroute", vendors: ["Annapurna", "Chettai's"] },
];

async function seed() {
  await connectDB();

  const result = await FoodCourt.bulkWrite(
    courts.map((c) => ({
      updateOne: {
        filter: { name: c.name },
        update: {
          $set: { vendors: c.vendors },
          $setOnInsert: { crowd: "Quiet", note: "", updatedAt: new Date() },
        },
        upsert: true,
      },
    }))
  );

  console.log(`Inserted ${result.upsertedCount}, updated ${result.modifiedCount}`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});