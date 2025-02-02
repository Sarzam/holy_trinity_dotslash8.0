"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import TypewriterComponent from "typewriter-effect";
import { FiSend } from 'react-icons/fi';

export default function PolicyPage() {
  const [started, setStarted] = useState(false);
  const [policies, setPolicies] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [expandedPolicy, setExpandedPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const fetchUserProfile = async () => {
    try {
      const token = sessionStorage.getItem("user-auth-token");
      if (!token) {
        console.log("No auth token found");
        return;
      }

      const response = await fetch(`/api/user/info`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "user-data": token,
        },
      });

      if (response.status === 401) {
        // Handle unauthorized access
        sessionStorage.removeItem("user-auth-token");
        window.location.href = "/login";
        return;
      }

      const data = await response.json();
      if (data.success && data.data) {
        setUserProfile(data.data);
      } else {
        console.error("Error fetching profile:", data.message);
        setUserProfile(null);
      }
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
      setUserProfile(null);
    }
  };

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/recommendpolicies");
      
      if (response.data.success && Array.isArray(response.data.policies)) {
        setPolicies(response.data.policies);
      } else {
        console.error("Invalid response:", response.data);
      }
    } catch (error) {
      console.error("Error fetching policies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setIsSearching(true);
    setChatHistory(prev => [...prev, { type: 'user', content: userInput }]);
    
    try {
      const token = sessionStorage.getItem("user-auth-token");
      const response = await axios.post("/api/recommendpolicies", {
        message: userInput,
        userId: token
      });
      
      if (response.data.success) {
        setChatHistory(prev => [...prev, { 
          type: 'assistant', 
          content: "Here are some policies that might interest you:" 
        }]);

        const formattedPolicies = response.data.policies.map(policy => {
          const [title, benefit, requiredDocuments,  websiteLink] = policy.split('^').map(item => item.trim());
          return {
            title: title || "Untitled Policy",
            benefit: benefit || "No benefits listed",
            requiredDocuments: requiredDocuments || "No documents specified",
            websiteLink: websiteLink || "#"
          };
        });

        setPolicies(formattedPolicies);
      }
    } catch (error) {
      console.error("Error:", error);
      setChatHistory(prev => [...prev, { 
        type: 'assistant', 
        content: "Sorry, I encountered an error processing your request." 
      }]);
    } finally {
      setIsSearching(false);
      setUserInput("");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchUserProfile();
      await fetchPolicies();
      setLoading(false);
    };

    loadData();
  }, []);

  const togglePolicyDetails = (id) => {
    setExpandedPolicy(expandedPolicy === id ? null : id);
  };

  const welcomeText = "Welcome to Policy Advisor AI";
  const subtitleText = "I can help you find the perfect insurance policies based on your profile.";

  if (!started) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 max-w-2xl mx-auto p-4"
        >
          <h1 className="text-4xl font-bold text-[#403cd5]">
            <TypewriterComponent
              options={{
                strings: [welcomeText],
                autoStart: true,
                loop: false,
              }}
            />
          </h1>
          <p className="text-xl text-gray-600">
            <TypewriterComponent
              options={{
                strings: [subtitleText],
                autoStart: true,
                delay: 50,
                loop: false,
              }}
            />
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setStarted(true)}
            className="px-8 py-4 bg-[#403cd5] text-white rounded-xl font-semibold shadow-lg hover:bg-[#302cb0] transition-colors"
          >
            Start Conversation
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Chat Interface */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="h-[300px] overflow-y-auto space-y-4 mb-4 scrollbar-thin scrollbar-thumb-[#403cd5]/20">
            {chatHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <p className="text-lg font-medium">Start a conversation</p>
                <p className="text-sm">Ask me about policy recommendations</p>
              </div>
            ) : (
              chatHistory.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-lg ${
                    msg.type === 'user' 
                      ? 'bg-[#403cd5] text-white ml-auto' 
                      : 'bg-gray-100 text-gray-800'
                  } max-w-[80%] ${
                    msg.type === 'user' ? 'ml-auto' : 'mr-auto'
                  }`}
                >
                  {msg.content}
                </motion.div>
              ))
            )}
            {isSearching && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg"
              >
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-[#403cd5] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </div>
                <span className="text-gray-600">Searching for policies...</span>
              </motion.div>
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask about policies..."
              disabled={isSearching}
              className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#403cd5] disabled:bg-gray-100"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="p-3 bg-[#403cd5] text-white rounded-lg hover:bg-[#302cb0] transition-colors disabled:bg-gray-400"
            >
              <FiSend size={20} />
            </button>
          </form>
        </div>

        {/* Policy Cards */}
        {policies.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-600">Policy Recommendations</h3>
            <div className="grid gap-4">
              {policies.map((policy, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-xl bg-gradient-to-r from-[#403cd5]/5 to-transparent border border-[#403cd5]/10"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-[#403cd5]">{policy.title}</h3>
                    <button
                      onClick={() => togglePolicyDetails(idx)}
                      className="px-4 py-2 rounded-lg text-[#403cd5] hover:bg-[#403cd5]/10 transition-all duration-300"
                    >
                      {expandedPolicy === idx ? "Hide Details" : "View Details"}
                    </button>
                  </div>
                  
                  <p className="text-gray-600 mt-2">{policy.description}</p>
                  <div className="text-sm text-gray-500 mt-1">Benefit: {policy.benefit}</div>
                  <div className="text-sm text-gray-500 mt-1">Required Documents: {policy.requiredDocuments}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Website Link: <a href={policy.websiteLink} target="_blank" rel="noopener noreferrer" className="text-[#403cd5] underline">{policy.websiteLink}</a>
                  </div>

                  {expandedPolicy === idx && (
                    <div className="mt-4 p-4 bg-white rounded-lg border border-[#403cd5]/10">
                      {userProfile && (
                        <div className="mt-2 text-sm text-[#403cd5]">
                          This policy matches your profile based on your {policy.category} needs.
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {policies.length === 0 && !loading && (
          <div className="text-center py-10 bg-white rounded-xl shadow-lg">
            <img
              src="/empty-state.svg"
              alt="No policies"
              className="w-32 h-32 mx-auto mb-4 opacity-50"
            />
            <h3 className="text-xl font-semibold text-gray-600">No recommendations yet</h3>
            <p className="text-gray-500">Start a conversation to get personalized policy recommendations</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}