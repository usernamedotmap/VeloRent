import { connectDB } from "../config/db";
import bcrypt from "bcryptjs";
import { User } from "../models";

const seed = async () => {
  connectDB();

  const existing = await User.findOne({ email: "admin@gmail.com" });

  if (existing) {
    console.log("This email is already exist");
    process.exit(1);
  }

  const saltRounds = 12;
  const hashPassword = await bcrypt.hash("admin123456", saltRounds);

  await User.create({
    firstName: "admin",
    lastName: "admin",
    email: "admin@gmail.com",
    passwordHash: hashPassword,
    phone: "09000000000",
    isVerified: true,
    role: "admin",
  });

  console.log("✅ Admin seeded successfully");
  console.log("   Email:    admin@velorent.com");
  console.log("   Password: Admin@123456");
  console.log("   ⚠️  Change this password immediately after first login!");
  process.exit(0);
};

seed().catch((err) => {
    console.log('Seeder failed', err);
    process.exit(1)
});

export default seed;
