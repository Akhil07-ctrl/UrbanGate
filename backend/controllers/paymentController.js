import Payment from '../models/Payment.js';
import User from '../models/User.js';
import Community from '../models/Community.js';

// Create payment for a single resident or bulk create for all residents
export const createPayment = async (req, res, next) => {
  try {
    const { month, amount, description, breakdown, dueDate, residentId, createForAll } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user.communityId) {
      return res.status(400).json({ message: 'User must be part of a community' });
    }

    // If creating for all residents
    if (createForAll && req.user.role === 'admin') {
      const community = await Community.findById(user.communityId);
      if (!community) {
        return res.status(404).json({ message: 'Community not found' });
      }

      // Get all resident members
      const residentMembers = community.members.filter(m => m.role === 'resident' && m.isActive);
      
      if (residentMembers.length === 0) {
        return res.status(400).json({ message: 'No residents found in community' });
      }

      const payments = [];
      for (const member of residentMembers) {
        // Check if payment already exists for this month
        const existingPayment = await Payment.findOne({
          communityId: user.communityId,
          residentId: member.userId,
          month: new Date(month)
        });

        if (!existingPayment) {
          const payment = new Payment({
            communityId: user.communityId,
            residentId: member.userId,
            month: new Date(month),
            amount,
            description,
            breakdown: breakdown || {},
            dueDate: dueDate ? new Date(dueDate) : null,
            status: 'pending'
          });
          payments.push(payment);
        }
      }

      if (payments.length > 0) {
        await Payment.insertMany(payments);
      }

      return res.status(201).json({
        message: `Payments created for ${payments.length} residents`,
        count: payments.length
      });
    }

    // Single payment creation
    const targetResidentId = residentId || req.user.userId;
    
    // Verify resident is in the same community
    if (req.user.role === 'admin') {
      const community = await Community.findById(user.communityId);
      const isMember = community.members.some(m => 
        m.userId.toString() === targetResidentId && m.isActive
      );
      if (!isMember) {
        return res.status(403).json({ message: 'Resident not found in your community' });
      }
    }

    const payment = new Payment({
      communityId: user.communityId,
      residentId: targetResidentId,
      month: new Date(month),
      amount,
      description,
      breakdown: breakdown || {},
      dueDate: dueDate ? new Date(dueDate) : null,
      status: 'pending'
    });

    await payment.save();

    res.status(201).json({
      message: 'Payment created successfully',
      payment
    });
  } catch (error) {
    next(error);
  }
};

export const getPayments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user.userId);

    if (!user.communityId) {
      return res.status(400).json({ message: 'User must be part of a community' });
    }

    let query = { communityId: user.communityId };

    // Only residents can see payments
    if (req.user.role === 'resident') {
      query.residentId = req.user.userId;
    } else if (req.user.role === 'admin') {
      // Admin can see all payments in their community
      // No additional filter needed
    } else {
      // Security and other roles cannot see payments
      return res.status(403).json({ message: 'Access denied. Only residents and admins can view payments.' });
    }

    if (status) query.status = status;

    const payments = await Payment.find(query)
      .populate('residentId', 'name email phone')
      .populate('communityId', 'name')
      .sort({ month: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(query);

    res.status(200).json({
      payments,
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

export const markAsPaid = async (req, res, next) => {
  try {
    const { transactionId, paymentMethod } = req.body;
    const paymentId = req.params.id;
    const user = await User.findById(req.user.userId);

    // Only residents can mark their own payments as paid
    if (req.user.role !== 'resident') {
      return res.status(403).json({ message: 'Only residents can mark payments as paid' });
    }

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Verify payment belongs to the user and their community
    if (payment.residentId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only mark your own payments as paid' });
    }

    if (payment.communityId.toString() !== user.communityId.toString()) {
      return res.status(403).json({ message: 'Payment does not belong to your community' });
    }

    payment.status = 'paid';
    payment.paidAt = new Date();
    payment.transactionId = transactionId;
    payment.paymentMethod = paymentMethod || 'online';
    await payment.save();

    await payment.populate('residentId', 'name email phone');

    res.status(200).json({
      message: 'Payment marked as paid',
      payment
    });
  } catch (error) {
    next(error);
  }
};

export const downloadInvoice = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('residentId', 'name email phone')
      .populate('communityId', 'name location');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    const user = await User.findById(req.user.userId);

    // Check authorization - only residents can download their own invoices
    if (req.user.role === 'resident') {
      if (payment.residentId._id.toString() !== req.user.userId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only residents and admins can download invoices.' });
    }

    // Verify community match
    if (payment.communityId._id.toString() !== user.communityId.toString()) {
      return res.status(403).json({ message: 'Payment does not belong to your community' });
    }

    // Generate invoice data (in production, use a PDF library)
    const invoice = {
      id: payment._id,
      community: payment.communityId,
      resident: payment.residentId,
      month: payment.month,
      amount: payment.amount,
      breakdown: payment.breakdown,
      status: payment.status,
      paidAt: payment.paidAt,
      transactionId: payment.transactionId,
      dueDate: payment.dueDate,
      description: payment.description
    };

    res.status(200).json(invoice);
  } catch (error) {
    next(error);
  }
};
