import { Card } from './UI';

export const Features = () => {
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

    return (
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
    );
};
