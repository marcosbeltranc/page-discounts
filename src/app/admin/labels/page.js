'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import LabelTable from '@/components/labels/LabelTable';
import LabelForm from '@/components/labels/LabelForm';

export default function LabelsPage() {
    const [view, setView] = useState('list');
    const [labels, setLabels] = useState([]);
    const [editingLabel, setEditingLabel] = useState(null);

    const fetchLabels = async () => {
        try {
            const res = await api.get('/labels');
            setLabels(res.result || []);
        } catch (err) {
            console.error("Error al cargar etiquetas:", err);
        }
    };

    useEffect(() => {
        fetchLabels();
    }, []);

    const handleEdit = (label) => {
        setEditingLabel(label);
        setView('edit');
    };

    return (
        <div className="max-w-7xl mx-auto">
            {view === 'list' ? (
                <div className="space-y-6">
                    <div className="flex justify-end">
                        <button
                            onClick={() => { setEditingLabel(null); setView('edit'); }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition cursor-pointer"
                        >
                            + Nueva Etiqueta
                        </button>
                    </div>
                    <LabelTable
                        labels={labels}
                        onRefresh={fetchLabels}
                        onEdit={handleEdit}
                    />
                </div>
            ) : (
                <LabelForm
                    labelData={editingLabel}
                    onCancel={() => { setEditingLabel(null); setView('list'); fetchLabels(); }}
                    onFinish={() => { setEditingLabel(null); setView('list'); fetchLabels(); }}
                />
            )}
        </div>
    );
}