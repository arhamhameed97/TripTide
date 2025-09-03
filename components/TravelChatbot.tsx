'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { MessageCircle, Send, X, Bot, User, Loader2, Settings } from 'lucide-react'

interface Message {
  id: string
  content: string
  sender: 'user' | 'bot'
  timestamp: Date
}

interface ChatbotProps {
  onPreferencesUpdate: (preferences: any) => void
  currentFormData: any
}

export default function TravelChatbot({ onPreferencesUpdate, currentFormData }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi! I'm your AI travel assistant. I can help you plan your trip by understanding your preferences and updating your travel form. What kind of trip are you looking for?",
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const generateResponse = async (userMessage: string) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          currentFormData: currentFormData
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Add bot response
        const botMessage: Message = {
          id: Date.now().toString(),
          content: data.response,
          sender: 'bot',
          timestamp: new Date()
        }
        
        setMessages(prev => [...prev, botMessage])
        
        // Update preferences if provided
        if (data.preferencesUpdate) {
          onPreferencesUpdate(data.preferencesUpdate)
        }
      } else {
        throw new Error('Failed to get response')
      }
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: "I'm sorry, I'm having trouble processing your request right now. Please try again.",
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    
    await generateResponse(inputValue)
  }

  const handleQuickActions = (action: string) => {
    const quickMessages = {
      'budget': "I'd like to discuss my budget for this trip. Can you help me optimize my spending?",
      'activities': "What activities would you recommend for my destination?",
      'accommodation': "I need help choosing the right accommodation type for my trip.",
      'dietary': "I have some dietary restrictions. Can you help me plan around them?",
      'accessibility': "I need information about accessibility options for my trip."
    }

    const message = quickMessages[action as keyof typeof quickMessages]
    if (message) {
      // Send the message directly instead of just setting input value
      const userMessage: Message = {
        id: Date.now().toString(),
        content: message,
        sender: 'user',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, userMessage])
      generateResponse(message)
    }
  }

  return (
    <>
      {/* Chatbot Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        size="icon"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
      </Button>

      {/* Chatbot Interface */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 z-50 w-96 h-[500px] shadow-2xl border-0 bg-white">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-lg">
            <div className="flex items-center gap-3">
              <Bot className="h-6 w-6" />
              <div>
                <h3 className="font-semibold">AI Travel Assistant</h3>
                <p className="text-xs opacity-90">I can help you plan your perfect trip!</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 h-[320px]">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-gray-600">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2 mb-3">
              {['budget', 'activities', 'accommodation', 'dietary', 'accessibility'].map((action) => (
                <Button
                  key={action}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickActions(action)}
                  className="text-xs"
                >
                  {action.charAt(0).toUpperCase() + action.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me about your trip..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </Card>
      )}
    </>
  )
}
