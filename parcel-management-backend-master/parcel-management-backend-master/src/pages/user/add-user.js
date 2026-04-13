import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

async function addNewUser(req, res) {
  const { name, email, password, role } = req.body;

  // Validation
  if (!name || !email || !password || !role) {
    return res.status(400).json({
      status: "error",
      message: "Missing required fields",
    });
  }

  const uri = process.env.MONGODB_CONNECTION_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();

    const database = client.db("parcel-management-system");
    const users = database.collection("users");

    // Check if user already exists
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        status: "error",
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      name,
      email,
      password: hashedPassword,
      role,
      createdAt: new Date(),
    };

    const result = await users.insertOne(userData);

    return res.status(201).json({
      status: "success",
      message: "User added successfully",
      userId: result.insertedId,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  } finally {
    await client.close();
  }
}

export default addNewUser;
