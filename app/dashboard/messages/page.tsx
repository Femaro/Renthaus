'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, addDoc, onSnapshot, orderBy, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Conversation, Message } from '@/lib/firebase/types'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useAuth } from '@/contexts/AuthContext'
import { useSearchParams } from 'next/navigation'
import { Send, MessageSquare, Clock, Check, CheckCheck } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MessagesPage() {
  const { userData } = useAuth()
  const searchParams = useSearchParams()
  const [conversations, setConversations] = useState<(Conversation & { id: string })[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(
    searchParams?.get('conversationId') || null
  )
  const [messages, setMessages] = useState<(Message & { id: string })[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (selectedConversation && db) {
      const unsubscribe = loadMessages(selectedConversation)
      return () => {
        if (unsubscribe) unsubscribe()
      }
    }
  }, [selectedConversation])

  useEffect(() => {
    if (!userData || !db) return

    // Real-time listener for conversations
    const q = query(
      collection(db, 'conversations'),
      where('participantIds', 'array-contains', userData.uid),
      orderBy('updatedAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setConversations(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Conversation & { id: string })))
      setLoading(false)
    }, (error) => {
      console.error('Error loading conversations:', error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [userData])

  const loadMessages = (conversationId: string) => {
    if (!db) return

    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Message & { id: string }))
      setMessages(loadedMessages)
      
      // Auto-scroll to bottom
      setTimeout(() => {
        const messagesContainer = document.getElementById('messages-container')
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight
        }
      }, 100)
    }, (error) => {
      console.error('Error loading messages:', error)
      toast.error('Failed to load messages')
    })

    return unsubscribe
  }

  const sendMessage = async () => {
    if (!userData || !selectedConversation || !newMessage.trim()) return

    try {
      await addDoc(collection(db, 'messages'), {
        conversationId: selectedConversation,
        senderId: userData.uid,
        senderName: userData.displayName,
        receiverId: conversations.find((c) => c.id === selectedConversation)
          ?.participantIds.find((id) => id !== userData.uid) || '',
        content: newMessage,
        read: false,
        createdAt: Timestamp.now(),
      })

      // Trigger email notification
      fetch('/api/notifications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'new_message',
          customerEmail: '', // Will be fetched from user document
          message: `You have a new message from ${userData.displayName}`,
        }),
      }).catch(console.error)

      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    }
  }

  const createConversation = async (otherUserId: string, otherUserName: string) => {
    if (!userData) return

    try {
      const conversationData: Omit<Conversation, 'id'> = {
        participantIds: [userData.uid, otherUserId],
        participantNames: {
          [userData.uid]: userData.displayName,
          [otherUserId]: otherUserName,
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }

      const docRef = await addDoc(collection(db, 'conversations'), conversationData)
      setSelectedConversation(docRef.id)
      loadConversations()
    } catch (error) {
      console.error('Error creating conversation:', error)
      toast.error('Failed to create conversation')
    }
  }

  if (loading) {
    return <div className="text-gray-700">Loading messages...</div>
  }

  const currentConversation = conversations.find((c) => c.id === selectedConversation)

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-200px)] gap-4">
      {/* Conversations List */}
      <div className="w-full md:w-1/3 border-r-0 md:border-r border-gray-200 pr-0 md:pr-4">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Conversations</h2>
        <div className="space-y-2 overflow-y-auto max-h-[300px] md:max-h-full">
          {conversations.map((conversation) => {
            const otherParticipantId = conversation.participantIds.find((id) => id !== userData?.uid)
            const otherParticipantName = conversation.participantNames[otherParticipantId || '']
            return (
              <Card
                key={conversation.id}
                variant="default"
                hover
                className={`p-4 cursor-pointer ${
                  selectedConversation === conversation.id ? 'border-primary border-2' : ''
                }`}
                onClick={() => setSelectedConversation(conversation.id)}
              >
                <h3 className="text-gray-900 font-semibold mb-1">{otherParticipantName}</h3>
                {conversation.lastMessage && (
                  <p className="text-gray-600 text-sm truncate">
                    {conversation.lastMessage.content}
                  </p>
                )}
              </Card>
            )
          })}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 flex flex-col pl-0 md:pl-4">
        {selectedConversation ? (
          <>
            <div className="mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">
                {currentConversation?.participantNames[
                  currentConversation.participantIds.find((id) => id !== userData?.uid) || ''
                ]}
              </h2>
            </div>
            <div id="messages-container" className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="mx-auto mb-2 text-gray-400" size={32} />
                  <p className="text-gray-500">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === userData?.uid ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-md ${message.senderId === userData?.uid ? 'ml-auto' : 'mr-auto'}`}>
                      <Card
                        variant="default"
                        className={`p-4 ${
                          message.senderId === userData?.uid 
                            ? 'bg-primary text-white' 
                            : 'bg-white border border-gray-200'
                        }`}
                      >
                        <p className={message.senderId === userData?.uid ? 'text-white' : 'text-gray-900'}>
                          {message.content}
                        </p>
                        <div className={`flex items-center gap-2 mt-2 ${
                          message.senderId === userData?.uid ? 'text-white/70' : 'text-gray-500'
                        }`}>
                          <span className="text-xs">
                            {message.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {message.senderId === userData?.uid && (
                            <span className="text-xs">
                              {message.read ? (
                                <CheckCheck size={12} className="inline" />
                              ) : (
                                <Check size={12} className="inline" />
                              )}
                            </span>
                          )}
                        </div>
                      </Card>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1"
              />
              <Button onClick={sendMessage}>
                <Send size={20} />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageSquare className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-600 text-xl">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

