import { useState, useRef, useEffect } from 'react'
import { X, Send, Bot, User } from 'lucide-react'
import { drivers, trucks, routes, cargo, metrics } from '../data/mockData'
import ReactMarkdown from 'react-markdown'

const systemPrompt = `Eres FleetBot, el asistente de IA de FleetOps, una plataforma de gestion de flotas de camiones.

Tienes acceso a los siguientes datos en tiempo real:

CONDUCTORES: ${JSON.stringify(drivers)}
CAMIONES: ${JSON.stringify(trucks)}
RUTAS: ${JSON.stringify(routes)}
CARGAS: ${JSON.stringify(cargo)}
METRICAS: ${JSON.stringify(metrics)}

Tu rol es ayudar al administrador de flota a:
1. Consultar disponibilidad de conductores y camiones
2. Sugerir asignaciones optimas para rutas pendientes
3. Identificar problemas operativos
4. Proponer soluciones eficientes
5. Responder preguntas sobre el estado de la flota

Responde siempre en espanol, de forma concisa y util. Cuando sugieras asignaciones, explica el razonamiento. Usa emojis con moderacion.

FORMATO DE RESPUESTA:
- Nunca uses tablas markdown (no uses | ni ---)
- Usa listas con guiones para mostrar varios elementos
- Usa negrita para resaltar nombres y datos importantes
- Para asignaciones usa este formato:
  Ruta X a Y
  - Conductor: nombre (licencia, experiencia)
  - Camion: matricula (tipo, capacidad)
  - Motivo: explicacion breve`

export default function Chatbot({ onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hola! Soy FleetBot, tu asistente de operaciones. Puedo ayudarte a gestionar conductores, camiones, rutas y cargas. En que puedo ayudarte hoy?'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = { role: 'user', content: input }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const apiMessages = newMessages
        .filter((m, i) => !(i === 0 && m.role === 'assistant'))
        .map(m => ({ role: m.role, content: m.content }))

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:5173',
          'X-Title': 'FleetOps',
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-20b:free',
          messages: [
            { role: 'system', content: systemPrompt },
            ...apiMessages
          ],
          max_tokens: 800,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('OpenRouter error:', data)
        throw new Error(data.error?.message || 'Error en la API')
      }

      const text = data.choices?.[0]?.message?.content
      if (!text) throw new Error('Respuesta vacia')

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: text
      }])

    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Lo siento, ha ocurrido un error. Por favor intentalo de nuevo.'
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const suggestions = [
    '¿Qué conductores estan disponibles ahora?',
    '¿Qué rutas necesitan asignacion?',
    'Sugiere asignaciones para las rutas pendientes',
    '¿Hay algun problema operativo?',
  ]

  return (
    <div className="w-full h-full bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">

      <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <div className="text-white font-semibold">FleetBot</div>
            <div className="text-blue-200 text-xs">Asistente de operaciones IA</div>
          </div>
        </div>
        <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot size={16} className="text-blue-600" />
              </div>
            )}
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-tr-sm'
                : 'bg-gray-100 text-gray-800 rounded-tl-sm'
            }`}>
              {msg.role === 'assistant' ? (
                <ReactMarkdown
                  components={{
                    p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                    li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              ) : msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <User size={16} className="text-white" />
              </div>
            )}
          </div>
        ))}

        {messages.length === 1 && (
          <div className="mt-2">
            <div className="text-xs text-gray-400 mb-2 ml-11">Sugerencias:</div>
            <div className="flex flex-wrap gap-2 ml-11">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setInput(s)}
                  className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot size={16} className="text-blue-600" />
            </div>
            <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-100">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu consulta..."
            className="flex-1 text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white rounded-xl flex items-center justify-center transition-all"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
