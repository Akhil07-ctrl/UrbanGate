import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Card, Button } from '../components/UI';

export const Welcome = () => {
  const features = [
    {
      icon: '📱',
      title: 'Easy Communication',
      description: 'Connect with management and neighbors through announcements and messaging',
    },
    {
      icon: '🚨',
      title: 'Complaint Management',
      description: 'Report and track maintenance issues with real-time status updates',
    },
    {
      icon: '🅿️',
      title: 'Smart Parking',
      description: 'Manage parking spaces and allocations with ease',
    },
    {
      icon: '💰',
      title: 'Payment Gateway',
      description: 'Secure and convenient online payment for dues and fees',
    },
    {
      icon: '🏋️',
      title: 'Facilities Booking',
      description: 'Book community facilities like gym, pool, and meeting rooms',
    },
    {
      icon: '👥',
      title: 'Visitor Management',
      description: 'Issue and manage visitor passes digitally',
    },
  ];

  const benefits = [
    {
      number: '1',
      title: 'Centralized Management',
      description: 'All apartment management tasks in one platform',
    },
    {
      number: '2',
      title: 'Real-time Updates',
      description: 'Stay informed with instant notifications and alerts',
    },
    {
      number: '3',
      title: 'Transparent Governance',
      description: 'Participate in polls and community decisions',
    },
    {
      number: '4',
      title: 'Data Security',
      description: 'Your information is safe with enterprise-grade security',
    },
  ];

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      role: 'Apartment Resident',
      text: 'UrbanGate has made life so much easier. Everything I need is just a tap away!',
      image: '👤',
    },
    {
      name: 'Priya Singh',
      role: 'Building Administrator',
      text: 'Managing complaints and announcements is now super efficient. Highly recommended!',
      image: '👤',
    },
    {
      name: 'Amit Patel',
      role: 'Society Manager',
      text: 'The automated payment system and facility booking have saved us so much time.',
      image: '👤',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="flex-1 bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Smart Apartment Management
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Simplify your community living with UrbanGate
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="px-8 py-3 border-2 border-white rounded-lg text-white hover:bg-white hover:text-blue-600 transition-colors font-semibold">
                Get Started Free
              </button>
              <button className="px-8 py-3 border-2 border-white rounded-lg text-white hover:bg-white hover:text-blue-600 transition-colors font-semibold">
                Schedule a Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-secondary">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Key Features</h2>
          <p className="text-center text-textLight mb-12 text-lg">
            Everything you need to manage your apartment community
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-text mb-2">{feature.title}</h3>
                  <p className="text-textLight">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Why Choose UrbanGate?</h2>
          <p className="text-center text-textLight mb-12 text-lg">
            Trusted by apartment communities worldwide
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">{benefit.number}</span>
                </div>
                <h3 className="text-xl font-bold text-text mb-2">{benefit.title}</h3>
                <p className="text-textLight text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-secondary">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">What People Say</h2>
          <p className="text-center text-textLight mb-12 text-lg">
            Hear from our satisfied users
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">{testimonial.image}</div>
                    <div>
                      <h3 className="font-bold text-text">{testimonial.name}</h3>
                      <p className="text-sm text-textLight">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-textLight italic">"{testimonial.text}"</p>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400">⭐</span>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Community?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of apartment communities already using UrbanGate
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="px-8 py-3 border-2 border-white rounded-lg text-white hover:bg-white hover:text-blue-600 transition-colors font-semibold">
              Start Free Trial
            </button>
            <button className="px-8 py-3 border-2 border-white rounded-lg text-white hover:bg-white hover:text-blue-600 transition-colors font-semibold">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
