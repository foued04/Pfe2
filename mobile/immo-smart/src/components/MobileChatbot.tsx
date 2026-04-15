import React, { useState, useRef, useEffect } from 'react';
import {
  IonFab,
  IonFabButton,
  IonIcon,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonFooter,
  IonInput,
  IonList,
  IonItem,
  IonAvatar,
  IonText,
  IonSpinner
} from '@ionic/react';
import { chatbubbleEllipsesOutline, closeOutline, sendOutline, sparklesOutline } from 'ionicons/icons';
import { useAuth } from '../lib/auth-context';
import './MobileChatbot.css';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

const MobileChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      content: 'Bonjour ! Je suis l\'assistant ImmoSmart. Comment puis-je vous aider aujourd\'hui ?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { token, user } = useAuth();
  const contentRef = useRef<HTMLIonContentElement>(null);

  const scrollToBottom = () => {
    contentRef.current?.scrollToBottom(300);
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const textToSend = input;
    setInput('');
    setIsTyping(true);

    try {
      const history = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({
          role: m.role,
          parts: [{ text: m.content }]
        }));

      const response = await fetch(`${import.meta.env.VITE_API_URL}/chatbot/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          message: textToSend,
          history: history
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erreur');

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'model',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chatbot Error:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        content: 'Désolé, je rencontre un problème technique. Réessayez plus tard.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <IonFab vertical="bottom" horizontal="end" slot="fixed" className="chatbot-fab">
        <IonFabButton onClick={() => setIsOpen(true)} color="primary" className="pulse-button">
          <IonIcon icon={chatbubbleEllipsesOutline} />
        </IonFabButton>
      </IonFab>

      <IonModal isOpen={isOpen} onDidDismiss={() => setIsOpen(false)} className="chatbot-modal">
        <IonHeader className="ion-no-border">
          <IonToolbar className="chatbot-toolbar">
            <IonButtons slot="start">
              <div className="bot-avatar-header">
                    <IonIcon icon={sparklesOutline} />
              </div>
            </IonButtons>
            <IonTitle>
              <div className="title-container">
                <IonText className="main-title">Assistant ImmoSmart</IonText>
                <div className="status-container">
                  <span className="online-dot"></span>
                  <IonText className="status-text">Expert IA</IonText>
                </div>
              </div>
            </IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setIsOpen(false)}>
                <IonIcon icon={closeOutline} color="medium" />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent ref={contentRef} className="chatbot-content">
          <div className="welcome-banner">
            <IonIcon icon={sparklesOutline} />
            <p>Posez vos questions sur la location, le mobilier ou vos contrats.</p>
          </div>
          
          <IonList lines="none" className="message-list">
            {messages.map((m) => (
              <div key={m.id} className={`message-wrapper ${m.role}`}>
                {m.role === 'model' && (
                  <div className="message-avatar">
                       <IonIcon icon={sparklesOutline} />
                  </div>
                )}
                <div className="message-bubble">
                  <p>{m.content}</p>
                  <span className="message-time">
                    {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message-wrapper model">
                <div className="message-avatar">
                      <IonIcon icon={sparklesOutline} />
                </div>
                <div className="message-bubble typing">
                  <IonSpinner name="dots" color="primary" />
                </div>
              </div>
            )}
          </IonList>
        </IonContent>

        <IonFooter className="ion-no-border chatbot-footer">
          <IonToolbar>
            <div className="input-container">
              <IonInput
                value={input}
                placeholder="Votre message..."
                onIonChange={e => setInput(e.detail.value!)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                className="chatbot-input"
              />
              <IonButton fill="clear" onClick={handleSend} disabled={!input.trim() || isTyping}>
                <IonIcon icon={sendOutline} slot="icon-only" />
              </IonButton>
            </div>
          </IonToolbar>
        </IonFooter>
      </IonModal>
    </>
  );
};

export default MobileChatbot;
