const BrandLogo = ({ name }) => {
    // Map brand names to their respective logos or initials
    const getBrandLogo = (brandName) => {
        const logos = {
            'DLF': '🏢',
            'Lodha Group': '🏗️',
            'Prestige Group': '🏨',
            'Godrej Properties': '🌿',
            'Sobha Limited': '🏘️',
            'Brigade Group': '🏙️',
            'Tata Housing': '🏭',
            'Puravankara': '🏡'
        };
        return logos[brandName] || '🏠';
    };

    return (
        <div className="flex flex-col items-center justify-center p-2 md:p-4 group">
            <div className="text-3xl md:text-4xl mb-2 transition-transform duration-300 group-hover:scale-110">
                {getBrandLogo(name)}
            </div>
            <span className="text-sm md:text-base font-medium text-gray-700 text-center">{name}</span>
        </div>
    );
};

export const TrustedBrands = () => {
    // Sample brands with additional data
    const brands = [
        { id: 1, name: 'DLF' },
        { id: 2, name: 'Lodha Group' },
        { id: 3, name: 'Prestige Group' },
        { id: 4, name: 'Godrej Properties' },
        { id: 5, name: 'Sobha Limited' },
        { id: 6, name: 'Brigade Group' },
        { id: 7, name: 'Tata Housing' },
        { id: 8, name: 'Puravankara' }
    ];

    // Duplicate brands for seamless infinite scroll effect
    const duplicatedBrands = [...brands, ...brands];

    return (
        <section className="py-8 md:py-16 bg-gray-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8 md:mb-12">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-4">Trusted by Leading Communities</h2>
                    <p className="text-base md:text-lg text-gray-600">Join thousands of satisfied apartment communities worldwide</p>
                </div>

                {/* Infinite Scroll Container */}
                <div className="relative overflow-hidden py-6">
                    <div className="relative">
                        {/* First set of brands */}
                        <div className="flex animate-scroll">
                            {duplicatedBrands.map((brand) => (
                                <div
                                    key={`${brand.id}-1`}
                                    className="flex-shrink-0 px-2 sm:px-4 md:px-8"
                                >
                                    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 h-28 w-32 md:h-32 md:w-40 flex items-center justify-center">
                                        <BrandLogo name={brand.name} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Second set of brands (duplicate for seamless animation) */}
                        <div className="flex absolute top-0 left-full">
                            {duplicatedBrands.map((brand) => (
                                <div
                                    key={`${brand.id}-2`}
                                    className="flex-shrink-0 px-2 sm:px-4 md:px-8"
                                >
                                    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 h-28 w-32 md:h-32 md:w-40 flex items-center justify-center">
                                        <BrandLogo name={brand.name} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Gradient overlays for better visual effect */}
                    <div className="absolute top-0 left-0 w-24 h-full bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none"></div>
                </div>
            </div>

            <style jsx>{`
                @keyframes scroll {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-100%);
                    }
                }

                .animate-scroll {
                    display: flex;
                    width: max-content;
                    animation: scroll 40s linear infinite;
                    will-change: transform;
                }

                @media (max-width: 768px) {
                    .animate-scroll {
                        animation: scroll 50s linear infinite;
                    }
                }
                
                /* Smooth hover effect */
                .animate-scroll:hover {
                    animation-play-state: paused;
                }

                /* Remove the gap between the two sets */
                .animate-scroll + .absolute {
                    margin-left: 0;
                }
            `}</style>
        </section>
    );
};
