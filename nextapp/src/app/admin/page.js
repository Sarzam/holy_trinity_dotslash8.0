'use client'
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { format } from 'date-fns';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function AdminDashboard() {
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');
  const [selectedOccupation, setSelectedOccupation] = useState('all');
  const [selectedEducation, setSelectedEducation] = useState('all');
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    userStats: [],
    occupationStats: [],
    recommendationStats: [],
    votingPoliciesStats: [],
    policyVoteStats: [],
    locationData: []
  });
  const [policyApplications, setPolicyApplications] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [filterStatus, setFilterStatus] = useState('all');
  const [policyError, setPolicyError] = useState(null);

  useEffect(() => {
    fetchStats();
    fetchPolicyApplications();
  }, [selectedAgeGroup, selectedGender, selectedOccupation, selectedEducation]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/stats?ageGroup=${selectedAgeGroup}&gender=${selectedGender}&occupation=${selectedOccupation}&education=${selectedEducation}`
      );
      const data = await response.json();
      setStatsData(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPolicyApplications = async () => {
    try {
      const response = await fetch('/api/admin/policy-applications');
      const data = await response.json();
      if (!data) throw new Error('No data received');
      setPolicyApplications(data);
      setPolicyError(null);
    } catch (error) {
      console.error('Error fetching policy applications:', error);
      setPolicyError('Failed to load policy applications');
      setPolicyApplications([]);
    }
  };

  const sortPolicies = (policies) => {
    return [...policies].sort((a, b) => {
      if (sortConfig.key === 'createdAt') {
        return sortConfig.direction === 'asc'
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt);
      }
      return sortConfig.direction === 'asc'
        ? a[sortConfig.key].localeCompare(b[sortConfig.key])
        : b[sortConfig.key].localeCompare(a[sortConfig.key]);
    });
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const userChartConfig = {
    series: statsData?.userStats?.map(stat => stat.count) || [],
    options: {
      chart: { type: 'pie' },
      labels: statsData?.userStats?.map(stat => stat._id) || [],
      title: { 
        text: 'User Demographics',
        align: 'center',
        style: { fontSize: '18px', fontWeight: 600 }
      },
      colors: ['#403cd5', '#6761ff', '#8b87ff'], // Different shades of purple
      fill: {
        opacity: 1
      }
    }
  };

  const occupationChartConfig = {
    series: [{
      name: 'Occupation Distribution',
      data: statsData?.occupationStats?.map(stat => stat.count) || []
    }],
    options: {
      chart: {
        type: 'radar',
        toolbar: {
          show: false
        }
      },
      title: {
        text: 'Occupation Distribution',
        align: 'center',
        style: { fontSize: '18px', fontWeight: 600 }
      },
      xaxis: {
        categories: [
          'Student',
          'Businessman',
          'Engineer',
          'Doctor',
          'Accountant',
          'Others'
        ].map(cat => cat.charAt(0).toUpperCase() + cat.slice(1))
      },
      colors: ['#403cd5'],
      markers: {
        size: 4,
        colors: ['#403cd5'],
        strokeColors: '#fff',
        strokeWidth: 2
      },
      fill: {
        opacity: 0.7
      }
    }
  };

  const recommendedPolicyConfig = {
    series: [{
      name: 'Recommendations',
      data: statsData?.recommendationStats?.map(stat => stat.count) || []
    }],
    options: {
      chart: { type: 'line' },
      xaxis: {
        categories: statsData?.recommendationStats?.map(stat => stat._id) || []
      },
      title: { 
        text: 'Policy Recommendations by Category',
        align: 'center',
        style: { fontSize: '18px', fontWeight: 600 }
      },
      colors: ['#403cd5'],
      stroke: {
        curve: 'smooth',
        width: 3
      },
      fill: {
        opacity: 1
      }
    }
  };

  const votingCategoriesConfig = {
    series: [{
      name: 'Policies',
      data: statsData?.votingPoliciesStats?.map(stat => stat.count) || []
    }],
    options: {
      chart: { type: 'bar' },
      xaxis: {
        categories: statsData?.votingPoliciesStats?.map(stat => stat._id) || []
      },
      title: { 
        text: 'Voting Policies Distribution',
        align: 'center',
        style: { fontSize: '18px', fontWeight: 600 }
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          columnWidth: '60%',
        }
      },
      colors: ['#403cd5'],
      fill: {
        opacity: 1
      }
    }
  };

  const votingStatsConfig = {
    series: [{
      name: 'Yes Votes',
      data: statsData?.policyVoteStats?.map(stat => stat.yesVotes) || []
    }, {
      name: 'No Votes',
      data: statsData?.policyVoteStats?.map(stat => stat.noVotes) || []
    }],
    options: {
      chart: { 
        type: 'bar',
        stacked: false
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          borderRadius: 4,
          dataLabels: {
            position: 'top'
          }
        },
      },
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return val;
        },
        offsetY: -20,
        style: {
          fontSize: '12px',
          colors: ["#304758"]
        }
      },
      xaxis: {
        categories: statsData?.policyVoteStats?.map(stat => stat.title) || [],
        labels: {
          rotate: -45,
          trim: true,
          maxHeight: 120
        }
      },
      yaxis: {
        title: {
          text: 'Number of Votes'
        }
      },
      title: { 
        text: 'Policy Voting Results',
        align: 'center',
        style: { fontSize: '18px', fontWeight: 600 }
      },
      colors: ['#403cd5', '#6761ff'], // Two shades of purple for yes/no votes
      fill: {
        opacity: 1
      },
      legend: {
        position: 'top'
      }
    }
  };

  const HeatmapLayer = () => {
    const map = useMap();
    
    useEffect(() => {
      if (statsData?.locationData) {
        const points = statsData.locationData.map(loc => [
          loc._id.lat,
          loc._id.lng,
          loc.count * 10 // Increase intensity multiplier
        ]);
        
        const heatLayer = L.heatLayer(points, {
          radius: 30, // Increased radius
          blur: 20, // Increased blur
          maxZoom: 10,
          minOpacity: 0.4,
          gradient: {
            0.2: '#e6e5ff',
            0.4: '#8b87ff',
            0.6: '#6761ff',
            0.8: '#403cd5',
            1.0: '#2a27a5'
          }
        });
        
        heatLayer.addTo(map);
        return () => map.removeLayer(heatLayer);
      }
    }, [map, statsData]);
    
    return null;
  };

  return (
    <div className="min-h-screen pt-24 bg-[#403cd5] p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#f8f9fa]">Admin Dashboard</h1>
        
        <div className="flex flex-wrap gap-4">
          <select
            value={selectedAgeGroup}
            onChange={(e) => setSelectedAgeGroup(e.target.value)}
            className="p-2 border rounded bg-white"
          >
            <option value="all">All Ages</option>
            <option value="18-25">18-25</option>
            <option value="26-35">26-35</option>
            <option value="36-50">36-50</option>
            <option value="50+">50+</option>
          </select>

          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="p-2 border rounded bg-white"
          >
            <option value="all">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

          <select
            value={selectedOccupation}
            onChange={(e) => setSelectedOccupation(e.target.value)}
            className="p-2 border rounded bg-white"
          >
            <option value="all">All Occupations</option>
            <option value="student">Student</option>
            <option value="businessman">Businessman</option>
            <option value="engineer">Engineer</option>
            <option value="doctor">Doctor</option>
            <option value="accountant">Accountant</option>
            <option value="others">Others</option>
          </select>

          <select
            value={selectedEducation}
            onChange={(e) => setSelectedEducation(e.target.value)}
            className="p-2 border rounded bg-white"
          >
            <option value="all">All Education</option>
            <option value="tenth">10th Standard</option>
            <option value="twelfth">12th Standard</option>
            <option value="undergraduate">Undergraduate</option>
            <option value="postgraduate">Postgraduate</option>
            <option value="doctorate">Doctorate</option>
            <option value="others">Others</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Demographics Section */}
        <div className="col-span-12 md:col-span-5 bg-white p-6 rounded-lg shadow-md">
          {loading ? (
            <div className="h-[400px] flex items-center justify-center">
              <div className="text-gray-500">Loading data...</div>
            </div>
          ) : (
            <Chart
              options={userChartConfig.options}
              series={userChartConfig.series}
              type="pie"
              height={400}
            />
          )}
        </div>

        {/* Occupation Section */}
        <div className="col-span-12 md:col-span-7 bg-white p-6 rounded-lg shadow-md">
          <Chart
            options={occupationChartConfig.options}
            series={occupationChartConfig.series}
            type="radar"
            height={400}
          />
        </div>

        {/* Voting Categories and Policy Recommendations side by side */}
        <div className="col-span-12 md:col-span-7 bg-white p-6 rounded-lg shadow-md">
          <Chart
            options={votingCategoriesConfig.options}
            series={votingCategoriesConfig.series}
            type="bar"
            height={400}
          />
        </div>

        <div className="col-span-12 md:col-span-5 bg-white p-6 rounded-lg shadow-md">
          <Chart
            options={recommendedPolicyConfig.options}
            series={recommendedPolicyConfig.series}
            type="line"
            height={400}
          />
        </div>

        {/* Voting Results */}
        <div className="col-span-12 bg-white p-6 rounded-lg shadow-md">
          <Chart
            options={votingStatsConfig.options}
            series={votingStatsConfig.series}
            type="bar"
            height={400}
          />
        </div>

        {/* Heatmap - Moved to bottom */}
        <div className="col-span-12 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-[#403cd5] text-center">
            User Distribution Heatmap
          </h2>
          <div className="h-[500px] w-full"> {/* Increased height for better visibility */}
            <MapContainer
              center={[20.5937, 78.9629]}
              zoom={5}
              style={{ height: '100%', width: '100%' }}
              zoomControl={true}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <HeatmapLayer />
            </MapContainer>
          </div>
        </div>

        {/* Policy Applications Section */}
        <div className="col-span-12 bg-white p-6 rounded-lg shadow-md mt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-[#403cd5]">
              Policy Applications
            </h2>
            <div className="flex gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="p-2 border rounded bg-white text-gray-700"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <button
                onClick={() => setSortConfig({
                  key: 'createdAt',
                  direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
                })}
                className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 text-gray-700"
              >
                Sort by Date {sortConfig.direction === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {policyError ? (
            <div className="text-center py-4 text-red-600">
              {policyError}
            </div>
          ) : policyApplications.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No policy applications found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applicant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted On
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortPolicies(policyApplications)
                    .filter(policy => filterStatus === 'all' || policy.status === filterStatus)
                    .map((policy) => (
                      <tr key={policy._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {policy.title || 'Untitled'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {policy.userId?.name || 'Unknown User'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {policy.userId?.email || 'No email provided'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(policy.status)}`}>
                            {(policy.status?.charAt(0).toUpperCase() + policy.status?.slice(1)) || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {policy.createdAt ? format(new Date(policy.createdAt), 'PP') : 'Unknown date'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => {/* Handle view details */}}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}