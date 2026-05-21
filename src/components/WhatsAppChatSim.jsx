// WhatsAppChatSim.jsx - Interactive WhatsApp complaint simulation with SMS OTP verification
import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, CheckCheck, Smile, MapPin, Image as ImageIcon, Sparkles, KeyRound } from "lucide-react";
import { translateEnglishToMalayalam } from "../utils/translator";

export default function WhatsAppChatSim({ onNewComplaint, currentUser }) {
  // Steps:
  // 0: Initial greeting, waiting for Name
  // 1: Name provided, waiting for Phone number
  // 2: Phone provided, waiting for OTP validation
  // 3: OTP Verified, waiting for Category selection (1-6)
  // 4: Category set, waiting for English title/description
  // 5: Description provided, waiting for Photo upload
  // 6: Photo uploaded, waiting for GPS location share
  // 7: Location shared, translation rendered, ready to publish
  const [step, setStep] = useState(0);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "👋 Welcome to **UrbanEye** WhatsApp Bot!\n\nTo report a civic issue, please start by typing your **name** below to begin.",
      time: "15:02"
    }
  ]);
  const [userTextInput, setUserTextInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Form State
  const [userName, setUserName] = useState("");
  const [phone, setPhone] = useState("");
  const [chosenCategory, setChosenCategory] = useState("pothole");
  const [complaintDesc, setComplaintDesc] = useState("");
  const [attachedPhoto, setAttachedPhoto] = useState("");
  const [attachedLoc, setAttachedLoc] = useState(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const addBotMessage = (text, delay = 1000) => {
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

  // Text message processor
  const processUserResponse = async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (step === 0) {
      setUserName(trimmed);
      setStep(1);
      addBotMessage(`Thanks **${trimmed}**! 🙏\n\nTo prevent spam, all reports require identity verification. Please enter your **10-digit mobile number**.`);
    } 
    else if (step === 1) {
      const cleanPhone = trimmed.replace(/\D/g, "");
      if (cleanPhone.length < 8) {
        addBotMessage("⚠️ Please enter a valid mobile number (at least 8 digits).");
        return;
      }
      setPhone(cleanPhone);
      setStep(2);
      addBotMessage("📲 We have simulated sending a secure 4-digit OTP code to your number.\n\nFor this simulation, please type **8429** to verify your identity.");
    } 
    else if (step === 2) {
      if (trimmed === "8429") {
        setStep(3);
        addBotMessage("🎉 **OTP Verified successfully!**\n\nYour identity is confirmed. Now, please choose a category by typing its **number**:\n\n1. Road & Pothole Damage\n2. Public Waste & Litter\n3. Broken Streetlights\n4. Waterlogging & Drainage\n5. Obstructions & Encroachment\n6. Other Grievances");
      } else {
        addBotMessage("❌ Invalid verification code. Please type **8429** to authenticate.");
      }
    } 
    else if (step === 3) {
      let cat = "pothole";
      let catName = "Road & Pothole Damage";
      
      if (trimmed === "1" || /pothole|road/i.test(trimmed)) {
        cat = "pothole";
        catName = "Road & Pothole Damage";
      } else if (trimmed === "2" || /waste|litter|garbage/i.test(trimmed)) {
        cat = "waste";
        catName = "Public Waste & Litter";
      } else if (trimmed === "3" || /light|street/i.test(trimmed)) {
        cat = "streetlight";
        catName = "Broken Streetlights";
      } else if (trimmed === "4" || /water|drain/i.test(trimmed)) {
        cat = "waterlogging";
        catName = "Waterlogging & Drainage";
      } else if (trimmed === "5" || /obstruct|encroach/i.test(trimmed)) {
        cat = "property";
        catName = "Obstructions & Encroachment";
      } else {
        cat = "other";
        catName = "Other Grievances";
      }

      setChosenCategory(cat);
      setStep(4);
      addBotMessage(`Category set to: **${catName}**.\n\nNow, please write a short **title or description** of the issue in English so our resolution team knows what's wrong.`);
    } 
    else if (step === 4) {
      setComplaintDesc(trimmed);
      setStep(5);
      addBotMessage("Got the details! 📝\n\nNow, please send or upload a **photo** of the issue. You can click the **📷 Photo** icon in the input bar or click **'Attach Photo'** on the controller panel. 📸");
    } 
    else if (step === 5) {
      addBotMessage("Please attach a photo by clicking the **📷 Photo** icon in the chat input bar or on the sidebar to proceed.");
    } 
    else if (step === 6) {
      addBotMessage("Please share your location by clicking the **📍 Location** icon in the chat input bar or on the sidebar to proceed.");
    }
  };

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    const text = userTextInput.trim();
    if (!text || isTyping) return;

    setUserTextInput("");
    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);

    processUserResponse(text);
  };

  // Simulators for attachments
  const simulatePhotoUpload = () => {
    if (step !== 5) return;

    const presets = {
      pothole: "https://images.unsplash.com/photo-1599740831146-80cf4bde309b?w=800&auto=format&fit=crop&q=80",
      waste: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800&auto=format&fit=crop&q=80",
      streetlight: "https://images.unsplash.com/photo-1509024640554-6cad6222b07e?w=800&auto=format&fit=crop&q=80",
      waterlogging: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&auto=format&fit=crop&q=80",
      property: "https://images.unsplash.com/photo-1584467541268-b040f83be3fd?w=800&auto=format&fit=crop&q=80",
      other: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80"
    };

    const photoUrl = presets[chosenCategory] || presets.other;
    setAttachedPhoto(photoUrl);

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: "📸 Attached photo of issue",
        image: photoUrl,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);

    setStep(6);
    addBotMessage("Got the photo! 🔍 Analyzing image...\n\n*System Analysis*: Image matches selected category with high confidence.\n\nNow, please send your **GPS Location** (click the **📍 Location** icon in the chat input bar or on the sidebar) so we can map it.");
  };

  const simulateLocationShare = async () => {
    if (step !== 6) return;

    const loc = { lat: 10.0159, lng: 76.3419, name: "Kakkanad, Ernakulam" };
    setAttachedLoc(loc);

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: "📍 Shared Current Location",
        location: loc,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);

    setStep(7);
    setIsTyping(true);

    let translatedTitle = "";
    let translatedDesc = "";
    try {
      translatedTitle = await translateEnglishToMalayalam(complaintDesc.slice(0, 40), chosenCategory, "title");
      translatedDesc = await translateEnglishToMalayalam(complaintDesc, chosenCategory, "desc");
    } catch (err) {
      console.error("Live translation in WhatsApp Simulator failed:", err);
      translatedTitle = "റോഡിൽ പ്രശ്നം കണ്ടെത്തിയിരിക്കുന്നു";
      translatedDesc = "റോഡിൽ പ്രശ്നം കണ്ടെത്തിയിരിക്കുന്നു. വലിയ അപകടഭീഷണിയാണ് ഇത് ഉണ്ടാക്കുന്നത്.";
    }

    setIsTyping(false);

    addBotMessage(
      `📍 Location coordinates received!\n\n*District*: Ernakulam (EKM)\n*Location*: Kakkanad Junction\n\n📝 **Malayalam Translation Generated**:\n_\"${translatedDesc}\"_\n\n✅ **Success**: Verified & registered successfully! Reference: **#CP-8492**.\n\nClick **'Publish Live'** to post this to the main feed.`,
      1200
    );
  };

  // Sidebar shortcut helpers
  const handleAutoStepName = () => {
    setUserTextInput("Aadi");
    setUserName("Aadi");
    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: "Aadi",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
    setStep(1);
    addBotMessage("Thanks **Aadi**! 🙏\n\nTo prevent spam, all reports require identity verification. Please enter your **10-digit mobile number**.");
  };

  const handleAutoStepPhone = () => {
    setPhone("9876543210");
    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: "9876543210",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
    setStep(2);
    addBotMessage("📲 We have simulated sending a secure 4-digit OTP code to your number.\n\nFor this simulation, please type **8429** to verify your identity.");
  };

  const handleAutoStepOTP = () => {
    setStep(3);
    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: "8429",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
    addBotMessage("🎉 **OTP Verified successfully!**\n\nYour identity is confirmed. Now, please choose a category by typing its **number**:\n\n1. Road & Pothole Damage\n2. Public Waste & Litter\n3. Broken Streetlights\n4. Waterlogging & Drainage\n5. Obstructions & Encroachment\n6. Other Grievances");
  };

  const handleAutoStepCategory = () => {
    setChosenCategory("pothole");
    setStep(4);
    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: "1",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
    addBotMessage("Category set to: **Road & Pothole Damage**.\n\nNow, please write a short **title or description** of the problem in English so our resolution team knows what's wrong.");
  };

  const handleAutoStepDescription = () => {
    const desc = "Huge pothole in the middle of Kakkanad civil station road causing heavy traffic and threat to bikes";
    setComplaintDesc(desc);
    setStep(5);
    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: desc,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
    addBotMessage("Got the details! 📝\n\nNow, please send or upload a **photo** of the issue. You can click the **📷 Photo** icon in the input bar or click **'Attach Photo'** on the controller panel. 📸");
  };

  const handlePublish = async () => {
    let tTitle = "";
    let tDesc = "";
    try {
      tTitle = await translateEnglishToMalayalam(complaintDesc.slice(0, 45), chosenCategory, "title");
      tDesc = await translateEnglishToMalayalam(complaintDesc, chosenCategory, "desc");
    } catch (err) {
      tTitle = "റോഡിൽ പ്രശ്നം കണ്ടെത്തിയിരിക്കുന്നു";
      tDesc = "റോഡിൽ പ്രശ്നം കണ്ടെത്തിയിരിക്കുന്നു. വലിയ അപകടഭീഷണിയാണ് ഇത് ഉണ്ടാക്കുന്നത്.";
    }

    const newComplaint = {
      id: "whatsapp-" + Date.now(),
      category: chosenCategory,
      titleEn: complaintDesc.slice(0, 45) || "Civic Issue reported via WhatsApp",
      titleMl: tTitle,
      descEn: complaintDesc || "Issue reported via WhatsApp chat interface.",
      descMl: tDesc,
      location: attachedLoc?.name || "Kakkanad, Ernakulam",
      district: "EKM",
      lat: attachedLoc?.lat || 10.0159,
      lng: attachedLoc?.lng || 76.3419,
      image: attachedPhoto || "https://images.unsplash.com/photo-1599740831146-80cf4bde309b?w=800&auto=format&fit=crop&q=80",
      createdAt: Date.now(),
      status: "submitted",
      seriousness: "high",
      originalSeriousness: "high",
      citizen: currentUser ? `${currentUser.name} (via WhatsApp)` : `${userName || "WhatsApp Citizen"}`,
      upvotes: 1,
      upvotedBy: [],
      comments: []
    };

    onNewComplaint(newComplaint);
    
    // reset simulator
    setStep(0);
    setUserName("");
    setPhone("");
    setComplaintDesc("");
    setAttachedPhoto("");
    setAttachedLoc(null);
    setMessages([
      {
        sender: "bot",
        text: "👋 Welcome to **UrbanEye** WhatsApp Bot!\n\nTo report a civic issue, please start by typing your **name** below to begin.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
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
          <form onSubmit={handleSendMessage} className="wa-footer">
            <div className="wa-input-mock">
              <Smile size={20} color="#8696a0" />
              {step === 5 && (
                <button type="button" onClick={simulatePhotoUpload} className="wa-attach-btn" title="Simulate Attach Photo">
                  <ImageIcon size={18} color="#00a884" />
                </button>
              )}
              {step === 6 && (
                <button type="button" onClick={simulateLocationShare} className="wa-attach-btn" title="Simulate Share Location">
                  <MapPin size={18} color="#00a884" />
                </button>
              )}
              <input 
                type="text" 
                placeholder="Type a message..." 
                value={userTextInput}
                onChange={(e) => setUserTextInput(e.target.value)}
                disabled={step === 7 || isTyping}
              />
            </div>
            <button 
              type="submit" 
              className="wa-send-btn" 
              disabled={step === 7 || isTyping || !userTextInput.trim()}
            >
              <Send size={16} color="white" />
            </button>
          </form>
        </div>
      </div>

      {/* Simulator Control Board */}
      <div className="sim-dashboard">
        <div className="sim-header">
          <Sparkles size={16} color="var(--accent-color)" />
          <h3>Interactive WhatsApp Pipeline</h3>
        </div>
        <p className="sim-desc">
          Feel free to **type your responses** directly into the WhatsApp input bar inside the phone screen, or use the simulator shortcut triggers below to auto-complete steps.
        </p>

        <div className="sim-buttons">
          <button 
            onClick={handleAutoStepName} 
            className={`sim-action-btn ${step === 0 ? "highlight pulse-glow" : ""}`}
            disabled={step !== 0}
          >
            <KeyRound size={16} />
            <span>1. Set Name ("Aadi")</span>
          </button>

          <button 
            onClick={handleAutoStepPhone} 
            className={`sim-action-btn ${step === 1 ? "highlight pulse-glow" : ""}`}
            disabled={step !== 1}
          >
            <KeyRound size={16} />
            <span>2. Provide Phone ("9876543210")</span>
          </button>

          <button 
            onClick={handleAutoStepOTP} 
            className={`sim-action-btn ${step === 2 ? "highlight pulse-glow" : ""}`}
            disabled={step !== 2}
          >
            <CheckCheck size={16} />
            <span>3. Verify OTP (8429)</span>
          </button>

          <button 
            onClick={handleAutoStepCategory} 
            className={`sim-action-btn ${step === 3 ? "highlight pulse-glow" : ""}`}
            disabled={step !== 3}
          >
            <MessageSquare size={16} />
            <span>4. Pick Category (Pothole)</span>
          </button>

          <button 
            onClick={handleAutoStepDescription} 
            className={`sim-action-btn ${step === 4 ? "highlight pulse-glow" : ""}`}
            disabled={step !== 4}
          >
            <MessageSquare size={16} />
            <span>5. Provide English Description</span>
          </button>

          <button 
            onClick={simulatePhotoUpload} 
            className={`sim-action-btn ${step === 5 ? "highlight pulse-glow" : ""}`}
            disabled={step !== 5}
          >
            <ImageIcon size={16} />
            <span>6. Attach Grievance Photo</span>
          </button>

          <button 
            onClick={simulateLocationShare} 
            className={`sim-action-btn ${step === 6 ? "highlight pulse-glow" : ""}`}
            disabled={step !== 6}
          >
            <MapPin size={16} />
            <span>7. Share GPS Location</span>
          </button>
        </div>

        {step === 7 && (
          <div className="publish-alert glass animate-fade-in">
            <div className="alert-content">
              <h4>🎯 Grievance Formed & Verified</h4>
              <p>The AI chatbot verified your identity OTP, parsed the description, dynamically translated it to Malayalam, and mapped it to Kakkanad. Ready to go live!</p>
            </div>
            <button onClick={handlePublish} className="btn-success">
              Publish Live & Inspect Feed!
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
          flex-shrink: 0;
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
          flex-shrink: 0;
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
          background: transparent;
          border: none;
        }

        .wa-attach-btn {
          background: transparent;
          border: none;
          padding: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform var(--transition-fast);
        }
        .wa-attach-btn:hover {
          transform: scale(1.15);
        }

        .wa-send-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #00a884;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          transition: background var(--transition-fast);
        }
        .wa-send-btn:hover:not(:disabled) {
          background: #008f72;
        }
        .wa-send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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
          text-align: left;
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
          border: none;
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
