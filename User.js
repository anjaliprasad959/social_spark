// server/models/User.js
// Mongoose schema representing a SocialSpark user.  Defaults follow
// the old frontend-localStorage values and provide fields necessary
// for authentication and progress tracking.

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // progress fields
    level: { type: Number, default: 1 },
    xpTotal: { type: Number, default: 0 }, // cumulative XP across the lifetime
    xpCurrent: { type: Number, default: 0 }, // XP inside the current level (0-99)

    streak: { type: Number, default: 0 },
    lastActivityDate: { type: String, default: '' },
    completedTasks: { type: [String], default: [] },
    streakFreezeAvailable: { type: Boolean, default: false },

    // onboarding flag keeps track of whether we have saved the
    // initial assessment values for this user yet.
    onboarded: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
