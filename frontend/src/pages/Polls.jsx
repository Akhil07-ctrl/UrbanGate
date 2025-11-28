import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import { Card, Button, Loading, EmptyState, Badge, Modal, Input } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export const Polls = () => {
  const { user } = useAuth();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [userVotes, setUserVotes] = useState({});
  const [formData, setFormData] = useState({
    question: '',
    description: '',
    options: ['', ''],
    endsAt: '',
  });

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const response = await api.get('/polls');
      setPolls(response.data.polls || []);
    } catch (error) {
      console.error('Failed to fetch polls', error);
      if (error.response?.status === 400) {
        toast.error('You must be part of a community to view polls', {
          position: 'top-right',
          autoClose: 3000
        });
      } else {
        toast.error('Failed to fetch polls', {
          position: 'top-right',
          autoClose: 3000
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Filter out empty options
      const validOptions = formData.options.filter(opt => opt.trim() !== '');
      if (validOptions.length < 2) {
        toast.error('Please provide at least 2 options', {
          position: 'top-right',
          autoClose: 3000
        });
        return;
      }

      await api.post('/polls', {
        ...formData,
        options: validOptions
      });
      toast.success('Poll created successfully', {
        position: 'top-right',
        autoClose: 3000
      });
      setFormData({ question: '', description: '', options: ['', ''], endsAt: '' });
      setShowForm(false);
      fetchPolls();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create poll', {
        position: 'top-right',
        autoClose: 3000
      });
    }
  };

  const handleVote = async (pollId, optionIndex) => {
    try {
      await api.post(`/polls/${pollId}/vote`, { optionIndex });
      toast.success('Vote recorded successfully', {
        position: 'top-right',
        autoClose: 2000
      });
      setUserVotes({ ...userVotes, [pollId]: optionIndex });
      fetchPolls();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to vote', {
        position: 'top-right',
        autoClose: 3000
      });
    }
  };

  const handleClosePoll = async (pollId) => {
    try {
      await api.post(`/polls/${pollId}/close`);
      toast.success('Poll closed successfully', {
        position: 'top-right',
        autoClose: 3000
      });
      fetchPolls();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to close poll', {
        position: 'top-right',
        autoClose: 3000
      });
    }
  };

  const addOption = () => {
    setFormData({ ...formData, options: [...formData.options, ''] });
  };

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData({ ...formData, options: newOptions });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-text">Community Polls</h1>
        {user?.role === 'admin' && (
          <Button onClick={() => setShowForm(true)}>+ Create Poll</Button>
        )}
      </div>

      {/* Polls List */}
      {polls.length > 0 ? (
        <div className="space-y-6">
          {polls.map((poll) => {
            const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

            return (
              <Card key={poll._id}>
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-text">{poll.question}</h2>
                      <p className="text-textLight text-sm">{poll.description}</p>
                    </div>
                    <Badge variant={poll.status === 'active' ? 'success' : 'warning'}>{poll.status}</Badge>
                  </div>

                  <div className="space-y-3">
                    {poll.options.map((option, index) => {
                      const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                      const hasVoted = userVotes[poll._id] === index;

                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-text font-medium">{option.text}</span>
                            <span className="text-textLight text-sm">
                              {option.votes} vote{option.votes !== 1 ? 's' : ''} ({percentage.toFixed(1)}%)
                            </span>
                          </div>

                          <div className="w-full bg-tertiary rounded-full h-2">
                            <div
                              className="bg-text h-2 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>

                          {poll.status === 'active' && (
                            <Button
                              onClick={() => handleVote(poll._id, index)}
                              variant={hasVoted ? 'primary' : 'secondary'}
                              size="sm"
                              className="w-full"
                            >
                              {hasVoted ? '✓ Voted' : 'Vote'}
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-xs text-textLight">
                      Total Votes: {totalVotes} • {poll.status === 'active' ? 'Voting Active' : 'Voting Closed'}
                    </p>
                    {user?.role === 'admin' && poll.status === 'active' && (
                      <Button
                        onClick={() => handleClosePoll(poll._id)}
                        variant="secondary"
                        size="sm"
                      >
                        Close Poll
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No Polls" description="Check back later for new polls" icon="🗳️" />
      )}

      {/* Create Poll Modal (Admin) */}
      {user?.role === 'admin' && (
        <Modal
          isOpen={showForm}
          title="Create Poll"
          onClose={() => {
            setShowForm(false);
            setFormData({ question: '', description: '', options: ['', ''], endsAt: '' });
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Question"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              required
              placeholder="What is your question?"
            />

            <div>
              <label className="block text-sm font-medium text-[#333333] mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add more details about this poll..."
                className="w-full px-4 py-2 border border-[#d9d9d9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#333333]"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#333333] mb-2">Options</label>
              {formData.options.map((option, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...formData.options];
                      newOptions[index] = e.target.value;
                      setFormData({ ...formData, options: newOptions });
                    }}
                    required
                    placeholder={`Option ${index + 1}`}
                  />
                  {formData.options.length > 2 && (
                    <Button
                      type="button"
                      onClick={() => removeOption(index)}
                      variant="danger"
                      size="sm"
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                onClick={addOption}
                variant="secondary"
                size="sm"
                className="w-full"
              >
                + Add Option
              </Button>
            </div>

            <Input
              label="End Date (Optional)"
              type="datetime-local"
              value={formData.endsAt}
              onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ question: '', description: '', options: ['', ''], endsAt: '' });
                }}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Create Poll
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
