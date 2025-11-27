import mongoose from 'mongoose';

const pollSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Please provide a question'],
      trim: true
    },
    description: String,
    options: [
      {
        text: String,
        votes: {
          type: Number,
          default: 0
        },
        votedBy: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
          }
        ]
      }
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['active', 'closed'],
      default: 'active'
    },
    targetAudience: {
      type: String,
      enum: ['all', 'residents', 'admin'],
      default: 'all'
    },
    allowMultipleVotes: {
      type: Boolean,
      default: false
    },
    endsAt: Date,
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default mongoose.model('Poll', pollSchema);
