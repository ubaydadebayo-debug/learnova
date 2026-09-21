import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Bot, BookOpen, MessageSquareText, Plus, SendHorizonal, Sparkles } from 'lucide-react';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { createConversation, getConversation, listConversations, sendMessage } from '../../services/aiService';

export default function StudentAITutorPage() {
  const { conversationId: routeConversationId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const selectedId = routeConversationId ?? '';
  const selectedConversation = conversations.find((item) => item.id === selectedId) ?? null;
  const contextState = location.state?.courseId ? location.state : null;

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await listConversations();
        const items = response.data.conversations ?? [];
        setConversations(items);

        if (contextState) {
          const createdResponse = await createConversation({
            courseId: contextState.courseId,
            lessonId: contextState.lessonId,
          });
          const created = createdResponse.data.conversation;
          setConversations((current) => [created, ...current.filter((item) => item.id !== created.id)]);
          navigate(`/student/ai-tutor/${created.id}`, { replace: true });
          return;
        }

        if (!routeConversationId && items[0]) {
          navigate(`/student/ai-tutor/${items[0].id}`, { replace: true });
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!routeConversationId) {
      setMessages([]);
      return;
    }

    let cancelled = false;
    getConversation(routeConversationId)
      .then((response) => {
        if (!cancelled) setMessages(response.data.conversation?.messages ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      });
    return () => {
      cancelled = true;
    };
  }, [routeConversationId]);

  const handleSelectConversation = (conversationId) => {
    setError(null);
    navigate(`/student/ai-tutor/${conversationId}`);
  };

  const handleCreateConversation = async () => {
    setError(null);
    try {
      const response = await createConversation({ title: 'New conversation' });
      const conversation = response.data.conversation;
      setConversations((current) => [conversation, ...current]);
      navigate(`/student/ai-tutor/${conversation.id}`);
    } catch (err) {
      setError(err);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedId || !draft.trim()) return;

    const message = draft.trim();
    setDraft('');
    setSending(true);
    setError(null);

    try {
      const response = await sendMessage(selectedId, { message });
      const nextConversation = response.data.conversation;
      setMessages(nextConversation?.messages ?? []);
      setConversations((current) =>
        current.map((item) =>
          item.id === nextConversation?.id
            ? { ...item, title: nextConversation.title, updatedAt: nextConversation.updatedAt }
            : item
        )
      );
    } catch (err) {
      setError(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="container-page py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-secondary">AI Tutor</p>
          <h1 className="text-3xl font-extrabold">Your personal study coach</h1>
          <p className="mt-2 text-navy/60">Ask for explanations, practice questions, or a study plan tailored to the lesson you are learning.</p>
        </div>
        <Button onClick={handleCreateConversation}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          New chat
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-error/30 bg-error/10 p-3 text-sm text-error">
          {error.message}
        </div>
      )}

      <div className="grid min-h-[620px] gap-4 rounded-2xl border border-line bg-white p-4 shadow-sm lg:grid-cols-[280px_1fr]">
        <aside className="rounded-2xl border border-line bg-surface p-3">
          <div className="mb-3 flex items-center gap-2 px-2 text-sm font-semibold text-navy/70">
            <MessageSquareText className="h-4 w-4 text-primary" aria-hidden="true" />
            Conversations
          </div>
          <div className="space-y-2">
            {loading ? (
              <div className="flex justify-center py-10"><Spinner className="border-primary/30 border-t-primary" /></div>
            ) : conversations.length === 0 ? (
              <div className="rounded-xl border border-dashed border-line bg-white p-4 text-sm text-navy/60">
                No conversations yet. Start by asking your first question.
              </div>
            ) : (
              conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => handleSelectConversation(conversation.id)}
                  className={`w-full rounded-xl border p-3 text-left transition-colors ${
                    selectedConversation?.id === conversation.id
                      ? 'border-primary bg-primary/5 text-navy'
                      : 'border-transparent bg-white hover:border-line'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="line-clamp-1 font-semibold">{conversation.title}</span>
                    <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                  </div>
                  <p className="mt-1 truncate text-xs text-navy/50">{conversation.lesson?.title || conversation.course?.title || 'General study chat'}</p>
                  <p className="mt-0.5 text-xs text-navy/40">{new Date(conversation.updatedAt).toLocaleString()}</p>
                </button>
              ))
            )}
          </div>
        </aside>

        <div className="flex min-h-[560px] flex-col rounded-2xl border border-line bg-background">
          {selectedId ? (
            <>
              <div className="border-b border-line bg-white px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Bot className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-bold">{selectedConversation?.title ?? 'Tutor chat'}</p>
                    {selectedConversation?.lesson ? (
                      <p className="flex items-center gap-1 truncate text-xs text-navy/50">
                        <BookOpen className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        {selectedConversation.lesson.title} · {selectedConversation.course?.title}
                      </p>
                    ) : selectedConversation?.course ? (
                      <p className="flex items-center gap-1 truncate text-xs text-navy/50">
                        <BookOpen className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        {selectedConversation.course.title}
                      </p>
                    ) : (
                      <p className="text-xs text-navy/50">General study support</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto p-5">
                {messages.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-line bg-white p-6 text-sm text-navy/60">
                    Start the conversation with a question about your lesson or topic.
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'USER' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          message.role === 'USER'
                            ? 'bg-primary text-white'
                            : 'border border-line bg-white text-navy'
                        }`}
                      >
                        <p className="whitespace-pre-line">{message.content}</p>
                        <p className={`mt-2 text-[10px] ${message.role === 'USER' ? 'text-white/70' : 'text-navy/40'}`}>
                          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSubmit} className="border-t border-line bg-white p-4">
                <div className="flex gap-3">
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    rows={3}
                    placeholder="Ask about a lesson, concept, or study plan..."
                    className="w-full resize-none rounded-xl border border-line bg-background px-3 py-2.5 text-sm text-navy outline-none focus:border-primary"
                  />
                  <Button type="submit" disabled={sending || !draft.trim()} className="self-end">
                    {sending ? <Spinner className="border-white/30 border-t-white" /> : <SendHorizonal className="h-4 w-4" aria-hidden="true" />}
                    Send
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-center text-navy/60">
              Start a conversation with your AI tutor to get help learning.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}