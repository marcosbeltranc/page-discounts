'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import PromotionTable from '@/components/promotions/PromotionTable';
import PromotionWizard from '@/components/promotions/PromotionWizard';

export default function PromotionsPage() {
    const [view, setView] = useState('list');
    const [promotions, setPromotions] = useState([]);
    const [editingPromotion, setEditingPromotion] = useState(null);

    // 1. Definimos la función de carga
    const fetchPromotions = async () => {
        try {
            const res = await api.get('/promotions');
            setPromotions(res.result || []);
        } catch (err) {
            console.error("Error al cargar promociones:", err);
        }
    };

    // 2. Ejecutamos la carga inicial
    useEffect(() => {
        fetchPromotions();
    }, []);

    // 3. Función de edición que soluciona el error
    const handleEdit = (promo) => {
        setEditingPromotion(promo);
        setView('edit');
    };

    return (
        <div className="max-w-7xl mx-auto">
            {view === 'list' ? (
                <div className="space-y-6">
                    <div className="flex justify-end">
                        {/* <h1 className="text-2xl font-bold">Promociones</h1> */}
                        <button
                            onClick={() => { setEditingPromotion(null); setView('edit'); }}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold"
                        >
                            + Nueva Promoción
                        </button>
                    </div>
                    <PromotionTable
                        promotions={promotions}
                        onRefresh={fetchPromotions}
                        onEdit={handleEdit}
                    />
                </div>
            ) : (
                <PromotionWizard
                    promotionData={editingPromotion}
                    onCancel={() => { setEditingPromotion(null); setView('list'); fetchPromotions(); }}
                    onFinish={() => { setEditingPromotion(null); setView('list'); fetchPromotions(); }}
                />
            )}
        </div>
    );
}