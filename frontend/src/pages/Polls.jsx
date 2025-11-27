import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Input, Textarea, Select, Loading, EmptyState, Badge } from '../components/UI';
import api from '../utils/api';

export const Polls = () => {
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
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/polls', formData);
      setFormData({ question: '', description: '', options: ['', ''], endsAt: '' });
      setShowForm(false);
      fetchPolls();
    } catch (error) {
      console.error('Failed to create poll', error);
    }
  };

  const handleVote = async (pollId, optionIndex) => {
    try {
      await api.post(`/polls/${pollId}/vote`, { optionIndex });
      setUserVotes({ ...userVotes, [pollId]: optionIndex });
      fetchPolls();
    } catch (error) {
      console.error('Failed to vote', error);
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

                  <p className="text-xs text-textLight text-center">
                    Total Votes: {totalVotes} • {poll.status === 'active' ? 'Voting Active' : 'Voting Closed'}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No Polls" description="Check back later for new polls" icon="🗳️" />
      )}
    </div>
  );
};
