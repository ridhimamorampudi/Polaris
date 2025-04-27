import mongoose from 'mongoose';

// Message schema for conversations
const MessageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  sender: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// College schema for user's college list
const CollegeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Reach', 'Match', 'Safety'],
    required: true
  },
  applicationStatus: {
    type: String, 
    enum: ['Planning', 'In Progress', 'Submitted', 'Accepted', 'Rejected', 'Waitlisted'],
    default: 'Planning'
  },
  notes: String,
  deadline: Date
});

// Embedded conversation schema
const ConversationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  messages: [MessageSchema],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
  },
  image: {
    type: String,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  profile: {
    gpa: Number,
    satAct: Number,
    apCourses: [String],
    activities: [String],
    interests: [String],
    primaryMajor: String,
    backupMajor: String,
  },
  // College list
  collegeList: [CollegeSchema],
  // Add conversations field to store user's conversations
  conversations: [ConversationSchema],
}, {
  timestamps: true,
});

export default mongoose.models.User || mongoose.model('User', UserSchema); 