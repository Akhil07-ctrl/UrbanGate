import User from '../models/User.js';
import { generateToken } from '../utils/helpers.js';
import { validateEmail, sanitizeInput } from '../utils/validation.js';

export const register = async (req, res, next) => {
  try {
    let { name, email, password, role, phone } = req.body;

    // Validate input
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Please provide name, email, password, and role' });
    }

    // Sanitize inputs
    name = sanitizeInput(name);
    email = email.toLowerCase().trim();

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Validate role
    if (!['admin', 'resident', 'security'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be admin, resident, or security' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create user
    const user = new User({
      name,
      email,
      password,
      role,
      phone: phone ? sanitizeInput(phone) : undefined
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id, user.role, user.email);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        communityId: user.communityId
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    // Sanitize and validate email
    email = email.toLowerCase().trim();
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Find user and include password
    const user = await User.findOne({ email }).select('+password').populate('communityId');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user._id, user.role, user.email);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        communityId: user.communityId?._id,
        communityName: user.communityId?.name
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).populate('communityId');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        communityId: user.communityId?._id,
        communityName: user.communityId?.name,
        phone: user.phone,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, profileImage } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { name, phone, profileImage },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    next(error);
  }
};
