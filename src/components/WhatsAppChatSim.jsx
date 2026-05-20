// WhatsAppChatSim.jsx - Interactive WhatsApp complaint simulation with SMS OTP verification
import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, CheckCheck, Smile, MapPin, Image as ImageIcon, Sparkles, KeyRound } from "lucide-react";

export default function WhatsAppChatSim({ onNewComplaint, currentUser }) {
  const [step, setStep] = useState(0); // 0: Start, 1: Request OTP, 2: OTP Verified, 3: Send Photo, 4: Send Location, 5: Publish
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "👋 Welcome to **UrbanEye** WhatsApp Bot!\n\nTo prevent false or spam reports, all complaints require phone/identity verification first.\n\nClick **'1. Verify Identity'** to begin.",
      time: "15:02"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const addBotMessage = (text, delay = 1500) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    }, delay);
  };

  const handleVerifyIdentity = () => {
    if (step !== 0) return;
    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: "🔐 Requesting secure phone verification link...",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
    setStep(1);
    addBotMessage("📲 We have simulated sending a secure 4-digit OTP code **(8429)** to your registered mobile number.\n\nPlease enter the code or click **'2. Verify OTP'** to proceed.");
  };

  const handleVerifyOTP = () => {
    if (step !== 1) return;
    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: "🔑 Verification OTP Code: **8429**",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
    setStep(2);
    addBotMessage("🎉 **OTP Verified successfully!**\n\nYour identity is verified. Your reports will now be marked as authentic.\n\nNow, please send or take a clear **photo** of the civic issue. 📸");
  };

  const handleSimulatePhoto = () => {
    if (step !== 2) return;
    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: "📸 Uploaded a photo",
        image: "https://images.unsplash.com/photo-1599740831146-80cf4bde309b?w=400&auto=format&fit=crop&q=80", // Pothole close-up
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
    setStep(3);
    addBotMessage("Got the photo! 🔍 Analyzing image...\n\n*System Analysis*: **Pothole** detected with high confidence.\n\nNow, please send your **GPS Location** (Share Location on WhatsApp) so we can map it. 📍");
  };

  const handleSimulateLocation = () => {
    if (step !== 3) return;
    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: "📍 Current Coordinates Shared",
        location: { lat: 10.0159, lng: 76.3419, name: "Kakkanad, Ernakulam" },
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
    setStep(4);
    
    addBotMessage(
      "📍 Location coordinates received!\n\n*District*: Ernakulam (EKM)\n*Location*: Kakkanad Junction\n\n📝 **Malayalam Translation Generated**:\n_\"കാക്കനാട് ജംഗ്ഷനിൽ റോഡിലെ ടാർ ഇളകി വലിയ കുഴികൾ രൂപപ്പെട്ടിരിക്കുന്നു.\"_\n\n✅ **Success**: Complaint verified & registered successfully! Reference: **#CP-8492**.\n\nAdding this to the live map right now!",
      2000
    );

    setTimeout(() => {
      setStep(5);
    }, 3800);
  };

  const handlePublish = () => {
    const newComplaint = {
      id: "whatsapp-" + Date.now(),
      category: "pothole",
      titleEn: "Pothole at Kakkanad junction near Civil Station",
      titleMl: "കാക്കനാട് റോഡിലെ ടാർ ഇളകി വലിയ കുഴികൾ രൂപപ്പെട്ടിരിക്കുന്നു",
      descEn: "A deep pothole has formed right at the Kakkanad junction causing heavy traffic congestion and posing risks to motor riders.",
      descMl: "കാക്കനാട് ജംഗ്ഷനിൽ റോഡിലെ ടാർ ഇളകി വലിയ കുഴികൾ രൂപപ്പെട്ടിരിക്കുന്നു. വലിയ അപകടഭീഷണിയാണ് ഇത് ഉണ്ടാക്കുന്നത്.",
      location: "Kakkanad, Ernakulam",
      district: "EKM",
      lat: 10.0159,
      lng: 76.3419,
      image: "https://images.unsplash.com/photo-1599740831146-80cf4bde309b?w=800&auto=format&fit=crop&q=80",
      createdAt: Date.now(),
      status: "submitted", // starts as submitted
      seriousness: "high", // automatically high
      originalSeriousness: "high",
      citizen: currentUser ? currentUser.name : "Verified WhatsApp Citizen",
      upvotes: 1,
      upvotedBy: [],
      comments: []
    };
    onNewComplaint(newComplaint);
    
    // reset simulator
    setStep(0);
    setMessages([
      {
        sender: "bot",
        text: "👋 Welcome to **UrbanEye** WhatsApp Bot!\n\nTo prevent false or spam reports, all complaints require phone/identity verification first.\n\nClick **'1. Verify Identity'** to begin.",
        time: "15:02"
      }
    ]);
  };

  return (
    <div className="wa-sim-container">
      {/* Phone Shell */}
      <div className="phone-shell">
        <div className="phone-header-bezel">
          <div className="speaker"></div>
          <div className="camera"></div>
        </div>

        <div className="wa-app">
          {/* WA Header */}
          <div className="wa-header">
            <div className="wa-avatar">CP</div>
            <div className="wa-contact-info">
              <div className="wa-name">
                UrbanEye Bot
                <span className="wa-badge">✓</span>
              </div>
              <div className="wa-status">online</div>
            </div>
          </div>

          {/* WA Chat Area */}
          <div className="wa-chat-area">
            {messages.map((msg, idx) => (
              <div key={idx} className={`wa-msg-wrapper ${msg.sender}`}>
                <div className={`wa-bubble ${msg.sender}`}>
                  {msg.image && (
                    <img src={msg.image} alt="Sent file" className="wa-bubble-img" />
                  )}
                  {msg.location && (
                    <div className="wa-bubble-loc">
                      <div className="loc-icon-box"><MapPin size={18} /></div>
                      <div className="loc-text">
                        <div className="loc-title">Location Shared</div>
                        <div className="loc-subtitle">{msg.location.name}</div>
                      </div>
                    </div>
                  )}
                  <p className="wa-text" dangerouslySetInnerHTML={{ 
                    __html: msg.text
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      .replace(/\n/g, '<br />')
                  }} />
                  <span className="wa-time">
                    {msg.time}
                    {msg.sender === "user" && <CheckCheck size={14} color="#34b7f1" />}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="wa-msg-wrapper bot">
                <div className="wa-bubble bot typing">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* WA Footer Controls */}
          <div className="wa-footer">
            <div className="wa-input-mock">
              <Smile size={20} color="#8696a0" />
              <input 
                type="text" 
                placeholder="Type a message..." 
                disabled 
                value={
                  step === 0 ? "Click '1. Verify Identity'" : 
                  step === 1 ? "Click '2. Verify OTP'" : 
                  step === 2 ? "Click '3. Send Photo'" : 
                  step === 3 ? "Click '4. Share GPS'" : 
                  "Publishing to feed..."
                }
              />
            </div>
            <div className="wa-send-btn">
              <Send size={16} color="white" />
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Control Board */}
      <div className="sim-dashboard">
        <div className="sim-header">
          <Sparkles size={16} color="var(--accent-color)" />
          <h3>Secure WhatsApp Pipeline</h3>
        </div>
        <p className="sim-desc">
          Citizens can submit reports via WhatsApp. Watch how the pipeline enforces **secure phone authorization** to eliminate falsified/anonymous complaints.
        </p>

        <div className="sim-buttons">
          <button 
            onClick={handleVerifyIdentity} 
            className={`sim-action-btn ${step === 0 ? "highlight pulse-glow" : ""}`}
            disabled={step !== 0}
          >
            <KeyRound size={16} />
            <span>1. Verify Identity (SMS Request)</span>
          </button>

          <button 
            onClick={handleVerifyOTP} 
            className={`sim-action-btn ${step === 1 ? "highlight pulse-glow" : ""}`}
            disabled={step !== 1}
          >
            <CheckCheck size={16} />
            <span>2. Validate OTP code (8429)</span>
          </button>

          <button 
            onClick={handleSimulatePhoto} 
            className={`sim-action-btn ${step === 2 ? "highlight pulse-glow" : ""}`}
            disabled={step !== 2}
          >
            <ImageIcon size={16} />
            <span>3. Upload Pothole Photo</span>
          </button>

          <button 
            onClick={handleSimulateLocation} 
            className={`sim-action-btn ${step === 3 ? "highlight pulse-glow" : ""}`}
            disabled={step !== 3}
          >
            <MapPin size={16} />
            <span>4. Push GPS Geolocation</span>
          </button>
        </div>

        {step === 5 && (
          <div className="publish-alert glass animate-fade-in">
            <div className="alert-content">
              <h4>🎯 Secure Pipeline Verified</h4>
              <p>The AI vision system parsed the image, matched the coordinates to Kakkanad, and verified the citizen's authenticated phone session. Ready to publish live!</p>
            </div>
            <button onClick={handlePublish} className="btn-success">
              Publish Live & Inspect Stepper!
            </button>
          </div>
        )}
      </div>

      <style>{`
        .wa-sim-container {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 24px;
          align-items: start;
        }

        .phone-shell {
          width: 320px;
          height: 580px;
          background: #000;
          border-radius: 40px;
          border: 12px solid #222;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
          overflow: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .phone-header-bezel {
          height: 24px;
          background: #000;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          position: absolute;
          top: 0;
          z-index: 10;
        }

        .phone-header-bezel .speaker {
          width: 60px;
          height: 4px;
          background: #333;
          border-radius: 2px;
        }

        .phone-header-bezel .camera {
          width: 8px;
          height: 8px;
          background: #111;
          border-radius: 50%;
        }

        .wa-app {
          flex: 1;
          display: flex;
          flex-direction: column;
          margin-top: 24px;
          background: #efeae2;
          position: relative;
        }
        
        [data-theme="dark"] .wa-app {
          background: #0b141a;
        }

        .wa-header {
          height: 52px;
          background: #075e54;
          display: flex;
          align-items: center;
          padding: 0 16px;
          gap: 12px;
          color: white;
        }
        
        [data-theme="dark"] .wa-header {
          background: #202c33;
          border-bottom: 1px solid var(--border-color);
        }

        .wa-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #128c7e;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 13px;
          color: white;
        }

        .wa-contact-info {
          display: flex;
          flex-direction: column;
        }

        .wa-name {
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .wa-badge {
          background: #34b7f1;
          color: white;
          font-size: 8px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .wa-status {
          font-size: 11px;
          opacity: 0.8;
        }

        .wa-chat-area {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background-image: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png');
          background-size: contain;
          opacity: 0.95;
        }
        
        [data-theme="dark"] .wa-chat-area {
          background-image: none;
          background: #0f172a;
        }

        .wa-msg-wrapper {
          display: flex;
          width: 100%;
        }

        .wa-msg-wrapper.user {
          justify-content: flex-end;
        }

        .wa-msg-wrapper.bot {
          justify-content: flex-start;
        }

        .wa-bubble {
          max-width: 85%;
          padding: 8px 10px;
          border-radius: 8px;
          font-size: 12px;
          line-height: 1.4;
          position: relative;
          word-break: break-word;
          color: #1e293b;
        }

        [data-theme="dark"] .wa-bubble {
          color: #f8fafc;
        }
        
        .wa-bubble.user {
          background: #d9fdd3;
          border-top-right-radius: 0;
        }

        [data-theme="dark"] .wa-bubble.user {
          background: #056162;
        }

        .wa-bubble.bot {
          background: #ffffff;
          border-top-left-radius: 0;
        }

        [data-theme="dark"] .wa-bubble.bot {
          background: #1f2937;
        }

        .wa-bubble-img {
          width: 100%;
          max-height: 120px;
          object-fit: cover;
          border-radius: 6px;
          margin-bottom: 6px;
        }

        .wa-bubble-loc {
          background: rgba(0, 0, 0, 0.05);
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px;
          border-radius: 6px;
          margin-bottom: 6px;
        }

        .loc-icon-box {
          background: #128c7e;
          color: white;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loc-text {
          display: flex;
          flex-direction: column;
        }

        .loc-title {
          font-weight: 600;
          font-size: 11.5px;
        }

        .loc-subtitle {
          font-size: 10px;
          opacity: 0.8;
        }

        .wa-time {
          font-size: 9px;
          color: #8696a0;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 2px;
          margin-top: 4px;
        }

        .wa-footer {
          height: 48px;
          background: #f0f2f5;
          display: flex;
          align-items: center;
          padding: 0 10px;
          gap: 8px;
        }
        
        [data-theme="dark"] .wa-footer {
          background: #202c33;
        }

        .wa-input-mock {
          flex: 1;
          height: 36px;
          background: white;
          border-radius: 20px;
          display: flex;
          align-items: center;
          padding: 0 12px;
          gap: 8px;
        }

        [data-theme="dark"] .wa-input-mock {
          background: #2a3942;
        }

        .wa-input-mock input {
          font-size: 12px;
          flex: 1;
          color: var(--text-primary);
          outline: none;
        }

        .wa-send-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #00a884;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .typing {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 12px 16px;
        }

        .typing .dot {
          width: 6px;
          height: 6px;
          background: #888;
          border-radius: 50%;
          animation: bounce 1.3s infinite;
        }

        .typing .dot:nth-child(2) { animation-delay: 0.15s; }
        .typing .dot:nth-child(3) { animation-delay: 0.3s; }

        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }

        .sim-dashboard {
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: var(--bg-card);
          padding: 24px;
          border-radius: 16px;
          border: 1px solid var(--border-color);
        }

        .sim-header {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sim-header h3 {
          font-size: 18px;
        }

        .sim-desc {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .sim-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .sim-action-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px;
          border-radius: 10px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .sim-action-btn:hover:not(:disabled) {
          border-color: var(--accent-color);
          background: var(--bg-card);
          transform: translateX(4px);
        }

        .sim-action-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .sim-action-btn.highlight {
          border-color: var(--accent-color);
          background: var(--accent-glow);
          color: var(--accent-color);
        }

        .publish-alert {
          margin-top: 12px;
          padding: 16px;
          background: var(--color-resolved-bg) !important;
          border-color: var(--color-resolved) !important;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .publish-alert h4 {
          font-size: 14px;
          color: var(--color-resolved);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .publish-alert p {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .btn-success {
          background: var(--color-resolved);
          color: white;
          font-weight: 600;
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 13px;
          cursor: pointer;
          transition: background var(--transition-fast);
          text-align: center;
        }

        .btn-success:hover {
          background: #059669;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }

        @media (max-width: 768px) {
          .wa-sim-container {
            grid-template-columns: 1fr;
            justify-items: center;
          }
          
          .sim-dashboard {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
