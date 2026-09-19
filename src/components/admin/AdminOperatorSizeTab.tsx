import React, { useState } from 'react';
import {
  UserCheck,
  Ruler,
  Plus,
  Trash2,
  Edit2,
  Check,
  Sparkles,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Play,
} from 'lucide-react';
import { OperatorConfig, SizeRuleConfig } from '../../types';
import { DEFAULT_OPERATOR_CONFIG } from '../../data/mockData';
import { generateJacobAdvice, findBestSizeRule } from '../../utils/sizeAdvisor';

interface AdminOperatorSizeTabProps {
  operatorConfig?: OperatorConfig;
  onUpdateOperatorConfig?: (config: OperatorConfig) => void;
}

export const AdminOperatorSizeTab: React.FC<AdminOperatorSizeTabProps> = ({
  operatorConfig = DEFAULT_OPERATOR_CONFIG,
  onUpdateOperatorConfig,
}) => {
  // Operator profile fields
  const [name, setName] = useState(operatorConfig.name || 'Jacob');
  const [title, setTitle] = useState(operatorConfig.title || "Rasmiy do'kon operatori & Razmer maslahatchisi");
  const [avatarUrl, setAvatarUrl] = useState(operatorConfig.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80');
  const [welcomeMessage, setWelcomeMessage] = useState(operatorConfig.welcomeMessage || "Salom! Men sizning shaxsiy operatoringiz Jacobman...");

  // Size rules list
  const [sizeRules, setSizeRules] = useState<SizeRuleConfig[]>(operatorConfig.sizeRules || []);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New size rule form state
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

  const [formSize, setFormSize] = useState('2XL');
  const [formMinHeight, setFormMinHeight] = useState('170');
  const [formMaxHeight, setFormMaxHeight] = useState('190');
  const [formMinWeight, setFormMinWeight] = useState('77');
  const [formMaxWeight, setFormMaxWeight] = useState('105');
  const [formNote, setFormNote] = useState("170 sm va 77 kg uchun juda qulay oversize razmer, erkin harakatlanish uchun eng to'g'ri tanlov.");
  const [formCategory, setFormCategory] = useState<'apparel' | 'shoes'>('apparel');

  // Jacob Simulator state
  const [simHeight, setSimHeight] = useState('170');
  const [simWeight, setSimWeight] = useState('77');
  const [simResult, setSimResult] = useState<string | null>(null);

  // Handle Save All to Parent & LocalStorage
  const handleSaveAll = () => {
    const updated: OperatorConfig = {
      ...operatorConfig,
      name,
      title,
      avatarUrl,
      welcomeMessage,
      sizeRules,
    };

    if (onUpdateOperatorConfig) {
      onUpdateOperatorConfig(updated);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Add or update size rule
  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    const minH = parseInt(formMinHeight) || 160;
    const maxH = parseInt(formMaxHeight) || 185;
    const minW = parseInt(formMinWeight) || 50;
    const maxW = parseInt(formMaxWeight) || 90;

    const ruleData: SizeRuleConfig = {
      id: editingRuleId || `rule-${Date.now()}`,
      size: formSize.trim().toUpperCase(),
      minHeight: minH,
      maxHeight: maxH,
      minWeight: minW,
      maxWeight: maxW,
      heightRange: `${minH} – ${maxH} sm`,
      weightRange: `${minW} – ${maxW} kg`,
      recommendationNote: formNote.trim(),
      category: formCategory,
    };

    let updatedRules: SizeRuleConfig[];
    if (editingRuleId) {
      updatedRules = sizeRules.map((r) => (r.id === editingRuleId ? ruleData : r));
    } else {
      updatedRules = [...sizeRules, ruleData];
    }

    setSizeRules(updatedRules);
    setIsAddingRule(false);
    setEditingRuleId(null);

    // Auto update parent
    if (onUpdateOperatorConfig) {
      onUpdateOperatorConfig({
        ...operatorConfig,
        name,
        title,
        avatarUrl,
        welcomeMessage,
        sizeRules: updatedRules,
      });
    }
  };

  const handleEditRule = (rule: SizeRuleConfig) => {
    setEditingRuleId(rule.id);
    setFormSize(rule.size);
    setFormMinHeight(String(rule.minHeight));
    setFormMaxHeight(String(rule.maxHeight));
    setFormMinWeight(String(rule.minWeight));
    setFormMaxWeight(String(rule.maxWeight));
    setFormNote(rule.recommendationNote);
    setFormCategory(rule.category || 'apparel');
    setIsAddingRule(true);
  };

  const handleDeleteRule = (id: string) => {
    const updated = sizeRules.filter((r) => r.id !== id);
    setSizeRules(updated);
    if (onUpdateOperatorConfig) {
      onUpdateOperatorConfig({
        ...operatorConfig,
        name,
        title,
        avatarUrl,
        welcomeMessage,
        sizeRules: updated,
      });
    }
  };

  const handleResetDefaultRules = () => {
    if (window.confirm("Barcha razmer qoidalarini standart holatga qaytarmoqchimisiz?")) {
      const defaults = DEFAULT_OPERATOR_CONFIG.sizeRules || [];
      setSizeRules(defaults);
      if (onUpdateOperatorConfig) {
        onUpdateOperatorConfig({
          ...operatorConfig,
          name,
          title,
          avatarUrl,
          welcomeMessage,
          sizeRules: defaults,
        });
      }
    }
  };

  // Run live simulation
  const handleTestSimulator = (hStr: string = simHeight, wStr: string = simWeight) => {
    const h = parseInt(hStr);
    const w = parseInt(wStr);
    if (!h || !w) {
      setSimResult("Iltimos, haqiqiy bo'y va vazn raqamlarini kiriting.");
      return;
    }

    const advice = generateJacobAdvice(h, w, sizeRules, name);
    setSimResult(advice);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Save bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-900 p-5 rounded-3xl border border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={avatarUrl}
              alt={name}
              className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-400 shrink-0"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-base text-white">Operator {name} & Razmer Qoidalari</h3>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                Aktiv
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Siz bu yerda qanday razmer qoidasini kiritsangiz, mijoz so'raganda Jacob xuddi shuni aytadi!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Saqlandi!
            </span>
          )}
          <button
            type="button"
            onClick={handleSaveAll}
            className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Barchasini Saqlash</span>
          </button>
        </div>
      </div>

      {/* Operator Basic Profile */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
        <h4 className="font-black text-sm uppercase text-white tracking-wider flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-amber-400" />
          <span>Operator Shaxsiyati & Ma'lumotlari</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="text-zinc-400 block mb-1 font-mono">Operator ismi:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jacob"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-zinc-700 text-white font-bold outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-zinc-400 block mb-1 font-mono">Lavozim / Maqomi:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Rasmiy do'kon operatori"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-zinc-700 text-white outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-zinc-400 block mb-1 font-mono">Avatar rasmi URL:</label>
            <input
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-zinc-700 text-white font-mono text-[11px] outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>

      {/* JACOB SIMULATOR / TESTER: Admin sees what Jacob will say */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-zinc-900 to-black border-2 border-amber-400/40 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <div>
              <h4 className="font-black text-sm uppercase text-white tracking-wider">
                Jacob Sinov Simulyatori (Jonli Tekshirish)
              </h4>
              <p className="text-[11px] text-zinc-400">
                Bo'y va vaznni kiriting — Jacob mijozga aynan nima deb javob berishini hoziroq ko'ring!
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div>
            <label className="text-zinc-400 block mb-1 text-xs font-mono">Bo'y (sm):</label>
            <input
              type="number"
              value={simHeight}
              onChange={(e) => setSimHeight(e.target.value)}
              placeholder="170"
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono text-sm outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-zinc-400 block mb-1 text-xs font-mono">Vazn (kg):</label>
            <input
              type="number"
              value={simWeight}
              onChange={(e) => setSimWeight(e.target.value)}
              placeholder="77"
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono text-sm outline-none focus:border-amber-400"
            />
          </div>

          <button
            type="button"
            onClick={() => handleTestSimulator()}
            className="py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>Jacobdan so'rash (Sinash)</span>
          </button>
        </div>

        {/* Quick presets for testing */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-zinc-500 text-[11px] font-mono">Tezkor sinash:</span>
          <button
            type="button"
            onClick={() => {
              setSimHeight('170');
              setSimWeight('77');
              handleTestSimulator('170', '77');
            }}
            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-mono text-[11px] cursor-pointer"
          >
            170 sm & 77 kg (2XL)
          </button>
          <button
            type="button"
            onClick={() => {
              setSimHeight('176');
              setSimWeight('80');
              handleTestSimulator('176', '80');
            }}
            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-[11px] cursor-pointer"
          >
            176 sm & 80 kg (L/XL)
          </button>
          <button
            type="button"
            onClick={() => {
              setSimHeight('165');
              setSimWeight('58');
              handleTestSimulator('165', '58');
            }}
            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-[11px] cursor-pointer"
          >
            165 sm & 58 kg (S)
          </button>
          <button
            type="button"
            onClick={() => {
              setSimHeight('185');
              setSimWeight('98');
              handleTestSimulator('185', '98');
            }}
            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-[11px] cursor-pointer"
          >
            185 sm & 98 kg (3XL)
          </button>
        </div>

        {/* Jacob Response Box */}
        {simResult && (
          <div className="p-4 rounded-2xl bg-zinc-950 border border-amber-400/40 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Operator {name}ning mijozga beradigan aniq javobi:</span>
            </div>
            <p className="text-xs text-zinc-200 whitespace-pre-line leading-relaxed font-sans bg-black/60 p-3 rounded-xl border border-zinc-800">
              {simResult}
            </p>
          </div>
        )}
      </div>

      {/* SIZE RULES SECTION */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
          <div>
            <h4 className="font-black text-sm uppercase text-white tracking-wider flex items-center gap-2">
              <Ruler className="w-4 h-4 text-amber-400" />
              <span>Razmer Qoidalari ({sizeRules.length} ta)</span>
            </h4>
            <p className="text-[11px] text-zinc-400">
              Har bir razmer uchun bo'y va vazn parametrlarini xohlagancha o'zgartiring yoki yangi razmer qo'shing
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetDefaultRules}
              className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Standart razmerlarni tiklash"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Standart</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingRuleId(null);
                setFormSize('2XL');
                setFormMinHeight('170');
                setFormMaxHeight('190');
                setFormMinWeight('77');
                setFormMaxWeight('105');
                setFormNote("170 sm va 77 kg uchun juda qulay oversize razmer.");
                setIsAddingRule(!isAddingRule);
              }}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi Razmer Qo'shish</span>
            </button>
          </div>
        </div>

        {/* Form: Add or Edit Rule */}
        {isAddingRule && (
          <form
            onSubmit={handleSaveRule}
            className="p-5 rounded-2xl bg-black border border-amber-400/50 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="font-bold text-amber-400 uppercase tracking-wider">
                {editingRuleId ? "Razmer Qoidasini Tahrirlash" : "Yangi Razmer Qoidasi Qo'shish"}
              </span>
              <button
                type="button"
                onClick={() => setIsAddingRule(false)}
                className="text-zinc-500 hover:text-white"
              >
                Bekor qilish
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <label className="text-zinc-400 block mb-1 font-mono">Razmer nomi:</label>
                <input
                  type="text"
                  required
                  placeholder="2XL, XL, M..."
                  value={formSize}
                  onChange={(e) => setFormSize(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-black uppercase text-sm"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1 font-mono">Min bo'y (sm):</label>
                <input
                  type="number"
                  required
                  placeholder="170"
                  value={formMinHeight}
                  onChange={(e) => setFormMinHeight(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1 font-mono">Max bo'y (sm):</label>
                <input
                  type="number"
                  required
                  placeholder="190"
                  value={formMaxHeight}
                  onChange={(e) => setFormMaxHeight(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1 font-mono">Min vazn (kg):</label>
                <input
                  type="number"
                  required
                  placeholder="77"
                  value={formMinWeight}
                  onChange={(e) => setFormMinWeight(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1 font-mono">Max vazn (kg):</label>
                <input
                  type="number"
                  required
                  placeholder="105"
                  value={formMaxWeight}
                  onChange={(e) => setFormMaxWeight(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-zinc-400 block mb-1 font-mono">
                Jacob tavsiyasi izohi (Mijozga aytiladigan maslahat matni):
              </label>
              <textarea
                rows={2}
                required
                value={formNote}
                onChange={(e) => setFormNote(e.target.value)}
                placeholder="170 sm va 77 kg uchun juda qulay oversize razmer, erkin harakatlanish uchun eng to'g'ri tanlov."
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white outline-none focus:border-amber-400 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingRule(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-bold hover:bg-zinc-700 cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Check className="w-4 h-4" />
                <span>{editingRuleId ? "O'zgarishni Saqlash" : "Qoidani Qo'shish"}</span>
              </button>
            </div>
          </form>
        )}

        {/* Existing Rules Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sizeRules.map((rule) => {
            const isHighlight = rule.size === '2XL' || (rule.minHeight <= 170 && rule.maxHeight >= 170 && rule.minWeight <= 77 && rule.maxWeight >= 77);
            return (
              <div
                key={rule.id}
                className={`p-4 rounded-2xl bg-black border transition-all space-y-3 flex flex-col justify-between ${
                  isHighlight ? 'border-amber-400 shadow-md shadow-amber-400/5' : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-xl bg-amber-400 text-black font-mono font-black text-sm">
                        {rule.size}
                      </span>
                      {isHighlight && (
                        <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 text-[10px] font-bold">
                          170 sm / 77 kg uchun ideal
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleEditRule(rule)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white cursor-pointer transition-colors"
                        title="Tahrirlash"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-900/50 text-zinc-400 hover:text-rose-400 cursor-pointer transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Ranges */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                      <span className="text-[10px] text-zinc-500 block uppercase">Bo'y oralig'i:</span>
                      <span className="font-bold text-white text-xs">{rule.heightRange}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                      <span className="text-[10px] text-zinc-500 block uppercase">Vazn oralig'i:</span>
                      <span className="font-bold text-white text-xs">{rule.weightRange}</span>
                    </div>
                  </div>

                  {/* Recommendation note */}
                  <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-800/80">
                    <strong className="text-amber-400 font-mono block text-[10px] mb-0.5">Jacob maslahati:</strong>
                    {rule.recommendationNote}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
