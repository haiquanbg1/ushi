import { Plus, Pencil, Trash2 } from 'lucide-react';
import IconBtn from './IconBtn';
import { Th, Td } from './Table';

function CrudList({ title, columns, rows }) {
    return (
        <section className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
                <button className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm hover:bg-slate-800">
                    <Plus className="size-4" /> Add {title.replace(/s$/, '')}
                </button>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="min-w-full text-sm">
                    <thead className="bg-slate-900 text-slate-300">
                        <tr>
                            {columns.map((c) => <Th key={c}>{c}</Th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r, i) => (
                            <tr key={i} className="border-t border-slate-800">
                                {r.map((cell, j) => <Td key={j}>{cell}</Td>)}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

export default CrudList;