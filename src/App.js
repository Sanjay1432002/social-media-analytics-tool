import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import axios from 'axios';
import styled from 'styled-components';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

// Register the necessary Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

// Styled Components for custom styling
const Container = styled.div`
  background: linear-gradient(45deg, #6a11cb 0%, #2575fc 100%);
  color: #fff;
  font-family: 'Arial', sans-serif;
  padding: 20px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  transition: background-color 0.3s ease;
`;

const TitleText = styled.h1`
  font-size: 40px;
  text-align: center;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 20px;
  color: #fff;
  text-shadow: 2px 2px 10px rgba(0, 0, 0, 0.5);
  transition: color 0.3s ease;
`;

const SearchBarContainer = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: center;
  width: 80%;
`;

const SearchInput = styled.input`
  padding: 12px;
  font-size: 16px;
  width: 300px;
  border: 1px solid #fff;
  border-radius: 50px;
  margin-right: 10px;
  background-color: #333;
  color: #fff;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border: 1px solid #f0a500;
    box-shadow: 0 0 10px rgba(240, 165, 0, 0.8);
  }
`;

const SearchButton = styled.button`
  padding: 12px 20px;
  font-size: 16px;
  background-color: #f0a500;
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    background-color: #e68900;
    box-shadow: 0 5px 25px rgba(0, 0, 0, 0.3);
  }
`;

const ToggleButton = styled.button`
  margin-top: 20px;
  padding: 12px 20px;
  font-size: 16px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    background-color: #f0a500;
    box-shadow: 0 5px 25px rgba(0, 0, 0, 0.3);
  }
`;

const LoadingSpinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #f0a500;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: spin 2s linear infinite;
  margin-top: 20px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// AI Chatbox component styled for sleek design
const ChatBox = styled.div`
  position: fixed;
  right: 30px;
  bottom: 30px;
  background-color: #2575fc;
  color: white;
  border-radius: 50%;
  padding: 20px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.3s ease;

  &:hover {
    background-color: #1e5bbf;
    transform: scale(1.1);
  }
`;

const ChatContent = styled.div`
  position: absolute;
  bottom: 90px;
  right: 0;
  background-color: #fff;
  color: #000;
  width: 300px;
  border-radius: 10px;
  padding: 20px;
  display: ${props => (props.visible ? 'block' : 'none')};
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease-in-out;

  @keyframes slideIn {
    0% { transform: translateY(30px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
`;

const ChatInput = styled.input`
  width: 100%;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 50px;
  margin-top: 10px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border: 1px solid #f0a500;
    box-shadow: 0 0 10px rgba(240, 165, 0, 0.8);
  }
`;

const DashboardContainer = styled.div`
  display: flex;
  justify-content: space-around;
  width: 80%;
  margin-top: 40px;
`;

const ChartContainer = styled.div`
  width: 45%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  padding: 20px;
  background-color: #fff;
`;

const TweetsContainer = styled.div`
  width: 45%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #fff;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  padding: 20px;
`;

const Tweet = styled.div`
  background-color: #f9f9f9;
  color: #333;
  padding: 15px;
  margin-bottom: 15px;
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const defaultPieData = {
  labels: ['Positive', 'Neutral', 'Negative'],
  datasets: [{
    data: [30, 50, 20],
    backgroundColor: ['#4CAF50', '#FFC107', '#F44336'],
  }],
};

const defaultBarData = {
  labels: ['Positive', 'Neutral', 'Negative'],
  datasets: [{
    label: 'Sentiment Analysis',
    data: [30, 50, 20],
    backgroundColor: '#4CAF50',
  }],
};

function App() {
  const [usernames, setUsernames] = useState(['']);
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [climate, setClimate] = useState(null);
  const { transcript, resetTranscript, listening } = useSpeechRecognition();

  const handleSearchChange = (e, index) => {
    const newUsernames = [...usernames];
    newUsernames[index] = e.target.value;
    setUsernames(newUsernames);
  };

  const handleAddUser = () => {
    setUsernames([...usernames, '']);
  };

  const handleRemoveUser = (index) => {
    const newUsernames = usernames.filter((_, i) => i !== index);
    setUsernames(newUsernames);
  };

  const fetchData = async (username) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/users/${username}`);
      return response.data;
    } catch (err) {
      console.error(`Error fetching data for ${username}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = async () => {
    if (usernames.some(username => username.trim() === "")) {
      alert("Please enter a valid username.");
      return;
    }
    const fetchedData = await Promise.all(usernames.map(fetchData));
    setUserData(fetchedData.filter(data => data !== null));
  };

  const fetchClimateData = async (lat, lon) => {
    const API_KEY = "your_openweather_api_key";
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`
      );
      setClimate(response.data);
    } catch (error) {
      console.error("Error fetching climate data:", error);
    }
  };

  const toggleChatBox = () => {
    setChatVisible(prev => !prev);
  };

  const handleChatSubmit = () => {
    if (userData.length > 0) {
      const username = userData[0]?.username; 
      if (username) {
        alert(`Sentiment analysis for ${username}: Positive, Neutral, Negative`);
      }
    } else {
      alert("No user data available for analysis.");
    }
  };

  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  const handleVoiceSearch = useCallback(async () => {
    const spokenUsername = transcript.toLowerCase().trim();
    if (spokenUsername) {
      setUsernames([spokenUsername]);
      await handleSearchSubmit();
    } else {
      alert("Please repeat the username.");
    }
    resetTranscript();
  }, [transcript, handleSearchSubmit, resetTranscript]);

  useEffect(() => {
    if (listening && transcript) {
      handleVoiceSearch();
    }
  }, [listening, transcript, handleVoiceSearch]);

  return (
    <Container>
      <TitleText>Interactive Tweet Dashboard</TitleText>

      <SearchBarContainer>
        {usernames.map((username, index) => (
          <div key={index} style={{ display: 'flex', marginBottom: '10px' }}>
            <SearchInput
              type="text"
              value={username}
              onChange={(e) => handleSearchChange(e, index)}
              placeholder="Enter Twitter Username"
            />
            <SearchButton onClick={handleSearchSubmit}>Search</SearchButton>
            <button onClick={() => handleRemoveUser(index)}>Remove</button>
          </div>
        ))}
        <button onClick={handleAddUser}>Add User</button>
      </SearchBarContainer>

      <ToggleButton onClick={toggleListening}>
        {listening ? "Listening..." : "Activate Voice Command"}
      </ToggleButton>

      {loading && <LoadingSpinner />}

      {userData.length > 0 && !loading && (
        <div>
          <p>Displaying user data for: {userData[0].username}</p>
        </div>
      )}

      <DashboardContainer>
        <ChartContainer>
          <Pie data={defaultPieData} />
        </ChartContainer>
        <ChartContainer>
          <Bar data={defaultBarData} />
        </ChartContainer>
      </DashboardContainer>

      <TweetsContainer>
        {userData.length > 0 && userData[0].tweets && userData[0].tweets.length > 0 ? (
          userData[0].tweets.map((tweet, index) => (
            <Tweet key={index}>
              <p>{tweet}</p>
              <p>Sentiment: Positive</p>
            </Tweet>
          ))
        ) : (
          <p>No tweets available.</p>
        )}
      </TweetsContainer>

      <ChatBox onClick={toggleChatBox}>💬</ChatBox>
      <ChatContent visible={chatVisible}>
        <h3>AI Chat</h3>
        <p>Type 'help' for more options</p>
        <ChatInput placeholder="Ask AI" onSubmit={handleChatSubmit} />
        <button onClick={handleChatSubmit}>Send</button>
      </ChatContent>
    </Container>
  );
}

export default App;
