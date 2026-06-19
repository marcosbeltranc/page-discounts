export default function GroupListHeader({ onCreateClick, view }) {
    return (
        <div className="flex justify-between pb-5 border-b">
            <h1 className="text-xl font-bold">Grupos de Clientes</h1>
            {view === 'list' && <button onClick={onCreateClick} className="bg-indigo-600 text-white p-2 rounded-lg">Nuevo Grupo</button>}
        </div>
    );
}