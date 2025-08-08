'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import {
  getUserConversations,
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
  getOrCreateConversation,
  uploadMessageAttachment,
  updateConversationStatus,
  type ConversationWithDetails,
  type MessageWithSender,
  type Message
} from '@/lib/supabase'

interface MessageInterfaceProps {
  userId: string
  userType: 'customer' | 'seller'
  initialConversationId?: string
  initialSellerId?: string
  initialProductId?: string
}

export default function MessageInterface({
  userId,
  userType,
  initialConversationId,
  initialSellerId,
  initialProductId
}: MessageInterfaceProps) {
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(
    initialConversationId || null
  )
  const [messages, setMessages] = useState<MessageWithSender[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      setLoading(true)
      console.log('🔄 Loading conversations for:', { userId, userType })
      
      const { data, error } = await getUserConversations(userId, userType)
      
      if (error) {
        console.error('💥 Error loading conversations:', error)
        // Check if it's a table not found error
        if (error.includes('does not exist') || error.includes('relation') || error.includes('conversations')) {
          console.error('🚨 Messaging tables not set up. Please run the database setup SQL.')
          console.error('📁 Check: docs/MESSAGING_SYSTEM_SETUP.sql')
          console.error('📖 Guide: docs/COMPLETE_MESSAGING_SYSTEM_GUIDE.md')
        }
        return
      }
      setConversations(data)
      
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }, [userType, userId])

  const createInitialConversation = useCallback(async () => {
    if (!initialSellerId) return

    try {
      console.log('🔄 Creating initial conversation...', {
        customerId: userType === 'customer' ? userId : initialSellerId,
        sellerId: userType === 'seller' ? userId : initialSellerId,
        productId: initialProductId
      })
      
      const { data: conversationId, error } = await getOrCreateConversation(
        userType === 'customer' ? userId : initialSellerId,
        userType === 'seller' ? userId : initialSellerId,
        initialProductId,
        'Product Inquiry'
      )

      if (error) {
        console.error('❌ Error creating conversation:', error)
        
        // Check for specific error types and show user-friendly messages
        if (error.includes('database functions not set up') || 
            error.includes('does not exist') ||
            error.includes('function get_or_create_conversation')) {
          console.error('🚨 Database setup required!')
          console.error('📁 Please run: docs/SAFE_MESSAGING_SETUP.sql')
          console.error('🔗 In your Supabase dashboard SQL Editor')
        }
        
        // Set a temporary conversation ID to show the input area
        setSelectedConversation('temp-conversation')
        return
      }

      console.log('✅ Initial conversation created:', conversationId)
      setSelectedConversation(conversationId)
      // Reload conversations to show the new one
      setTimeout(() => loadConversations(), 500)
    } catch (error) {
      console.error('❌ Exception in createInitialConversation:', error)
      // Still show input area even if conversation creation fails
      setSelectedConversation('temp-conversation')
    }
  }, [initialSellerId, userType, userId, initialProductId, loadConversations])

  useEffect(() => {
    loadConversations()
  }, [userId, userType, loadConversations])

  useEffect(() => {
    if (initialSellerId && !initialConversationId) {
      // Immediately show interface for new conversations
      setSelectedConversation('new-conversation')
      createInitialConversation()
    }
  }, [initialSellerId, initialConversationId, createInitialConversation])

  // Load messages when conversation changes
  useEffect(() => {
    if (selectedConversation && 
        selectedConversation !== 'new-conversation' && 
        selectedConversation !== 'temp-conversation') {
      loadMessages(selectedConversation)
      markMessagesAsRead(selectedConversation, userId)
    } else if (selectedConversation === 'new-conversation' || selectedConversation === 'temp-conversation') {
      // Clear messages for new conversations
      setMessages([])
    }
  }, [selectedConversation, userId])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Real-time message subscriptions
  useEffect(() => {
    if (!selectedConversation || 
        selectedConversation === 'new-conversation' || 
        selectedConversation === 'temp-conversation') return

    const channel = supabase
      .channel(`messages:${selectedConversation}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversation}`
        },
        (payload) => {
          const newMessage = payload.new as Message
          setMessages(prev => [...prev, { ...newMessage, sender_profile: undefined }])
          
          // Mark as read if it's not from current user
          if (newMessage.sender_id !== userId) {
            markMessagesAsRead(selectedConversation, userId)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedConversation, userId])

  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error } = await getConversationMessages(conversationId)
      if (error) {
        console.error('Error loading messages:', error)
        return
      }
      setMessages(data)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    setSending(true)
    try {
      let attachmentUrl = null
      let attachmentType = null
      let actualConversationId = selectedConversation

      // If this is a new conversation, create it first
      if (selectedConversation === 'new-conversation' || selectedConversation === 'temp-conversation') {
        console.log('🔄 Creating conversation before sending message...')
        const { data: conversationId, error } = await getOrCreateConversation(
          userType === 'customer' ? userId : initialSellerId || '',
          userType === 'seller' ? userId : initialSellerId || '',
          initialProductId,
          'Product Inquiry'
        )

        if (error) {
          console.error('❌ Error creating conversation for message:', error)
          alert('Failed to create conversation. Please try again.')
          return
        }

        actualConversationId = conversationId
        setSelectedConversation(conversationId)
      }

      // Ensure we have a valid conversation ID
      if (!actualConversationId) {
        alert('Please select a conversation first.')
        return
      }

      // Upload attachment if present
      if (attachmentFile) {
        const { data: url, error: uploadError } = await uploadMessageAttachment(
          attachmentFile,
          userId,
          actualConversationId
        )
        if (uploadError) {
          console.error('Error uploading attachment:', uploadError)
        } else {
          attachmentUrl = url
          attachmentType = attachmentFile.type
        }
      }

      const { error } = await sendMessage(
        actualConversationId,
        userId,
        userType,
        newMessage,
        attachmentUrl || undefined,
        attachmentType || undefined
      )

      if (error) {
        console.error('Error sending message:', error)
        alert('Failed to send message. Please try again.')
        return
      }

      setNewMessage('')
      setAttachmentFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      // Reload messages and conversations
      if (actualConversationId !== 'new-conversation' && actualConversationId !== 'temp-conversation') {
        loadMessages(actualConversationId)
        loadConversations()
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to send message. Please check your connection and try again.')
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }
      setAttachmentFile(file)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading conversations...</div>
      </div>
    )
  }

  return (
    <div className="flex h-96 bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-semibold text-gray-900">Messages</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation.id)}
              className={`p-4 cursor-pointer hover:bg-gray-50 ${
                selectedConversation === conversation.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {userType === 'customer' 
                      ? conversation.seller_profile?.business_name || 'Seller'
                      : `${conversation.customer_profile?.first_name || ''} ${conversation.customer_profile?.last_name || ''}`.trim() || 'Customer'
                    }
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {conversation.subject}
                  </p>
                  {conversation.last_message && (
                    <p className="text-xs text-gray-400 truncate">
                      {conversation.last_message.message_text}
                    </p>
                  )}
                </div>
                {conversation.unread_count ? (
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                    {conversation.unread_count}
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {formatTime(conversation.last_message_at)}
              </p>
            </div>
          ))}
        </div>
        {conversations.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            No conversations yet
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Messages Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-gray-900">
                  {selectedConversation === 'new-conversation' || selectedConversation === 'temp-conversation'
                    ? 'New Message'
                    : conversations.find(c => c.id === selectedConversation)?.subject || 'Message'
                  }
                </h4>
                {selectedConversation !== 'new-conversation' && selectedConversation !== 'temp-conversation' && (
                  <select
                    value={conversations.find(c => c.id === selectedConversation)?.status || 'active'}
                    onChange={(e) => updateConversationStatus(selectedConversation, e.target.value as 'active' | 'closed' | 'archived')}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                    <option value="archived">Archived</option>
                  </select>
                )}
              </div>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === userId ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender_id === userId
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.message_text}</p>
                    {message.attachment_url && (
                      <div className="mt-2">
                        {message.attachment_type?.startsWith('image/') ? (
                          <Image
                            src={message.attachment_url}
                            alt="Attachment"
                            width={200}
                            height={150}
                            className="max-w-full h-auto rounded"
                          />
                        ) : (
                          <a
                            href={message.attachment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-200 underline text-sm"
                          >
                            View Attachment
                          </a>
                        )}
                      </div>
                    )}
                    <p className="text-xs mt-1 opacity-75">
                      {formatTime(message.created_at)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              {attachmentFile && (
                <div className="mb-2 p-2 bg-gray-100 rounded flex justify-between items-center">
                  <span className="text-sm text-gray-600">{attachmentFile.name}</span>
                  <button
                    onClick={() => setAttachmentFile(null)}
                    className="text-red-500 text-sm"
                  >
                    Remove
                  </button>
                </div>
              )}
              <div className="flex space-x-2">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 p-2 border border-gray-300 rounded-lg resize-none text-black"
                  rows={2}
                />
                <div className="flex flex-col space-y-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    📎
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={sending || !newMessage.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? '...' : 'Send'}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  )
}
