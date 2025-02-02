"use client";
import { useState, useEffect } from "react";

export default function VotingPage() {
  const [policies, setPolicies] = useState([]);
  const [votes, setVotes] = useState({});
  const [expandedPolicies, setExpandedPolicies] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const response = await fetch('/api/votepolicies');
      if (!response.ok) throw new Error('Failed to fetch policies');
      const data = await response.json();
      setPolicies(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (policyId, vote) => {
    if (votes[policyId]) return;

    try {
      const response = await fetch('/api/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ policyId, vote })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      setVotes(prev => ({ ...prev, [policyId]: vote }));
    } catch (error) {
      console.error('Voting failed:', error);
    }
  };

  const toggleDescription = (policyId) => {
    setExpandedPolicies(prev => ({
      ...prev,
      [policyId]: !prev[policyId]
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-[#403cd5] mb-8 text-center">Vote on Policies</h2>

      {loading && <div className="text-center">Loading...</div>}
      {error && <div className="text-center text-red-500">Error: {error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto">
        {policies.map((policy) => (
          <div 
            key={policy._id} 
            className="flex flex-col h-full bg-white shadow-lg rounded-lg overflow-hidden border border-[#403cd5]/10 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="p-6 flex-grow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-[#403cd5] flex-grow">{policy.title}</h3>
                <span className="text-sm bg-[#403cd5]/10 px-3 py-1 rounded-full ml-2 whitespace-nowrap">
                  {policy.category}
                </span>
              </div>
              
              <p className="text-gray-600">{policy.shortDescription}</p>
              
              <button 
                onClick={() => toggleDescription(policy._id)}
                className="text-[#403cd5] text-sm mt-4 hover:underline inline-flex items-center"
              >
                {expandedPolicies[policy._id] ? 'Show Less' : 'Read More'}
                <svg 
                  className={`w-4 h-4 ml-1 transition-transform ${expandedPolicies[policy._id] ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {expandedPolicies[policy._id] && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">{policy.description}</p>
                </div>
              )}
            </div>

            <div className="p-6 bg-gray-50 border-t border-[#403cd5]/10">
              <p className="text-sm text-gray-500 mb-4">
                Voting period: {new Date(policy.votingStartDate).toLocaleDateString()} - {new Date(policy.votingEndDate).toLocaleDateString()}
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => handleVote(policy._id, "yes")}
                  className={`flex-1 py-2 rounded-lg text-white text-center transition ${
                    votes[policy._id] 
                      ? "bg-gray-400 cursor-not-allowed" 
                      : "bg-[#403cd5] hover:bg-[#403cd5]/90"
                  }`}
                  disabled={votes[policy._id]}
                >
                  Yes
                </button>
                <button
                  onClick={() => handleVote(policy._id, "no")}
                  className={`flex-1 py-2 rounded-lg text-white text-center transition ${
                    votes[policy._id] 
                      ? "bg-gray-400 cursor-not-allowed" 
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                  disabled={votes[policy._id]}
                >
                  No
                </button>
              </div>

              {votes[policy._id] && (
                <p className="text-sm text-gray-500 text-center mt-3">
                  You voted "{votes[policy._id]}"
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
