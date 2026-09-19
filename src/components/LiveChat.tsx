import React, { useState } from 'react';
import { MessageSquare, X, Send, PhoneCall, Sparkles, UserCheck, Ruler } from 'lucide-react';
import { STORE_PHONE, STORE_PHONE_RAW } from '../data/mockData';
import { ChatMessage, OperatorConfig } from '../types';
import { User } from 'firebase/auth';

interface LiveChatProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  currentUser?: User | null;
  operator?: OperatorConfig;
}

export const LiveChat: React.FC<LiveChatProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  currentUser,
  operator,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [heightInput, setHeightInput] = useState('170');
  const [weightInput, setWeightInput] = useState('77');

  if (!isOpen) return null;

  const operatorName = operator?.name || 'Jacob';
  const operatorTitle = operator?.title || "Rasmiy do'kon operatori";
  const avatarUrl = operator?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';

  const handleSend = () => {
    if (!inputVal.trim()) return;
    onSendMessage(inputVal.trim());
    setInputVal('');
  };

  const handleCalculateFromInputs = () => {
    const h = parseInt(heightInput);
    const w = parseInt(weightInput);
    if (!h || !w) return;
    const msg = `Mening bo'yim ${h} sm, vaznim ${w} kg. Qaysi razmer to'g'ri keladi?`;
    onSendMessage(msg);
    setIsCalculatorOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center sm:items-end justify-center sm:justify-end p-3 sm:p-6 bg-black/60 sm:bg-transparent pointer-events-none">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:w-96 bg-white rounded-3xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col h-[520px] max-h-[88vh] pointer-events-auto"
      >
        {/* Header with Operator Jacob */}
        <div className="px-4 py-3 bg-black text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <img
                src={avatarUrl}
                alt={operatorName}
                className="w-9 h-9 rounded-full object-cover border-2 border-emerald-400"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-black" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider block">Operator {operatorName}</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">Online</span>
              </div>
              <span className="text-[10px] text-zinc-400 block truncate max-w-[190px]">{operatorTitle}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsCalculatorOpen(!isCalculatorOpen)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isCalculatorOpen ? 'bg-white/20 text-white' : 'text-zinc-400 hover:text-white'
              }`}
              title="Razmer hisoblagich"
            >
              <Ruler className="w-4 h-4" />
            </button>
            <a
              href={`tel:${STORE_PHONE_RAW}`}
              className="p-1.5 text-zinc-400 hover:text-white transition-colors"
              title="Qo'ng'iroq"
            >
              <PhoneCall className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Size Calculator Drawer inside Chat */}
        {isCalculatorOpen && (
          <div className="p-3 bg-zinc-900 text-white border-b border-zinc-800 shrink-0 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5 text-zinc-200">
                <Ruler className="w-3.5 h-3.5 text-emerald-400" />
                <span>Jacobdan razmer tavsiyasi:</span>
              </span>
              <button
                type="button"
                onClick={() => setIsCalculatorOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-zinc-400 block mb-0.5">Bo'y (sm):</label>
                <input
                  type="number"
                  value={heightInput}
                  onChange={(e) => setHeightInput(e.target.value)}
                  placeholder="170"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-xs outline-none focus:border-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-400 block mb-0.5">Vazn (kg):</label>
                <input
                  type="number"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  placeholder="77"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-xs outline-none focus:border-white"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleCalculateFromInputs}
              className="w-full py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs cursor-pointer transition-colors"
            >
              Razmerimni so'rash (Jacob aniqlab beradi)
            </button>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50/50 text-xs">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                {!isUser && (
                  <span className="text-[10px] font-bold text-zinc-500 mb-0.5 px-1 flex items-center gap-1">
                    <span>{operatorName}</span>
                    <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                  </span>
                )}
                <div
                  className={`max-w-[85%] p-3 rounded-2xl leading-relaxed text-xs ${
                    isUser
                      ? 'bg-black text-white rounded-tr-xs'
                      : 'bg-white text-black border border-zinc-200 rounded-tl-xs shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                </div>
                <span className="text-[9px] text-zinc-400 font-mono mt-0.5 px-1">{m.time}</span>
              </div>
            );
          })}
        </div>

        {/* Quick Question Chips */}
        <div className="px-3 py-1.5 bg-zinc-100/70 border-t border-zinc-200 flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0">
          <button
            type="button"
            onClick={() => onSendMessage("Mening bo'yim 170 sm, vaznim 77 kg. Qaysi razmer to'g'ri keladi?")}
            className="px-2.5 py-1 rounded-full bg-white border border-zinc-300 hover:border-black text-zinc-800 shrink-0 cursor-pointer transition-colors"
          >
            170 sm & 77 kg (2XL)
          </button>
          <button
            type="button"
            onClick={() => onSendMessage("Razmer tanlashda yordam bera olasizmi?")}
            className="px-2.5 py-1 rounded-full bg-white border border-zinc-300 hover:border-black text-zinc-800 shrink-0 cursor-pointer transition-colors"
          >
            Razmer qanday tanlanadi?
          </button>
          <button
            type="button"
            onClick={() => onSendMessage("Buyurtma Toshkentga qancha vaqtda keladi?")}
            className="px-2.5 py-1 rounded-full bg-white border border-zinc-300 hover:border-black text-zinc-800 shrink-0 cursor-pointer transition-colors"
          >
            Yetkazib berish
          </button>
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-white border-t border-zinc-200 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={`${operatorName}ga yozing (masalan: 170 sm, 77 kg)...`}
            className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-100 border border-zinc-200 text-xs text-black outline-none focus:bg-white focus:border-black"
          />
          <button
            type="submit"
            disabled={!inputVal.trim()}
            className="p-2.5 rounded-xl bg-black hover:bg-zinc-800 disabled:opacity-40 text-white cursor-pointer transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
