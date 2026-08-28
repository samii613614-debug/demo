import React, { useState } from 'react';
import { HelpCircle, X, Phone, Send, Bot } from 'lucide-react';

interface FloatingSupportProps {
  onOpenLocationModal?: () => void;
  onOpenAccountModal?: () => void;
}

export const FloatingSupport: React.FC<FloatingSupportProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'options' | 'chat'>('options');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string }>>([
    { sender: 'bot', text: 'Welcome to DEMO COMPANY Customer service. How can I assist you today?' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');

    // Instant helpful assistant responses for product queries
    setTimeout(() => {
      let botResponse = "Thank you for contacting DEMO COMPANY! For urgent support or custom quotation, our national helpline 12345 or 123456789 is active 10 AM to 8 PM.";
      const lower = userText.toLowerCase();
      
      if (lower.includes('ac') || lower.includes('air conditioner') || lower.includes('cool')) {
        botResponse = "DEMO COMPANY Mega Cool & Diamond series ACs come with up to 10 Years Compressor Warranty, 70% energy-saving dual inverter, and Free Nationwide Delivery.";
      } else if (lower.includes('fridge') || lower.includes('refrigerator')) {
        botResponse = "DEMO COMPANY Non-Frost and Direct-Cool Refrigerators feature 12 Years Compressor Warranty and Twin Cooling Plus technology to keep food fresh for up to 21 days.";
      } else if (lower.includes('emi') || lower.includes('installment')) {
        botResponse = "0% Interest EMI is available for up to 12 months with 26+ Bangladeshi partner banks on products above ৳10,000.";
      } else if (lower.includes('delivery') || lower.includes('location')) {
        botResponse = "We deliver across all 64 districts in Bangladesh! Same-day or 24-48 hour delivery is fulfilled from your nearest DEMO COMPANY branch.";
      } else if (lower.includes('warranty')) {
        botResponse = "All products purchased on DEMO COMPANY come with official warranty backed by over 80+ Service Centers nationwide.";
      }

      setChatMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
    }, 600);
  };

  return (
    <>
      {/* Floating Dark Circle with Question Mark */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-14 md:bottom-2 right-2 sm:right-3 z-40 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#1b2b46] hover:bg-[#002663] text-white shadow-xl flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95 border-2 border-white/20 group"
        aria-label="DEMO COMPANY Help and Support"
        title="DEMO COMPANY Help"
      >
        <HelpCircle className="w-5 h-5 text-slate-100 group-hover:rotate-12 transition-transform" />
      </button>

      {/* Support Modal / Popup */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end p-2 sm:p-6 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-sm sm:max-w-md rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-slide-up">
            
            {/* Header */}
            <div className="bg-[#003893] text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-sky-200" />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">DEMO COMPANY Help Center</h3>
                  <p className="text-xs text-sky-200 flex items-center gap-1 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Customer Care Online (10 AM to 8 PM)
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Tabs */}
            <div className="flex border-b border-slate-100 bg-slate-50 text-xs font-semibold">
              <button 
                onClick={() => setActiveTab('options')}
                className={`flex-1 py-2.5 text-center border-b-2 cursor-pointer transition-colors ${
                  activeTab === 'options' ? 'border-[#003893] text-[#003893] bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Quick Services
              </button>
              <button 
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-2.5 text-center border-b-2 cursor-pointer transition-colors ${
                  activeTab === 'chat' ? 'border-[#003893] text-[#003893] bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Live Assistant
              </button>
            </div>

            {/* Body */}
            <div className="p-4 flex-1 overflow-y-auto space-y-3">
              
              {/* Quick Services Tab */}
              {activeTab === 'options' && (
                <div className="space-y-2.5">
                  <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 flex items-start space-x-3">
                    <div className="p-2 bg-[#003893] text-white rounded-lg">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">National Call Center Hotlines</h4>
                      <p className="text-xs text-slate-600 mt-0.5">Available 10 AM to 8 PM from any operator</p>
                      <div className="flex gap-2 mt-2">
                        <a 
                          href="tel:12345" 
                          className="bg-white border border-sky-300 text-[#003893] font-bold text-xs px-2.5 py-1 rounded-md hover:bg-sky-100 transition-colors inline-block"
                        >
                          📞 12345
                        </a>
                        <a 
                          href="tel:123456789" 
                          className="bg-white border border-sky-300 text-[#003893] font-bold text-xs px-2.5 py-1 rounded-md hover:bg-sky-100 transition-colors inline-block"
                        >
                          📞 123456789
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Live Chat Tab */}
              {activeTab === 'chat' && (
                <div className="flex flex-col h-64">
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
                    {chatMessages.map((msg, i) => (
                      <div 
                        key={i} 
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[85%] rounded-xl p-2.5 leading-relaxed ${
                            msg.sender === 'user' 
                              ? 'bg-[#003893] text-white rounded-br-none' 
                              : 'bg-slate-100 text-slate-800 rounded-bl-none'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendMessage} className="mt-2 flex gap-1.5 pt-2 border-t border-slate-100">
                    <input 
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask about AC, fridge, TV, orders..."
                      className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#003893]"
                    />
                    <button 
                      type="submit"
                      className="bg-[#003893] text-white p-2 rounded-lg hover:bg-[#002663] cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
};
