'use client';

export default function PromotionStepper({ currentStep }) {
    const steps = ['Info General', 'Reglas', 'Acciones'];

    return (
        <div className="flex justify-between mb-10 px-10">
            {steps.map((label, i) => (
                <div key={label} className={`flex flex-col items-center transition-colors duration-300 ${currentStep >= i + 1 ? 'text-indigo-600' : 'text-slate-300'
                    }`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 border-2 transition-all ${currentStep >= i + 1 ? 'border-indigo-600 bg-indigo-50 font-bold' : 'border-slate-200 bg-white'
                        }`}>
                        {i + 1}
                    </div>
                    <span className="text-xs font-bold uppercase">{label}</span>
                </div>
            ))}
        </div>
    );
}