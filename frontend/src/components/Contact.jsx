import { useState } from 'react';
import { toast } from 'react-toastify';

import { Card } from './UI';

export const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        if (!formData.name || !formData.email || !formData.subject || !formData.message) {
            toast.error('Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            // Simulate form submission (you can replace with actual API call)
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success('Message sent successfully! We will contact you soon.');
            setFormData({
                name: '',
                email: '',
                phone: '',
                subject: '',
                message: '',
            });
        } catch (error) {
            toast.error('Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="contact" className="py-20 px-4">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-4xl font-bold text-center mb-4">Get In Touch</h2>
                <p className="text-center text-textLight mb-12 text-lg">
                    Have questions? We'd love to hear from you. Send us a message.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <Card className="hover:shadow-lg transition-shadow text-center">
                        <div className="mb-4 text-4xl">📧</div>
                        <h3 className="text-lg font-bold text-text mb-2">Email</h3>
                        <p className="text-textLight">support@urbangate.com</p>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow text-center">
                        <div className="mb-4 text-4xl">📱</div>
                        <h3 className="text-lg font-bold text-text mb-2">Phone</h3>
                        <p className="text-textLight">+1 (555) 123-4567</p>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow text-center">
                        <div className="mb-4 text-4xl">📍</div>
                        <h3 className="text-lg font-bold text-text mb-2">Address</h3>
                        <p className="text-textLight">123 Tech Street, City, Country</p>
                    </Card>
                </div>

                <Card className="hover:shadow-lg transition-shadow">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-text mb-2">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Your name"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-text mb-2">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="your.email@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-text mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-text mb-2">
                                    Subject *
                                </label>
                                <select
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select a subject</option>
                                    <option value="sales">Sales Inquiry</option>
                                    <option value="support">Technical Support</option>
                                    <option value="demo">Schedule a Demo</option>
                                    <option value="partnership">Partnership</option>
                                    <option value="feedback">Feedback</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-text mb-2">
                                Message *
                            </label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                rows="5"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Tell us more about your inquiry..."
                                required
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                </Card>
            </div>
        </section>
    );
};
