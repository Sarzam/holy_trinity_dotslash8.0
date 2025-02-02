"use client";
import { useState, useEffect } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { GoogleMap, HeatmapLayer } from '@react-google-maps/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [userStats, setUserStats] = useState(null);
  const [policyStats, setPolicyStats] = useState(null);
  const [recommendationStats, setRecommendationStats] = useState(null);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');
  const [heatmapData, setHeatmapData] = useState([]);

  useEffect(() => {
    // Fetch data for each model
    fetchModelStats();
    fetchHeatmapData(selectedAgeGroup, selectedGender);
  }, [selectedAgeGroup, selectedGender]);

  const fetchModelStats = async () => {
    // Fetch and aggregate data for each model
    // Example structure for userStats
    setUserStats({
      labels: ['Male', 'Female', 'Other'],
      datasets: [{
        data: [30, 40, 30],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
      }]
    });

    // Example structure for policyStats
    setPolicyStats({
      labels: ['Pending', 'Approved', 'Rejected'],
      datasets: [{
        data: [15, 25, 10],
        backgroundColor: ['#FFE0B2', '#C8E6C9', '#FFCDD2']
      }]
    });

    // Example structure for recommendationStats
    setRecommendationStats({
      labels: ['Health', 'Life', 'Vehicle', 'Property'],
      datasets: [{
        data: [40, 30, 20, 10],
        backgroundColor: ['#B2EBF2', '#C5CAE9', '#F8BBD0', '#D7CCC8']
      }]
    });
  };

  const fetchHeatmapData = async (ageGroup, gender) => {
    // Fetch user locations based on filters
    // Transform into heatmap data points
    const points = [
      // Example data
      { location: new google.maps.LatLng(19.0760, 72.8777), weight: 5 },
      // ...more points
    ];
    setHeatmapData(points);
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Policy Analytics'
      }
    }
  };

  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Policy Applications',
        data: [12, 19, 3, 5, 2, 3],
        borderColor: '#403cd5',
        backgroundColor: 'rgba(64, 60, 213, 0.5)',
      }
    ]
  };

  return (
    <div className="p-4 space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <select 
          value={selectedAgeGroup}
          onChange={(e) => setSelectedAgeGroup(e.target.value)}
          className="p-2 border rounded w-full md:w-auto"
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
          className="p-2 border rounded w-full md:w-auto"
        >
          <option value="all">All Genders</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">User Demographics</h3>
          {userStats && <Pie data={userStats} />}
        </div>

        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Policy Applications</h3>
          {policyStats && <Bar data={policyStats} />}
        </div>

        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Policy Recommendations</h3>
          {recommendationStats && <Bar data={recommendationStats} />}
        </div>
      </div>

      {/* Line Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <Line options={chartOptions} data={lineChartData} />
        </div>
      </div>

      {/* Heatmap */}
      <div className="h-[300px] md:h-[500px] bg-white rounded-lg shadow">
        <GoogleMap
          center={{ lat: 20.5937, lng: 78.9629 }}
          zoom={5}
          mapContainerStyle={{ width: '100%', height: '100%' }}
        >
          <HeatmapLayer
            data={heatmapData}
            options={{
              radius: 20,
              opacity: 0.6,
            }}
          />
        </GoogleMap>
      </div>
    </div>
  );
}
