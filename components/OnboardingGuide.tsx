import React, { useState } from 'react';
import { InstagramIcon, SparklesIcon } from './common/icons';

interface OnboardingGuideProps {
    onComplete: () => void;
}

const TOUR_STEPS = [
    {
        title: "Welcome to InstaGrowth AI Toolkit!",
        content: "This quick tour will walk you through the key features to help you get started on enhancing your Instagram strategy."
    },
    {
        title: "1. Configure Your API Key",
        content: "To fetch live Instagram data for user analysis, competitor research, and more, you need to add your RapidAPI key. You can get a free one from the link provided. This is the most important step!"
    },
    {
        title: "2. Explore the Toolkit",
        content: "The sidebar on the left is your main navigation. Here you can switch between all the powerful tools, from analyzing user profiles to generating content ideas."
    },
    {
        title: "3. Main Analysis Tools",
        content: "Start with 'User Analysis' or 'Competitor Analysis'. Just enter a username to get detailed stats and insights. The AI-powered analysis gives you a strategic edge."
    },
    {
        title: "4. AI Content Tools",
        content: "Stuck for ideas? Use the 'AI Content Ideas', 'AI Hashtag Generator', or 'AI Hook Creator' to generate engaging content tailored to your niche."
    },
    {
        title: "You're All Set!",
        content: "That's it! You're ready to dive in and start growing your Instagram presence. Click 'Finish' to close this guide."
    }
];

const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < TOUR_STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete();
        }
    };
    
    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };
    
    const step = TOUR_STEPS[currentStep];

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-gradient-to-br from-gray-800 to-[#1a2035] rounded-2xl p-8 shadow-2xl border border-gray-700/50 max-w-lg w-full text-center">
                <div className="flex justify-center items-center space-x-3 mb-6">
                    <SparklesIcon className="w-10 h-10 text-indigo-400" />
                    <h2 className="text-2xl font-bold text-white">{step.title}</h2>
                </div>
                <p className="text-gray-300 mb-8 min-h-[60px]">{step.content}</p>

                <div className="flex justify-center items-center gap-3 mb-8">
                    {TOUR_STEPS.map((_, index) => (
                        <div 
                            key={index}
                            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                                currentStep === index ? 'bg-indigo-500 scale-125' : 'bg-gray-600'
                            }`}
                        />
                    ))}
                </div>

                <div className="flex items-center justify-between gap-4">
                    <button onClick={onComplete} className="text-sm text-gray-400 hover:text-white transition-colors">Skip</button>
                    <div className="flex items-center gap-4">
                        {currentStep > 0 && (
                             <button onClick={handlePrev} className="px-5 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors">
                                Previous
                            </button>
                        )}
                        <button 
                            onClick={handleNext} 
                            className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-700 transition-colors"
                        >
                            {currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingGuide;