/**
 * Seed Script - Initialize Database with Sample Data
 * 
 * Usage: node backend/seed.js
 * 
 * Creates:
 * - 3 demo users (resident, admin, security)
 * - 5 sample complaints
 * - 3 announcements
 * - 5 parking slots
 * - 3 facilities
 * - Sample payments
 * - Sample polls
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import config from './config/config.js';
import User from './models/User.js';
import Complaint from './models/Complaint.js';
import Announcement from './models/Announcement.js';
import Parking from './models/Parking.js';
import Facility from './models/Facility.js';
import Payment from './models/Payment.js';
import Poll from './models/Poll.js';

const seedDatabase = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Complaint.deleteMany({}),
      Announcement.deleteMany({}),
      Parking.deleteMany({}),
      Facility.deleteMany({}),
      Payment.deleteMany({}),
      Poll.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // Create users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const users = await User.create([
      {
        name: 'Resident User',
        email: 'resident@example.com',
        password: hashedPassword,
        role: 'resident',
        apartment: 'A-101',
        phone: '9876543210',
      },
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        apartment: 'ADMIN',
        phone: '9876543211',
      },
      {
        name: 'Security Guard',
        email: 'security@example.com',
        password: hashedPassword,
        role: 'security',
        apartment: 'SECURITY',
        phone: '9876543212',
      },
    ]);
    console.log('Created users');

    // Create complaints
    await Complaint.create([
      {
        title: 'Broken Water Pipe',
        description: 'Water pipe in bathroom is leaking water',
        category: 'water',
        priority: 'high',
        status: 'open',
        residentId: users[0]._id,
      },
      {
        title: 'Lift not working',
        description: 'Building lift is not functioning since morning',
        category: 'maintenance',
        priority: 'high',
        status: 'in-progress',
        residentId: users[0]._id,
        assignedTo: users[1]._id,
      },
    ]);
    console.log('Created complaints');

    // Create announcements
    await Announcement.create([
      {
        title: 'Maintenance Notice',
        content: 'Building maintenance will be done on 15th of this month. Please be available.',
        category: 'maintenance',
        createdBy: users[1]._id,
        isUrgent: false,
      },
      {
        title: '🚨 Water Cut Alert',
        content: 'Water supply will be cut on Sunday 6 AM to 12 PM for pipeline maintenance.',
        category: 'emergency',
        createdBy: users[1]._id,
        isUrgent: true,
      },
    ]);
    console.log('Created announcements');

    // Create parking slots
    await Parking.create([
      {
        slotNumber: 'P-001',
        type: 'resident',
        residentId: users[0]._id,
        isAvailable: false,
        block: 'A',
        floor: 'Ground',
      },
      {
        slotNumber: 'P-002',
        type: 'guest',
        isAvailable: true,
        block: 'A',
        floor: 'Ground',
      },
      {
        slotNumber: 'P-003',
        type: 'guest',
        isAvailable: true,
        block: 'B',
        floor: 'First',
      },
    ]);
    console.log('Created parking slots');

    // Create facilities
    await Facility.create([
      {
        name: 'Community Clubhouse',
        description: 'Multi-purpose hall for community events and gatherings',
        type: 'clubhouse',
        capacity: 100,
        workingHours: { open: '09:00', close: '21:00' },
      },
      {
        name: 'Gym',
        description: 'Fully equipped fitness center with modern equipment',
        type: 'gym',
        capacity: 30,
        workingHours: { open: '06:00', close: '22:00' },
      },
      {
        name: 'Guest House',
        description: 'Guest rooms for visitors',
        type: 'guest-room',
        capacity: 4,
        workingHours: { open: '00:00', close: '23:59' },
      },
    ]);
    console.log('Created facilities');

    // Create payments
    await Payment.create([
      {
        residentId: users[0]._id,
        month: new Date(2024, 0, 1),
        amount: 5000,
        description: 'January 2024 Maintenance',
        status: 'paid',
        paymentMethod: 'online',
        paidAt: new Date(),
        breakdown: {
          maintenance: 3000,
          water: 1000,
          electricity: 1000,
        },
      },
      {
        residentId: users[0]._id,
        month: new Date(2024, 1, 1),
        amount: 5000,
        description: 'February 2024 Maintenance',
        status: 'pending',
        dueDate: new Date(2024, 1, 15),
        breakdown: {
          maintenance: 3000,
          water: 1000,
          electricity: 1000,
        },
      },
    ]);
    console.log('Created payments');

    // Create poll
    await Poll.create([
      {
        question: 'Should we install solar panels?',
        description: 'Vote on whether the building should install solar panels for energy conservation',
        options: [
          { text: 'Yes, go for it', votes: 0, votedBy: [] },
          { text: 'No, too expensive', votes: 0, votedBy: [] },
          { text: 'Need more information', votes: 0, votedBy: [] },
        ],
        createdBy: users[1]._id,
        status: 'active',
      },
    ]);
    console.log('Created polls');

    console.log('\n✅ Database seeded successfully!');
    console.log('\nDemo Credentials:');
    console.log('1. Resident: resident@example.com / password123');
    console.log('2. Admin: admin@example.com / password123');
    console.log('3. Security: security@example.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
