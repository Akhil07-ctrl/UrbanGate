export const TrustedBrands = () => {
    // Sample brands - duplicated for seamless infinite scroll
    const brands = [
        "DLF",
        "Lodha Group",
        "Prestige Group",
        "Godrej Properties",
        "Sobha Limited",
        "Brigade Group",
        "Tata Housing",
        "Puravankara"
    ];


    // Duplicate brands multiple times for seamless scrolling
    const duplicatedBrands = [...brands, ...brands, ...brands, ...brands];

    return (
        <section className="py-16 bg-gray-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Leading Communities</h2>
                    <p className="text-lg text-gray-600">Join thousands of satisfied apartment communities worldwide</p>
                </div>

                {/* Infinite Scroll Container */}
                <div className="relative overflow-hidden">
                    <div className="flex animate-scroll">
                        {duplicatedBrands.map((brand, index) => (
                            <div
                                key={index}
                                className="flex-shrink-0 mx-12 text-2xl font-semibold text-gray-700 whitespace-nowrap"
                            >
                                {brand}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 5s linear infinite;
        }
      `}</style>
        </section>
    );
};
