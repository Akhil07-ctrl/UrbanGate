import Poll from '../models/Poll.js';
import User from '../models/User.js';

export const createPoll = async (req, res, next) => {
  try {
    const { question, description, options, targetAudience, endsAt } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user.communityId) {
      return res.status(400).json({ message: 'User must be part of a community' });
    }

    const poll = new Poll({
      communityId: user.communityId,
      question,
      description,
      options: options.map(option => ({ text: option, votes: 0, votedBy: [] })),
      createdBy: req.user.userId,
      targetAudience: targetAudience || 'all',
      status: 'active',
      endsAt: endsAt ? new Date(endsAt) : null
    });

    await poll.save();
    await poll.populate('createdBy', 'name email role');
    await poll.populate('communityId', 'name');

    res.status(201).json({
      message: 'Poll created successfully',
      poll
    });
  } catch (error) {
    next(error);
  }
};

export const getPolls = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const user = await User.findById(req.user.userId);

    if (!user.communityId) {
      return res.status(400).json({ message: 'User must be part of a community' });
    }

    let query = { communityId: user.communityId };

    if (status) query.status = status;

    // Filter by target audience
    if (req.user.role === 'resident') {
      query.$or = [
        { targetAudience: 'all' },
        { targetAudience: 'residents' }
      ];
    }

    const polls = await Poll.find(query)
      .populate('createdBy', 'name email role')
      .populate('communityId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Poll.countDocuments(query);

    res.status(200).json({
      polls,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getPollById = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user.communityId) {
      return res.status(400).json({ message: 'User must be part of a community' });
    }

    const poll = await Poll.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('communityId', 'name');

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    // Verify poll belongs to user's community
    if (poll.communityId._id.toString() !== user.communityId.toString()) {
      return res.status(403).json({ message: 'Poll does not belong to your community' });
    }

    res.status(200).json(poll);
  } catch (error) {
    next(error);
  }
};

export const votePoll = async (req, res, next) => {
  try {
    const { optionIndex } = req.body;
    const pollId = req.params.id;
    const user = await User.findById(req.user.userId);

    if (!user.communityId) {
      return res.status(400).json({ message: 'User must be part of a community' });
    }

    const poll = await Poll.findById(pollId);

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    // Verify poll belongs to user's community
    if (poll.communityId.toString() !== user.communityId.toString()) {
      return res.status(403).json({ message: 'Poll does not belong to your community' });
    }

    if (poll.status !== 'active') {
      return res.status(400).json({ message: 'Poll is closed' });
    }

    const option = poll.options[optionIndex];

    if (!option) {
      return res.status(400).json({ message: 'Invalid option' });
    }

    // Check if user already voted in any option
    const hasVoted = poll.options.some(opt => opt.votedBy.includes(req.user.userId));

    if (hasVoted && !poll.allowMultipleVotes) {
      return res.status(400).json({ message: 'You have already voted in this poll' });
    }

    if (!option.votedBy.includes(req.user.userId)) {
      option.votes += 1;
      option.votedBy.push(req.user.userId);
    }

    await poll.save();

    res.status(200).json({
      message: 'Vote recorded successfully',
      poll
    });
  } catch (error) {
    next(error);
  }
};

export const closePoll = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user.communityId) {
      return res.status(400).json({ message: 'User must be part of a community' });
    }

    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    // Verify poll belongs to admin's community
    if (poll.communityId.toString() !== user.communityId.toString()) {
      return res.status(403).json({ message: 'Poll does not belong to your community' });
    }

    poll.status = 'closed';
    await poll.save();
    await poll.populate('createdBy', 'name email role');
    await poll.populate('communityId', 'name');

    res.status(200).json({
      message: 'Poll closed successfully',
      poll
    });
  } catch (error) {
    next(error);
  }
};
