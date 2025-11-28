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
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Community Polls</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Participate in community decisions and share your opinion
          </p>
        </div>
        {user?.role === 'admin' && (
          <Button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create Poll
          </Button>
        )}
      </div>

      {/* Polls List */}
      <div className="space-y-6">
        {polls.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {polls.map((poll) => {
              const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
              const hasVoted = userVotes[poll._id] !== undefined;
              const isActive = poll.status === 'active';
              const userVoteIndex = userVotes[poll._id];

              return (
                <div 
                  key={poll._id} 
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{poll.question}</h2>
                        {poll.description && (
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{poll.description}</p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {isActive ? 'Active' : 'Closed'}
                      </span>
                    </div>

                    <div className="space-y-4 mt-6">
                      {poll.options.map((option, index) => {
                        const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                        const isUserVote = hasVoted && userVoteIndex === index;
                        
                        return (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className={`text-sm font-medium ${
                                isUserVote 
                                  ? 'text-indigo-700 dark:text-indigo-300' 
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}>
                                {option.text}
                                {isUserVote && (
                                  <span className="ml-2 text-xs text-indigo-600 dark:text-indigo-400">
                                    (Your vote)
                                  </span>
                                )}
                              </span>
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                {percentage.toFixed(1)}%
                              </span>
                            </div>

                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  isUserVote 
                                    ? 'bg-indigo-600' 
                                    : isActive 
                                      ? 'bg-indigo-400' 
                                      : 'bg-gray-400'
                                }`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {option.votes} vote{option.votes !== 1 ? 's' : ''}
                              </span>
                              {isActive && !hasVoted && (
                                <button
                                  onClick={() => handleVote(poll._id, index)}
                                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                                >
                                  Vote
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>{totalVotes} total vote{totalVotes !== 1 ? 's' : ''}</span>
                          {poll.endsAt && (
                            <span className="mx-2">•</span>
                          )}
                          {poll.endsAt && (
                            <div className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>
                                {isActive 
                                  ? `Closes ${new Date(poll.endsAt).toLocaleDateString()}` 
                                  : `Closed on ${new Date(poll.endsAt).toLocaleDateString()}`}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {user?.role === 'admin' && isActive && (
                          <button
                            onClick={() => handleClosePoll(poll._id)}
                            className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-white hover:bg-red-600 rounded-lg border border-red-600 hover:border-transparent transition-colors"
                          >
                            Close Poll
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState 
            title="No Active Polls"
            description={user?.role === 'admin' 
              ? 'Create a new poll to engage with your community' 
              : 'There are no active polls at the moment. Check back later!'}
            icon="🗳️"
            action={
              user?.role === 'admin' 
                ? { text: 'Create Your First Poll', onClick: () => setShowForm(true) }
                : null
            }
          />
        )}
      </div>

      {/* Create Poll Modal (Admin) */}
      {user?.role === 'admin' && (
        <Modal
          isOpen={showForm}
          title="Create New Poll"
          onClose={() => {
            setShowForm(false);
            setFormData({ question: '', description: '', options: ['', ''], endsAt: '' });
          }}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Question <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                required
                placeholder="What is your question?"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add more context or details about this poll..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                rows="3"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Poll Options <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-gray-500">Minimum 2 options required</span>
              </div>
              
              <div className="space-y-2 mb-3">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...formData.options];
                          newOptions[index] = e.target.value;
                          setFormData({ ...formData, options: newOptions });
                        }}
                        required
                        placeholder={`Option ${index + 1}`}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    {formData.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                        aria-label="Remove option"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              <button
                type="button"
                onClick={addOption}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add another option
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date (Optional)
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={formData.endsAt}
                  onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  min={new Date().toISOString().slice(0, 16)}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Leave empty if the poll should stay open indefinitely
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ question: '', description: '', options: ['', ''], endsAt: '' });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Create Poll
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
