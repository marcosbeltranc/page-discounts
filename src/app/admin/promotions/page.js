'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
    Tag, Plus, Edit2, Trash2, Calendar, CheckCircle2, XCircle,
    ArrowLeft, Loader2, ShieldAlert, Sliders, Gift, Trash, X
} from 'lucide-react';

export default function PromotionsPage() {
    const [view, setView] = useState('list');
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Estado auxiliar para escribir el SKU actual en el buscador de cada regla
    const [skuInputs, setSkuInputs] = useState({});

    const initialFormState = {
        id: '',
        nombre: '',
        descripcion: '',
        fecha_inicio: '',
        fecha_fin: '',
        limite_usos_total: '',
        monto_minimo_compra: '0.0000',
        prioridad: 10,
        activo: true,
        acumulable: false, // <-- Nueva propiedad de combinación
        restrictions: [],
        rules: [],
        actions: []
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        fetchPromotions();
    }, []);

    const fetchPromotions = async () => {
        setLoading(true);
        const response = await api.get('/promotions');
        if (!response.error) {
            setPromotions(Array.isArray(response.result) ? response.result : []);
        }
        setLoading(false);
    };

    const handleEditInit = async (id) => {
        setLoading(true);
        setErrorMsg('');
        const response = await api.get(`/promotions/${id}`);

        if (!response.error && response.result) {
            const promo = response.result;

            // Mapeamos los ítems planos de la base de datos de rules.items => array de strings
            const mappedRules = (promo.rules || []).map(r => ({
                tipo_disparador: r.tipo_disparador,
                valor_disparador: r.valor_disparador,
                cantidad_minima: r.cantidad_minima,
                cantidad_maxima: r.cantidad_maxima,
                items: r.items ? r.items.map(i => i.sku) : []
            }));

            setFormData({
                id: promo.id,
                nombre: promo.nombre,
                descripcion: promo.descripcion || '',
                fecha_inicio: promo.fecha_inicio ? promo.fecha_inicio.substring(0, 10) : '',
                fecha_fin: promo.fecha_fin ? promo.fecha_fin.substring(0, 10) : '',
                limite_usos_total: promo.limite_usos_total || '',
                monto_minimo_compra: promo.monto_minimo_compra || '0.0000',
                prioridad: promo.prioridad || 10,
                activo: promo.activo,
                acumulable: promo.acumulable ?? false,
                restrictions: promo.restrictions || [],
                rules: mappedRules,
                actions: promo.actions || []
            });
            setView('edit');
        } else {
            alert('No se pudieron obtener las relaciones dinámicas de SAP de esta promoción.');
        }
        setLoading(false);
    };

    const handleAddInit = () => {
        setFormData(initialFormState);
        setErrorMsg('');
        setView('add');
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        setErrorMsg('');

        const endpoint = view === 'add' ? '/promotions/create' : `/promotions/update/${formData.id}`;
        const method = view === 'add' ? api.post : api.put;

        const response = await method(endpoint, formData);

        if (!response.error) {
            await fetchPromotions();
            setView('list');
        } else {
            setErrorMsg(response.result || 'Ocurrió un error al procesar el guardado estructural.');
            setActionLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Deseas dar de baja esta campaña? Se borrarán sus agrupaciones de SAP asociadas.')) return;
        const response = await api.delete(`/promotions/delete/${id}`);
        if (!response.error) fetchPromotions();
    };

    // --- AGREGAR PRODUCTOS EN VIVO A UNA REGLA ---
    const addSkuToRule = (ruleIndex) => {
        const currentSku = skuInputs[ruleIndex]?.trim().toUpperCase();
        if (!currentSku) return;

        const updatedRules = [...formData.rules];
        const currentItems = updatedRules[ruleIndex].items || [];

        if (!currentItems.includes(currentSku)) {
            updatedRules[ruleIndex].items = [...currentItems, currentSku];
            setFormData({ ...formData, rules: updatedRules });
        }

        // Limpiar el buscador de esa regla específica
        setSkuInputs({ ...skuInputs, [ruleIndex]: '' });
    };

    const removeSkuFromRule = (ruleIndex, skuToRemove) => {
        const updatedRules = [...formData.rules];
        updatedRules[ruleIndex].items = updatedRules[ruleIndex].items.filter(sku => sku !== skuToRemove);
        setFormData({ ...formData, rules: updatedRules });
    };

    // --- MANEJO GENERAL DINÁMICO ---
    const addRestriction = () => {
        setFormData({ ...formData, restrictions: [...formData.restrictions, { tipo_restriccion: 'tipo_usuario', valor_restriccion: 'medico' }] });
    };
    const removeRestriction = (index) => {
        setFormData({ ...formData, restrictions: formData.restrictions.filter((_, i) => i !== index) });
    };

    const addRule = () => {
        setFormData({
            ...formData,
            rules: [...formData.rules, { tipo_disparador: 'grupo_custom', valor_disparador: 'Colección Ad-Hoc', cantidad_minima: 1, cantidad_maxima: null, items: [] }]
        });
    };
    const removeRule = (index) => {
        setFormData({ ...formData, rules: formData.rules.filter((_, i) => i !== index) });
    };
    const updateRule = (index, field, value) => {
        const updated = [...formData.rules];
        updated[index][field] = value;
        setFormData({ ...formData, rules: updated });
    };

    const addAction = () => {
        setFormData({ ...formData, actions: [...formData.actions, { tipo_accion: 'regalo_otro_producto', valor_accion: '1.0000', sku_regalo: '' }] });
    };
    const removeAction = (index) => {
        setFormData({ ...formData, actions: formData.actions.filter((_, i) => i !== index) });
    };
    const updateAction = (index, field, value) => {
        const updated = [...formData.actions];
        updated[index][field] = value;
        setFormData({ ...formData, actions: updated });
    };

    return (
        <div className="space-y-6">
            {/* VISTA 1: TABLA GENERAL */}
            {view === 'list' && (
                <>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Promociones Matrix</h1>
                            <p className="text-sm text-slate-400">Panel de Control Inteligente ERP SAP & Multi-Inquilino.</p>
                        </div>
                        <button onClick={handleAddInit} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all">
                            <Plus size={16} /> Nueva Promoción
                        </button>
                    </div>

                    {loading ? (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center text-slate-400">
                            <Loader2 className="animate-spin text-indigo-500 mb-2" size={32} />
                            <p className="text-sm">Abriendo base de datos...</p>
                        </div>
                    ) : (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                            <table className="w-full text-left text-sm text-slate-300">
                                <thead className="bg-slate-950 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                                    <tr>
                                        <th className="p-4 pl-6">Campaña Comercial</th>
                                        <th className="p-4 text-center">Combinable</th>
                                        <th className="p-4 text-center">Triggers</th>
                                        <th className="p-4 text-center">Acciones</th>
                                        <th className="p-4">Estado</th>
                                        <th className="p-4 text-right pr-6">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60">
                                    {promotions.map((promo) => (
                                        <tr key={promo.id} className="hover:bg-slate-800/20 transition-colors">
                                            <td className="p-4 pl-6">
                                                <div className="font-bold text-white">{promo.nombre}</div>
                                                <div className="text-xs text-slate-400 max-w-md truncate">{promo.descripcion || 'Sin descripción'}</div>
                                            </td>
                                            <td className="p-4 text-center">
                                                {promo.acumulable ? (
                                                    <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">Sí</span>
                                                ) : (
                                                    <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold">Exclusiva</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center">{promo.rules_count || 0}</td>
                                            <td className="p-4 text-center">{promo.actions_count || 0}</td>
                                            <td className="p-4">
                                                {promo.activo ? (
                                                    <span className="text-emerald-400 text-xs font-bold">Activa</span>
                                                ) : (
                                                    <span className="text-slate-500 text-xs font-bold">Pausada</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right pr-6">
                                                <div className="flex justify-end gap-1">
                                                    <button onClick={() => handleEditInit(promo.id)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"><Edit2 size={16} /></button>
                                                    <button onClick={() => handleDelete(promo.id)} className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {/* VISTA 2: EDICIÓN / AGREGAR PANTALLA COMPLETA */}
            {(view === 'add' || view === 'edit') && (
                <div className="max-w-5xl mx-auto space-y-6">
                    <button onClick={() => setView('list')} className="flex items-center gap-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-sm">
                        <ArrowLeft size={16} /> Salir al Tablero
                    </button>

                    {errorMsg && <div className="rounded-xl bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20">{errorMsg}</div>}

                    <form onSubmit={handleSave} className="space-y-8">
                        {/* PARAMETROS CABECERA */}
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">Metadatos Generales</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nombre Comercial de la Promoción</label>
                                    <input type="text" required value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-white focus:outline-none focus:border-indigo-500 text-sm" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Leyenda en Carrito / Checkout</label>
                                    <textarea rows={2} value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-white focus:outline-none focus:border-indigo-500 text-sm resize-none" />
                                </div>
                                <div><label className="block text-xs font-bold text-slate-400 uppercase mb-2">Vigencia Desde</label><input type="date" required value={formData.fecha_inicio} onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })} className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-white text-sm" /></div>
                                <div><label className="block text-xs font-bold text-slate-400 uppercase mb-2">Vigencia Hasta</label><input type="date" required value={formData.fecha_fin} onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })} className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-white text-sm" /></div>
                            </div>
                        </div>

                        {/* REGLAS DISPARADORAS CON SELECTOR VISUAL DE PRODUCTOS */}
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                                    <Sliders size={16} /> Disparadores y Colecciones Dinámicas SAP
                                </h3>
                                <button type="button" onClick={addRule} className="flex items-center gap-1 text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg hover:bg-indigo-500/20">
                                    <Plus size={14} /> Crear Condición
                                </button>
                            </div>

                            <div className="space-y-6">
                                {formData.rules.map((rule, idx) => (
                                    <div key={idx} className="bg-slate-950 p-5 border border-slate-850 rounded-xl space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                            <div className="md:col-span-4">
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Alcance / Regla</label>
                                                <select value={rule.tipo_disparador} onChange={(e) => updateRule(idx, 'tipo_disparador', e.target.value)} className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2 text-white text-xs">
                                                    <option value="grupo_custom">Grupo Dinámico (Múltiples SKUs SAP)</option>
                                                    <option value="producto_especifico">Producto Específico Único</option>
                                                    <option value="marca">Marca Comercial Completa</option>
                                                </select>
                                            </div>
                                            <div className="md:col-span-4">
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Identificador / Nombre Grupo</label>
                                                <input type="text" required value={rule.valor_disparador} onChange={(e) => updateRule(idx, 'valor_disparador', e.target.value)} placeholder="Ej: SAP_DESOWEN_CREMA o Galderma" className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2 text-white text-xs" />
                                            </div>
                                            <div className="md:col-span-3">
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Cant. Mínima Requerida</label>
                                                <input type="number" required min="1" value={rule.cantidad_minima} onChange={(e) => updateRule(idx, 'cantidad_minima', parseInt(e.target.value) || 1)} className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2 text-white text-xs font-bold" />
                                            </div>
                                            <div className="md:col-span-1 text-right">
                                                <button type="button" onClick={() => removeRule(idx)} className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10"><Trash size={14} /></button>
                                            </div>
                                        </div>

                                        {/* BUSCADOR Y LISTADO DE PRODUCTOS ASOCIADOS A LA REGLA */}
                                        {(rule.tipo_disparador === 'grupo_custom' || rule.tipo_disparador === 'marca') && (
                                            <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800/80 space-y-3">
                                                <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-wide">Asociar Productos de SAP a esta condición:</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={skuInputs[idx] || ''}
                                                        onChange={(e) => setSkuInputs({ ...skuInputs, [idx]: e.target.value })}
                                                        placeholder="Escribe o escanea el SKU de SAP (Ej: SAP_DESOWEN_CREMA)"
                                                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkuToRule(idx); } }}
                                                    />
                                                    <button type="button" onClick={() => addSkuToRule(idx)} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all">
                                                        Vincular
                                                    </button>
                                                </div>

                                                {/* Grid de etiquetas de SKUs vinculados */}
                                                <div className="flex flex-wrap gap-1.5 pt-1">
                                                    {(rule.items || []).length === 0 ? (
                                                        <span className="text-slate-500 text-xs italic">Ningún ítem vinculado aún. La regla no se disparará.</span>
                                                    ) : (
                                                        rule.items.map((sku) => (
                                                            <span key={sku} className="inline-flex items-center gap-1 bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono px-2 py-1 rounded-md">
                                                                {sku}
                                                                <button type="button" onClick={() => removeSkuFromRule(idx, sku)} className="text-slate-500 hover:text-rose-400 ml-0.5">
                                                                    <X size={12} />
                                                                </button>
                                                            </span>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ACCIONES DE RECOMPENSA */}
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                                    <Gift size={16} /> Beneficios Otorgados
                                </h3>
                                <button type="button" onClick={addAction} className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg hover:bg-emerald-500/20">
                                    <Plus size={14} /> Añadir Beneficio
                                </button>
                            </div>
                            <div className="space-y-4">
                                {formData.actions.map((act, idx) => (
                                    <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-950 p-4 border border-slate-850 rounded-xl items-end">
                                        <div className="md:col-span-4">
                                            <select value={act.tipo_accion} onChange={(e) => updateAction(idx, 'tipo_accion', e.target.value)} className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2 text-white text-xs">
                                                <option value="regalo_otro_producto">Regalar Muestra Comercial (Local)</option>
                                                <option value="descuento_porcentaje">Porcentaje de Descuento (% OFF)</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-4">
                                            <input type="text" required value={act.valor_accion} onChange={(e) => updateAction(idx, 'valor_accion', e.target.value)} placeholder="Ej: 3.0000 o 15.0000" className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2 text-white text-xs font-bold" />
                                        </div>
                                        <div className="md:col-span-3">
                                            <input type="text" disabled={act.tipo_accion !== 'regalo_otro_producto'} required={act.tipo_accion === 'regalo_otro_producto'} value={act.sku_regalo || ''} onChange={(e) => updateAction(idx, 'sku_regalo', e.target.value.toUpperCase())} placeholder="SKU de Regalo" className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2 text-white text-xs font-mono disabled:opacity-40" />
                                        </div>
                                        <div className="md:col-span-1 text-right">
                                            <button type="button" onClick={() => removeAction(idx)} className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10"><Trash size={14} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CONTROLES DE COMBINACIÓN Y ESTADO */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
                                <input type="checkbox" id="acumulable" checked={formData.acumulable} onChange={(e) => setFormData({ ...formData, acumulable: e.target.checked })} className="w-4 h-4 text-indigo-600 border-slate-800 bg-slate-950 rounded focus:ring-indigo-500" />
                                <label htmlFor="acumulable" className="text-sm font-semibold text-slate-300 cursor-pointer select-none">
                                    Esta promoción **es combinable** con otras campañas vigentes en el carrito.
                                </label>
                            </div>
                            <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
                                <input type="checkbox" id="activo" checked={formData.activo} onChange={(e) => setFormData({ ...formData, activo: e.target.checked })} className="w-4 h-4 text-indigo-600 border-slate-800 bg-slate-950 rounded focus:ring-indigo-500" />
                                <label htmlFor="activo" className="text-sm font-semibold text-slate-300 cursor-pointer select-none">
                                    Habilitar regla inmediatamente en producción.
                                </label>
                            </div>
                        </div>

                        {/* BOTTOM ACTIONS */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                            <button type="button" onClick={() => setView('list')} className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 py-2.5 rounded-xl text-sm font-medium transition-all">Cancelar</button>
                            <button type="submit" disabled={actionLoading} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50">
                                {actionLoading && <Loader2 className="animate-spin" size={16} />}
                                {view === 'add' ? 'Crear Promoción' : 'Guardar Cambios Estructurados'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}