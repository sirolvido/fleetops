import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Drivers from './components/Drivers'
import Trucks from './components/Trucks'
import Routes from './components/Routes'
import Cargo from './components/Cargo'
import Chatbot from './components/Chatbot'

function App() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [chatbotOpen, setChatbotOpen] = useState(false)

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard': return <Dashboard />
      case 'drivers':   return <Drivers />
      case 'trucks':    return <Trucks />
      case 'routes':    return <Routes />
      case 'cargo':     return <Cargo />
      default:          return <Dashboard />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {renderSection()}
        </div>
      </main>

      {/* Botón chatbot */}
      <button
        onClick={() => setChatbotOpen(!chatbotOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center z-50 transition-all"
      >
        <span className="text-2xl">🤖</span>
      </button>

      {/* Panel chatbot */}
      {chatbotOpen && (
        <div className="fixed bottom-24 right-6 z-50">
          <Chatbot onClose={() => setChatbotOpen(false)} />
        </div>
      )}
    </div>
  )
}

export default App
