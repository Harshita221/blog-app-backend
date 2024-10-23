const { Schema, model } = require("mongoose");

const postSchema = new Schema(
  {
    title: { 
      type: String, 
      required: [true, "Title is required"] 
    },
    category: {
      type: String,
      enum: {
        values: [
          "Agriculture",
          "Business",
          "Education",
          "Entertainment",
          "Art",
          "Investment",
          "Uncategorized",
          "Weather",
        ],
        message: "{VALUE} is not a valid category",  // More user-friendly
      },
      default: "Uncategorized", // Optional, defaults to "Uncategorized" if none is provided
    },
    description: { 
      type: String, 
      required: [true, "Description is required"] 
    },
    creator: { 
      type: Schema.Types.ObjectId, 
      ref: "User",
      required: true // Assuming a post must always have a creator
    },
    thumbnail: { 
      type: String, 
      required: [true, "Thumbnail is required"] 
    },
  },
  { 
    timestamps: true  // Automatically adds createdAt and updatedAt timestamps
  }
);

module.exports = model("Post", postSchema);
