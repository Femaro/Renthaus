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
import { Send, MessageSquare } from 'lucide-react'
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
    if (userData) {
      loadConversations()
    }
  }, [userData])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation)
    }
  }, [selectedConversation])

  const loadConversations = async () => {
    if (!userData) return
    try {
      const q = query(
        collection(db, 'conversations'),
        where('participantIds', 'array-contains', userData.uid),
        orderBy('updatedAt', 'desc')
      )
      const snapshot = await getDocs(q)
      setConversations(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Conversation & { id: string })))
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = (conversationId: string) => {
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Message & { id: string })))
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

      // Update conversation
      const conversation = conversations.find((c) => c.id === selectedConversation)
      if (conversation) {
        // Update last message in conversation (should be done via API route)
      }

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
    return <div className="text-white">Loading messages...</div>
  }

  const currentConversation = conversations.find((c) => c.id === selectedConversation)

  return (
    <div className="flex h-[calc(100vh-200px)]">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-white/10 pr-4">
        <h2 className="text-2xl font-bold text-white mb-4">Conversations</h2>
        <div className="space-y-2 overflow-y-auto">
          {conversations.map((conversation) => {
            const otherParticipantId = conversation.participantIds.find((id) => id !== userData?.uid)
            const otherParticipantName = conversation.participantNames[otherParticipantId || '']
            return (
              <Card
                key={conversation.id}
                variant="glass"
                hover
                className={`p-4 cursor-pointer ${
                  selectedConversation === conversation.id ? 'border-primary border-2' : ''
                }`}
                onClick={() => setSelectedConversation(conversation.id)}
              >
                <h3 className="text-white font-semibold mb-1">{otherParticipantName}</h3>
                {conversation.lastMessage && (
                  <p className="text-gray-400 text-sm truncate">
                    {conversation.lastMessage.content}
                  </p>
                )}
              </Card>
            )
          })}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 flex flex-col pl-4">
        {selectedConversation ? (
          <>
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-white">
                {currentConversation?.participantNames[
                  currentConversation.participantIds.find((id) => id !== userData?.uid) || ''
                ]}
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === userData?.uid ? 'justify-end' : 'justify-start'}`}
                >
                  <Card
                    variant={message.senderId === userData?.uid ? 'glass-red' : 'glass'}
                    className={`max-w-md p-4 ${
                      message.senderId === userData?.uid ? 'ml-auto' : 'mr-auto'
                    }`}
                  >
                    <p className="text-white">{message.content}</p>
                    <p className="text-gray-400 text-xs mt-2">
                      {message.createdAt.toDate().toLocaleTimeString()}
                    </p>
                  </Card>
                </div>
              ))}
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
              <MessageSquare className="mx-auto mb-4 text-gray-600" size={48} />
              <p className="text-gray-300 text-xl">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

