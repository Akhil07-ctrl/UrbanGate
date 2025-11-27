import Payment from '../models/Payment.js';

export const createPayment = async (req, res, next) => {
  try {
    const { month, amount, description, breakdown, dueDate } = req.body;

    const payment = new Payment({
      residentId: req.user.userId,
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

    let query = {};

    if (req.user.role === 'resident') {
      query.residentId = req.user.userId;
    }

    if (status) query.status = status;

    const payments = await Payment.find(query)
      .populate('residentId', 'name email apartment')
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

    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        status: 'paid',
        paidAt: new Date(),
        transactionId,
        paymentMethod: paymentMethod || 'online'
      },
      { new: true }
    ).populate('residentId', 'name email apartment');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

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
      .populate('residentId', 'name email apartment phone');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check authorization
    if (req.user.role === 'resident' && payment.residentId._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Generate invoice data (in production, use a PDF library)
    const invoice = {
      id: payment._id,
      resident: payment.residentId,
      month: payment.month,
      amount: payment.amount,
      breakdown: payment.breakdown,
      status: payment.status,
      paidAt: payment.paidAt,
      transactionId: payment.transactionId
    };

    res.status(200).json(invoice);
  } catch (error) {
    next(error);
  }
};
