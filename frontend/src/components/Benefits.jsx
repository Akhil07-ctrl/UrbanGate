export const Benefits = () => {
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

    return (
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
    );
};
