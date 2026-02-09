
import React, { useState, useEffect } from 'react';
import { Settings, MessageCircle, Eye, Plus, Trash2, X, Instagram, Mail, Phone, ExternalLink, MapPin, Camera, Save, Layout, Lock, Users, Calendar, Clock, CheckCircle2, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';
import { GridItem, UserProfile, Visitor } from './types';
import { INITIAL_ITEMS, INITIAL_PROFILE } from './constants';

const formatVisitorDate = (timestamp: string) => {
  const date = new Date(timestamp);
  return {
    dayName: date.toLocaleDateString('pt-BR', { weekday: 'long' }),
    dayNumeric: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  };
};

const App: React.FC = () => {
  const [items, setItems] = useState<GridItem[]>(() => {
    const saved = localStorage.getItem('robinho_items');
    let currentItems = saved ? JSON.parse(saved) : INITIAL_ITEMS;
    return currentItems.filter((item: GridItem) => {
      const title = item.title?.toLowerCase() || "";
      return title !== "filmmaking" && title !== "nova foto";
    });
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('robinho_profile');
    return saved ? JSON.parse(saved) : INITIAL_PROFILE;
  });

  const [visitors, setVisitors] = useState<Visitor[]>(() => {
    const saved = localStorage.getItem('robinho_visitors');
    return saved ? JSON.parse(saved) : [];
  });

  const [isAdmin, setIsAdmin] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isVisitorsOpen, setIsVisitorsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSavedSuccessfully, setIsSavedSuccessfully] = useState(false);
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);

  const [contactForm, setContactForm] = useState({ name: '', phone: '', email: '', instagram: '' });

  const ADMIN_PASSWORD = '120240';

  useEffect(() => {
    localStorage.setItem('robinho_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('robinho_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('robinho_visitors', JSON.stringify(visitors));
  }, [visitors]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  const handleLiquidClick = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const ripple = document.createElement("span");
    const rect = card.getBoundingClientRect();
    
    let x, y;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    const size = Math.max(card.clientWidth, card.clientHeight);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x - size / 2}px`;
    ripple.style.top = `${y - size / 2}px`;
    ripple.classList.add("ripple-glass");

    const existingRipples = card.getElementsByClassName("ripple-glass");
    for (let r of Array.from(existingRipples)) {
      (r as Element).remove();
    }
    
    card.appendChild(ripple);
    setTimeout(() => ripple.remove(), 1000);
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setIsAuthModalOpen(false);
      setIsSettingsOpen(true);
      setAuthError(false);
      setPasswordInput('');
    } else {
      setAuthError(true);
      setPasswordInput('');
      setTimeout(() => setAuthError(false), 2000);
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newVisitor: Visitor = {
      id: Date.now().toString(),
      instagram: contactForm.instagram || contactForm.name,
      timestamp: new Date().toISOString()
    };
    setVisitors([newVisitor, ...visitors]);

    const subject = encodeURIComponent(`Novo Contato: ${contactForm.name} - Portfólio`);
    const body = encodeURIComponent(
      `Nome: ${contactForm.name}\nWhatsApp: ${contactForm.phone}\nE-mail: ${contactForm.email}\nInstagram: ${contactForm.instagram || 'Não informado'}\nData: ${new Date().toLocaleString('pt-BR')}`
    );
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
    setIsContactOpen(false);
    setContactForm({ name: '', phone: '', email: '', instagram: '' });
  };

  const deleteItem = (id: string) => {
    if(confirm("Deseja remover este bloco?")) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const moveItem = (index: number, direction: 'prev' | 'next') => {
    const newItems = [...items];
    const targetIndex = direction === 'prev' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newItems.length) {
      [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
      setItems(newItems);
    }
  };

  const resizeItem = (id: string, dimension: 'width' | 'height', action: 'increase' | 'decrease') => {
    setItems(items.map(item => {
      if (item.id === id) {
        if (dimension === 'width') {
          const current = item.colSpan || 1;
          const newValue = action === 'increase' ? Math.min(current + 1, 4) : Math.max(current - 1, 1);
          return { ...item, colSpan: newValue as 1 | 2 | 3 | 4 };
        } else {
          const current = item.rowSpan || 1;
          const newValue = action === 'increase' ? Math.min(current + 1, 2) : Math.max(current - 1, 1);
          return { ...item, rowSpan: newValue as 1 | 2 };
        }
      }
      return item;
    }));
  };

  const addItem = (type: 'text' | 'image' | 'link' | 'social' = 'image') => {
    const newItem: GridItem = {
      id: Date.now().toString(),
      type,
      title: type === 'image' ? '' : type === 'text' ? 'Novo Texto' : 'Novo Link',
      content: type === 'text' ? 'Escreva algo aqui...' : '',
      imageUrl: type === 'image' ? 'https://picsum.photos/800/800?random=' + Date.now() : '',
      url: type === 'link' ? 'https://' : '',
      colSpan: 1,
      rowSpan: 1
    };
    setItems([...items, newItem]);
  };

  const openWhatsApp = () => {
    const url = `https://wa.me/${profile.whatsapp}?text=${encodeURIComponent(profile.whatsappMessage)}`;
    window.open(url, '_blank');
  };

  const handlePublish = () => {
    setIsSavedSuccessfully(true);
    setTimeout(() => {
      setIsSavedSuccessfully(false);
      setIsSettingsOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 800);
  };

  const getColSpanClass = (colSpan?: number) => {
    if (!colSpan) return 'col-span-1';
    if (colSpan >= 4) return 'col-span-2 md:col-span-4';
    if (colSpan === 3) return 'col-span-2 md:col-span-3';
    if (colSpan === 2) return 'col-span-2 md:col-span-2';
    return 'col-span-1';
  };

  return (
    <div className="min-h-screen bg-black text-white pb-32 pt-12 px-4 sm:px-6 relative overflow-x-hidden selection:bg-[#7e0404] selection:text-white">
      
      <button 
        onClick={() => isAdmin ? setIsSettingsOpen(true) : setIsAuthModalOpen(true)}
        className={`fixed top-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all ${isAdmin ? 'bg-white text-black scale-110' : 'bg-[#7e0404] text-white hover:brightness-125'} flex items-center justify-center`}
        title="Painel de Controle"
      >
        {isAdmin ? <Settings size={28} className="animate-spin-slow" /> : <Lock size={28} />}
      </button>

      <div className="flex flex-col items-center mb-16 animate-in fade-in slide-in-from-top-8 duration-1000">
        <div className="relative mb-8 group">
          <div className="absolute inset-0 bg-[#7e0404] rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
          <img src={profile.avatar} alt={profile.name} className="w-40 h-40 rounded-full border-4 border-[#7e0404] object-cover bg-neutral-900 shadow-2xl relative z-10" />
          {isAdmin && (
            <button onClick={() => setIsSettingsOpen(true)} className="absolute bottom-1 right-1 p-3 bg-[#7e0404] rounded-full cursor-pointer hover:bg-red-800 border-2 border-black z-20 shadow-xl">
              <Camera size={20} />
            </button>
          )}
        </div>
        <h1 className="text-5xl sm:text-6xl font-black tracking-tighter mb-3">{profile.name}</h1>
        <p className="text-gray-400 font-bold text-xl text-center px-4 max-w-lg tracking-tight">{profile.role}</p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 px-2 auto-rows-min">
        {items.map((item, index) => (
          <div 
            key={item.id} 
            style={{ gridRow: `span ${item.rowSpan || 1}` }}
            onMouseMove={handleMouseMove} 
            onMouseDown={handleLiquidClick} 
            onTouchStart={handleLiquidClick}
            className={`bento-card relative rounded-[2.5rem] flex flex-col justify-between overflow-hidden group cursor-pointer ${getColSpanClass(item.colSpan)} min-h-[140px] md:min-h-[180px]`}
          >
            <div className="glass-top"></div>
            <div className="liquid-light"></div>

            {isAdmin && (
              <div className="absolute inset-0 z-30 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4 backdrop-blur-sm">
                <div className="flex gap-2">
                  <button onClick={(e) => { e.stopPropagation(); moveItem(index, 'prev'); }} className="p-3 bg-white text-black rounded-xl hover:bg-[#7e0404] transition-all"><ChevronLeft size={20}/></button>
                  <button onClick={(e) => { e.stopPropagation(); moveItem(index, 'next'); }} className="p-3 bg-white text-black rounded-xl hover:bg-[#7e0404] transition-all"><ChevronRight size={20}/></button>
                  <button onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }} className="p-3 bg-red-600 text-white rounded-xl hover:bg-red-800 transition-all"><Trash2 size={20}/></button>
                </div>
                <div className="flex gap-2">
                  <button onClick={(e) => { e.stopPropagation(); resizeItem(item.id, 'width', 'decrease'); }} className="p-2 bg-neutral-800 text-white rounded-lg text-[10px] font-bold"><ChevronLeft size={14}/> L</button>
                  <button onClick={(e) => { e.stopPropagation(); resizeItem(item.id, 'width', 'increase'); }} className="p-2 bg-neutral-800 text-white rounded-lg text-[10px] font-bold">L <ChevronRight size={14}/></button>
                </div>
                <div className="flex gap-2">
                  <button onClick={(e) => { e.stopPropagation(); resizeItem(item.id, 'height', 'decrease'); }} className="p-2 bg-neutral-800 text-white rounded-lg text-[10px] font-bold"><ChevronUp size={14}/> A</button>
                  <button onClick={(e) => { e.stopPropagation(); resizeItem(item.id, 'height', 'increase'); }} className="p-2 bg-neutral-800 text-white rounded-lg text-[10px] font-bold">A <ChevronDown size={14}/></button>
                </div>
              </div>
            )}

            {item.type === 'social' && (
              <div className={`p-8 h-full flex relative z-10 ${item.colSpan && item.colSpan >= 3 ? 'flex-col sm:flex-row sm:items-center justify-between' : 'flex-col justify-between'}`}>
                <div className={`flex ${item.colSpan && item.colSpan >= 3 ? 'flex-row items-center' : 'flex-col'} gap-5`}>
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-500 flex-shrink-0">
                    <Instagram size={32} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight">{item.title}</h3>
                    <p className="text-sm text-white/50 font-medium">@{profile.instagram}</p>
                  </div>
                </div>
                <a 
                  href={item.url || `https://www.instagram.com/${profile.instagram}/`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  onClick={(e) => e.stopPropagation()}
                  className={`bg-white/10 hover:bg-white/20 border border-white/20 py-4 rounded-2xl text-center text-sm font-black transition-all flex items-center justify-center gap-2 ${item.colSpan && item.colSpan >= 3 ? 'sm:px-12 mt-4 sm:mt-0' : 'mt-6'}`}
                >
                  Seguir <ExternalLink size={18} />
                </a>
              </div>
            )}

            {item.type === 'text' && (
              <div className="p-8 h-full flex flex-col justify-center relative z-10">
                <p className="text-xl font-bold leading-tight group-hover:scale-[1.03] transition-transform duration-500">{item.content}</p>
                <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-60 transition-opacity"><Sparkles size={24} /></div>
              </div>
            )}

            {item.type === 'link' && (
              <div className="p-8 flex flex-col h-full relative z-10">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 border border-white/20 shadow-inner group-hover:rotate-12 transition-transform">
                  <Layout size={32} />
                </div>
                <h3 className="text-3xl font-black mb-2 leading-tight tracking-tighter">{item.title}</h3>
                <p className="text-sm text-white/80 mb-auto font-medium">{item.subtitle}</p>
                <a href={item.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                  className="mt-8 bg-white text-black py-5 rounded-2xl text-center text-sm font-black hover:bg-gray-100 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xl">
                  Acessar Agora <ExternalLink size={18} />
                </a>
              </div>
            )}

            {item.type === 'image' && (
              <div className="absolute inset-0 z-10">
                <img src={item.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={item.title || 'Portfolio Item'} />
                <div className={`absolute inset-0 bg-gradient-to-t ${item.title ? 'from-black/70 via-transparent' : 'from-transparent'} to-transparent`} />
                {item.title && <div className="absolute bottom-6 left-6"><h3 className="text-lg font-black uppercase tracking-[0.2em] drop-shadow-lg">{item.title}</h3></div>}
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            )}

            {item.type === 'map' && (
              <div className="absolute inset-0 flex flex-col z-10">
                <div className="flex-1 opacity-90 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url('${item.imageUrl}')` }} />
                <div className="p-6 bg-black/30 backdrop-blur-md border-t border-white/10">
                  <h3 className="text-base font-black flex items-center gap-3 uppercase tracking-tighter"><MapPin size={20} className="animate-bounce" /> {item.title || 'Localização'}</h3>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {isAdmin && (
          <button onClick={() => addItem('image')} className="rounded-[2.5rem] border-4 border-dashed border-[#7e0404] flex flex-col items-center justify-center min-h-[140px] md:min-h-[180px] hover:bg-[#7e0404]/10 transition-all group relative overflow-hidden">
            <Plus size={54} className="text-[#7e0404] group-hover:scale-125 transition-transform duration-500" />
            <span className="text-xs font-black mt-4 text-[#7e0404] uppercase tracking-[0.3em]">Novo Bloco</span>
          </button>
        )}
      </div>

      <footer className="text-center text-gray-700 mt-24 mb-12 font-black uppercase tracking-[0.4em] text-[10px]">
        <p className="hover:text-white transition-colors duration-500">Criado Por Robinho &copy; {new Date().getFullYear()}</p>
      </footer>

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/80 backdrop-blur-3xl border border-white/10 px-6 py-3 rounded-full shadow-[0_30px_100px_rgba(0,0,0,0.9)] z-40 transition-all hover:scale-105">
        <button onClick={() => setIsContactOpen(true)} className="flex items-center gap-4 px-10 py-5 bg-[#7e0404] rounded-full font-black text-xl hover:bg-red-800 transition-all active:scale-95 shadow-[0_15px_40px_rgba(126,4,4,0.4)] border-t border-white/10">
          <MessageCircle size={28} /> <span className="hidden sm:inline uppercase text-sm tracking-[0.2em]">Orçamento</span>
        </button>
        <div className="w-[1px] h-12 bg-white/10 mx-2" />
        {isAdmin && (
          <>
            <button onClick={() => setIsVisitorsOpen(true)} className="p-4 text-white/70 hover:text-[#7e0404] transition-colors flex items-center gap-3 group relative" title="Logs de Acesso">
              <Eye size={28} /> <span className="text-sm font-black">{visitors.length}</span>
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
            </button>
            <div className="w-[1px] h-12 bg-white/10 mx-1" />
          </>
        )}
        <button onClick={openWhatsApp} className="p-4 text-green-500 hover:scale-125 transition-all active:rotate-12" title="WhatsApp"><Phone size={28} /></button>
      </div>

      {isAuthModalOpen && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-[70] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
          <div className="bg-[#050505] w-full max-w-sm rounded-[3.5rem] p-12 border border-[#7e0404]/50 relative shadow-[0_0_150px_rgba(126,4,4,0.5)]">
            <button onClick={() => setIsAuthModalOpen(false)} className="absolute top-10 right-10 text-white/40 hover:text-white transition-colors"><X size={32} /></button>
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-[#7e0404] rounded-[2rem] flex items-center justify-center mb-10 shadow-2xl rotate-3"><Lock size={44} className="text-white" /></div>
              <h2 className="text-4xl font-black mb-4 tracking-tighter">Acesso Admin</h2>
              <form onSubmit={handleAuth} className="w-full space-y-8">
                <input type="password" maxLength={6} placeholder="••••••" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value.replace(/\D/g, ''))}
                  className={`w-full bg-black border ${authError ? 'border-red-600 animate-shake' : 'border-white/5'} rounded-[2rem] px-8 py-6 text-center text-4xl tracking-[0.8em] outline-none focus:ring-4 focus:ring-[#7e0404]/40 transition-all font-black`} autoFocus />
                <button type="submit" className="w-full bg-[#7e0404] hover:bg-red-800 py-6 rounded-[2rem] font-black text-2xl transition-all active:scale-95 border-t border-white/10 shadow-xl group">Entrar <ChevronRight className="inline-block ml-2 group-hover:translate-x-2 transition-transform" /></button>
              </form>
            </div>
          </div>
        </div>
      )}

      {isContactOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-50 flex items-center justify-center p-4 animate-in zoom-in-95 duration-500">
          <div className="bg-[#080808] w-full max-w-md rounded-[4rem] p-12 border border-[#7e0404]/40 relative shadow-[0_0_200px_rgba(126,4,4,0.4)] overflow-y-auto max-h-[90vh] custom-scrollbar">
            <button onClick={() => setIsContactOpen(false)} className="absolute top-10 right-10 text-white/40 hover:text-white transition-colors"><X size={32} /></button>
            <h2 className="text-4xl font-black mb-12 text-center uppercase tracking-tighter bg-gradient-to-r from-white to-[#7e0404] bg-clip-text text-transparent">Solicitar Orçamento</h2>
            <form onSubmit={handleContactSubmit} className="space-y-8">
              {['name', 'phone', 'email', 'instagram'].map((field) => (
                <div key={field} className="space-y-3">
                  <label className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-700 ml-2">{field === 'name' ? 'Seu Nome' : field === 'phone' ? 'WhatsApp' : field === 'email' ? 'E-mail' : 'Instagram (Opcional)'}</label>
                  <input required={field !== 'instagram'} type={field === 'email' ? 'email' : 'text'} value={(contactForm as any)[field]} onChange={(e) => setContactForm({ ...contactForm, [field]: e.target.value })}
                    className="w-full bg-black/50 border border-white/5 rounded-3xl px-7 py-5 outline-none focus:ring-2 focus:ring-[#7e0404] transition-all font-medium text-lg"/>
                </div>
              ))}
              <button type="submit" className="w-full bg-[#7e0404] hover:bg-red-800 py-6 rounded-[2.5rem] font-black text-2xl mt-10 shadow-2xl transition-all active:scale-95 border-t border-white/10 uppercase tracking-widest group">Enviar Mensagem <ChevronRight className="inline-block ml-1 group-hover:translate-x-2 transition-transform" /></button>
            </form>
          </div>
        </div>
      )}

      {isVisitorsOpen && isAdmin && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-50 flex items-center justify-center p-4 animate-in slide-in-from-bottom-12 duration-700">
          <div className="bg-[#080808] w-full max-w-lg rounded-[4rem] p-12 border border-white/10 relative max-h-[85vh] flex flex-col shadow-2xl">
            <button onClick={() => setIsVisitorsOpen(false)} className="absolute top-10 right-10 text-white/40 hover:text-white transition-colors"><X size={36} /></button>
            <div className="flex justify-between items-end mb-12">
              <div><h2 className="text-4xl font-black flex items-center gap-4 tracking-tighter">Insights de Visitas</h2><p className="text-[11px] text-gray-600 mt-3 uppercase tracking-[0.4em] font-black">Histórico de visualizações</p></div>
              <button onClick={() => { if(confirm("Apagar todos os logs?")) setVisitors([]) }} className="text-xs font-black text-red-700 hover:text-red-500 uppercase tracking-widest transition-colors mb-2">Limpar Tudo</button>
            </div>
            <div className="overflow-y-auto flex-1 space-y-6 pr-4 custom-scrollbar">
              {visitors.length === 0 && <p className="text-gray-700 text-center py-20 italic font-medium text-lg">Sem novos registros.</p>}
              {visitors.map((v) => {
                const { dayName, dayNumeric, time } = formatVisitorDate(v.timestamp);
                return (
                  <div key={v.id} className="bg-white/5 p-8 rounded-[3rem] border border-white/5 flex flex-col gap-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#7e0404] to-red-950 rounded-[1.5rem] flex items-center justify-center font-black text-2xl text-white">{(v.instagram || 'V')[0].toUpperCase()}</div>
                        <p className="font-black text-white text-2xl tracking-tight">@{v.instagram}</p>
                      </div>
                      <button onClick={() => setVisitors(visitors.filter(vis => vis.id !== v.id))} className="text-gray-800 hover:text-red-600 p-3"><Trash2 size={24} /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-[11px] font-black uppercase tracking-[0.2em] text-gray-600 border-t border-white/5 pt-5">
                      <div className="flex items-center gap-3"><Calendar size={16} className="text-[#7e0404]" /><span>{dayName}, {dayNumeric}</span></div>
                      <div className="flex items-center gap-3 justify-end"><Clock size={16} className="text-[#7e0404]" /><span>{time}</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {isSettingsOpen && isAdmin && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-[60] flex items-center justify-center p-4 sm:p-12 animate-in fade-in duration-700">
          <div className="bg-[#050505] w-full max-w-5xl rounded-[5rem] p-10 sm:p-20 border border-[#7e0404]/40 relative max-h-[95vh] overflow-y-auto custom-scrollbar flex flex-col shadow-[0_0_250px_rgba(126,4,4,0.3)]">
            <button onClick={() => setIsSettingsOpen(false)} className="absolute top-12 right-12 text-white/30 hover:text-white transition-colors"><X size={44} /></button>
            <div className="mb-16 flex flex-col lg:flex-row justify-between items-start gap-10">
              <div><h2 className="text-5xl font-black text-[#7e0404] flex items-center gap-6 tracking-tighter"><Settings size={48} /> Configurações</h2><p className="text-gray-500 mt-4 font-bold text-xl">Gerencie seu conteúdo em tempo real.</p></div>
              <div className="flex flex-wrap gap-4">
                <button onClick={() => setIsVisitorsOpen(true)} className="flex items-center gap-4 bg-white/5 hover:bg-[#7e0404]/30 px-8 py-5 rounded-full border border-white/10 transition-all font-black text-sm uppercase tracking-[0.3em]"><Users size={24} /> Logs de Visitas ({visitors.length})</button>
                <button onClick={() => { setIsAdmin(false); setIsSettingsOpen(false); }} className="text-sm bg-red-950/40 text-red-700 border border-red-700/20 px-8 py-5 rounded-full font-black uppercase tracking-[0.3em] hover:bg-red-700 transition-all">Sair do Painel</button>
              </div>
            </div>
            
            <div className="space-y-20 flex-1">
              <section className="space-y-10">
                <div className="flex items-center gap-4 text-white/30 uppercase tracking-[0.4em] text-xs font-black border-b border-white/5 pb-4"><Camera size={18} /> Identidade Visual</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4"><label className="text-xs font-black text-gray-700 uppercase tracking-widest">Nome</label><input value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full bg-black/50 border border-white/5 p-6 rounded-[2rem] text-xl font-bold outline-none focus:border-[#7e0404] transition-all"/></div>
                  <div className="space-y-4"><label className="text-xs font-black text-gray-700 uppercase tracking-widest">Cargo</label><input value={profile.role} onChange={e => setProfile({...profile, role: e.target.value})} className="w-full bg-black/50 border border-white/5 p-6 rounded-[2rem] text-xl font-bold outline-none focus:border-[#7e0404] transition-all"/></div>
                </div>
              </section>
              <section className="space-y-10">
                <div className="flex items-center gap-4 text-white/30 uppercase tracking-[0.4em] text-xs font-black border-b border-white/5 pb-4"><Mail size={18} /> Contato Profissional</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4"><label className="text-xs font-black text-gray-700 uppercase tracking-widest">E-mail</label><input value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} className="w-full bg-black/50 border border-white/5 p-6 rounded-[2rem] font-bold outline-none focus:border-[#7e0404] transition-all"/></div>
                  <div className="space-y-4"><label className="text-xs font-black text-gray-700 uppercase tracking-widest">WhatsApp</label><input value={profile.whatsapp} onChange={e => setProfile({...profile, whatsapp: e.target.value})} className="w-full bg-black/50 border border-white/5 p-6 rounded-[2rem] font-bold outline-none focus:border-[#7e0404] transition-all"/></div>
                </div>
              </section>
              <div className="pt-16 border-t border-white/10 flex flex-col sm:flex-row gap-8 sticky bottom-0 bg-[#050505] py-10 z-30">
                <button onClick={handlePublish} className="flex-1 bg-[#7e0404] hover:bg-red-800 p-8 rounded-[3rem] font-black text-3xl flex items-center justify-center gap-6 transition-all shadow-[0_20px_80px_rgba(126,4,4,0.6)] active:scale-95 border-t border-white/10 group">{isSavedSuccessfully ? <><CheckCircle2 size={40} className="animate-bounce" /> Salvo!</> : <><Save size={40} /> Salvar Alterações</>}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
