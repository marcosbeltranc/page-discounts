'use client';
import { useState } from 'react';
import PromotionStepper from './PromotionStepper';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';

export default function PromotionWizard({ promotionData, onCancel, onFinish }) {
    // Si promotionData existe, el estado inicial es el paso 1 con los datos cargados.
    // promotionId se inicializa con el ID si estamos editando, o null si es nuevo.
    const [step, setStep] = useState(1);
    const [promotionId, setPromotionId] = useState(promotionData?.id || null);

    // Guarda los datos actualizados de la promoción (name, discount_amount,
    // discount_type, discount_limit, etc.) conforme el usuario avanza por el wizard.
    // Así Step2 y Step3 siempre reciben la info más reciente, no la original.
    const [wizardData, setWizardData] = useState(promotionData || null);

    return (
        <div className="bg-white p-8 rounded-2xl border border-slate-200">
            <PromotionStepper currentStep={step} />

            {/* Paso 1: Gestión de datos generales (Creación o Edición) */}
            {step === 1 && (
                <Step1
                    data={wizardData}
                    onNext={(id, updatedData) => {
                        setPromotionId(id);
                        setWizardData(updatedData);
                        setStep(2);
                    }}
                />
            )}

            {/* Paso 2: Configuración de Reglas (vinculado al promotionId) */}
            {step === 2 && (
                <Step2
                    data={wizardData}
                    promotionId={promotionId}
                    onNext={() => setStep(3)}
                />
            )}

            {/* Paso 3: Configuración de Acciones y finalización */}
            {step === 3 && (
                <Step3
                    data={wizardData}
                    promotionId={promotionId}
                    onFinish={onFinish}
                />
            )}

            {/* Botón de Cancelar para volver al listado */}
            <div className="mt-6">
                <button
                    onClick={onCancel}
                    className="w-full text-slate-500 text-sm hover:underline"
                >
                    Cancelar y volver al listado
                </button>
            </div>
        </div>
    );
}