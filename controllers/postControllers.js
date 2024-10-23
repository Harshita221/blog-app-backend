const Post = require("../models/postModel");
const User = require("../models/userModel");
const HttpError = require("../models/errorModel");
const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");

const createPost = async (req, res, next) => {
  try {
    let { title, category, description } = req.body;
    if (!title || !category || !description || !req.files || !req.files.thumbnail) {
      return next(new HttpError("Please fill all the fields and choose a thumbnail", 422));
    }
    
    const { thumbnail } = req.files;
    if (thumbnail.size > 2000000) {
      return next(new HttpError("Thumbnail too big. File should be less than 2MB.", 422));
    }

    let fileName = thumbnail.name;
    let splittedFilename = fileName.split(".");
    let newFilename = splittedFilename[0] + uuid() + "." + splittedFilename[splittedFilename.length - 1];

    await thumbnail.mv(path.join(__dirname, "..", "/uploads", newFilename));

    const newPost = await Post.create({
      title,
      category,
      description,
      thumbnail: newFilename,
      creator: req.user.id,
    });

    if (!newPost) {
      return next(new HttpError("Post couldn't be created", 422));
    }

    await User.findByIdAndUpdate(req.user.id, { $inc: { posts: 1 } });
    res.status(201).json(newPost);
  } catch (error) {
    return next(new HttpError(error.message || "An error occurred while creating the post"));
  }
};

const getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find().sort({ updatedAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    return next(new HttpError(error.message || "An error occurred while fetching posts"));
  }
};

const getPost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) {
      return next(new HttpError("Post not found", 404));
    }
    res.status(200).json(post);
  } catch (error) {
    return next(new HttpError(error.message || "An error occurred while fetching the post"));
  }
};

const getCatPosts = async (req, res, next) => {
  try {
    const { category } = req.params;
    const catPosts = await Post.find({ category }).sort({ createdAt: -1 });
    res.status(200).json(catPosts);
  } catch (error) {
    return next(new HttpError(error.message || "An error occurred while fetching category posts"));
  }
};

const getUserPosts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const posts = await Post.find({ creator: id }).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    return next(new HttpError(error.message || "An error occurred while fetching user posts"));
  }
};

const editPost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    let { title, category, description } = req.body;

    if (!title || !category || !description || description.length < 12) {
      return next(new HttpError("Fill in all fields correctly", 422));
    }

    const oldPost = await Post.findById(postId);
    if (!oldPost) {
      return next(new HttpError("Post not found", 404));
    }

    if (req.user.id != oldPost.creator) {
      return next(new HttpError("Unauthorized", 403));
    }

    let updatedPostData = { title, category, description };

    if (req.files && req.files.thumbnail) {
      const { thumbnail } = req.files;

      if (thumbnail.size > 2000000) {
        return next(new HttpError("Thumbnail too big. Should be less than 2MB", 422));
      }

      // Delete old thumbnail
      fs.unlink(path.join(__dirname, "..", "/uploads", oldPost.thumbnail), (err) => {
        if (err) {
          console.error("Error deleting old thumbnail:", err);
        }
      });

      let fileName = thumbnail.name;
      let splittedFilename = fileName.split(".");
      let newFilename = splittedFilename[0] + uuid() + "." + splittedFilename[splittedFilename.length - 1];

      await thumbnail.mv(path.join(__dirname, "..", "/uploads", newFilename));
      updatedPostData.thumbnail = newFilename;
    }

    const updatedPost = await Post.findByIdAndUpdate(postId, updatedPostData, { new: true });

    if (!updatedPost) {
      return next(new HttpError("Could not update post", 400));
    }

    res.status(200).json(updatedPost);
  } catch (error) {
    return next(new HttpError(error.message || "An error occurred while updating the post"));
  }
};

const deletePost = async (req, res, next) => {
  try {
    const postId = req.params.id;

    if (!postId) {
      return next(new HttpError("Post unavailable", 400));
    }

    const post = await Post.findById(postId);
    if (!post) {
      return next(new HttpError("Post not found", 404));
    }

    if (req.user.id != post.creator) {
      return next(new HttpError("You do not have permission to delete this post", 403));
    }

    // Delete thumbnail from uploads
    fs.unlink(path.join(__dirname, "..", "/uploads", post.thumbnail), async (err) => {
      if (err) {
        return next(new HttpError("Error deleting the thumbnail", 500));
      }
      await Post.findByIdAndDelete(postId);
      await User.findByIdAndUpdate(req.user.id, { $inc: { posts: -1 } });
      res.json(`Post ${postId} deleted successfully.`);
    });
  } catch (error) {
    return next(new HttpError(error.message || "An error occurred while deleting the post"));
  }
};

module.exports = {
  createPost,
  getPosts,
  getCatPosts,
  getPost,
  getUserPosts,
  editPost,
  deletePost,
};
