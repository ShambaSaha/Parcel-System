import mongoose from 'mongoose';

const urlSchema = new mongoose.Schema({
  shortId: {
    type: String,
    required: true,
    unique: true,
  },
  redirectURL: {
    type: String,
    required: true,
    validate: {
      validator: (value) => {
        const regex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i; // Simple URL validation regex
        return regex.test(value);
      },
      message: 'Invalid URL format',
    },
  },
  visitHistory: [
    {
      timestamp: { type: Number },
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Ensure this matches the exact name of your user model
  },
}, 
{
  timestamps: true, // Adds createdAt and updatedAt automatically
});

const URL = mongoose.model("URL", urlSchema); // "URL" is the model name, which will be pluralized to "urls" in the database

export default URL;
