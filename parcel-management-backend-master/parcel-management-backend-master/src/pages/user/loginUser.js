import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

async function loginUser(req, res) {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({
      status: "error",
      message: "Email and password are required",
    });
  }

  const uri = process.env.MONGODB_CONNECTION_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();

    const database = client.db("parcel-management-system");
    const users = database.collection("users");

    // Find user
    const user = await users.findOne({ email });
    if (!user) {
      return res.status(400).json({
        status: "error",
        message: "User does not exist",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      status: "success",
      message: "Login successful",
      token,
      userId: user._id.toString(),
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

export default loginUser;
