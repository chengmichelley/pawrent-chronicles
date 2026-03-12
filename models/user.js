const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    comments: [{
      text: { type: String, required: true },
      username: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }],
  },
  {
    timestamps: true,
});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    hashedPassword: {
        type: String,
        required: true
    },
    blog: [blogSchema],
}, {
    timestamps: true
 })

 const User = mongoose.model('User', userSchema)

 module.exports = User