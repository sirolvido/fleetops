import { AlertTriangle } from 'lucide-react'

export default function ConfirmModal({ title, message, onConfirm, onCancel, confirmText = 'Eliminar', confirmColor = 'bg-red-500 hover:bg-red-600' }) {
  return (
    <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:99999, padding:'24px'}}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <div>
            <div className="font-bold text-gray-800">{title}</div>
            <div className="text-sm text-gray-500 mt-0.5">{message}</div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 text-sm font-medium text-white px-4 py-2 rounded-lg transition-all ${confirmColor}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
