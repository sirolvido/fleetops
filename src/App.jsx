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
        onClick={() => setChatbotOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center z-50 transition-all"
        title="Abrir FleetBot"
      >
        <span className="text-2xl">🤖</span>
      </button>

      {/* Modal chatbot */}
      {chatbotOpen && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, padding:'24px'}}>
          <div style={{width:'80vw', height:'85vh', maxWidth:'1200px'}}>
            <Chatbot onClose={() => setChatbotOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
export default App