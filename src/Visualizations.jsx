import React, { useEffect, useState } from "react";
import PetitionChart from "./components/PetitionChart";
import LZString from 'lz-string';
import MultiLevelMap from "./components/MultiLevelMap";
import EmployerVisualization from "./components/EmployerVisualization";
import DataDashboard from "./components/DataDashboard";
import { FormControl, MenuItem, Select } from '@mui/material';
import { ColorRing } from 'react-loader-spinner'


const Visualizations = () => {
  const [data, setData] = useState([]);
  const [selectedVisualization, setSelectedVisualization] = useState('PetitionChart');
  const [loader,setLoader]=useState(false);

  const handleChange = (event) => {
    setSelectedVisualization(event.target.value);
  };

  useEffect(() => {
    fetchSpreadsheetData();
  }, []);

  useEffect(() => {
    console.log(data, "data loaded");
  }, [data]);

  const fetchSpreadsheetData = async () => {
    try {
      if (window.localStorage.getItem("data")) {
        let storage = JSON.parse(LZString.decompress(window.localStorage.getItem("data")));
        if (storage) setData(storage);
      } else {
        const url = "https://sheetdb.io/api/v1/c10t6t6he1p2p";
        setLoader(true);
        
        const response = await fetch(url);
        const data = await response.json();
        setData(data);
        let compressedData = LZString.compress(JSON.stringify(data));
        window.localStorage.setItem("data", compressedData);
        setLoader(false)
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getTitleAndDescription = () => {
    switch (selectedVisualization) {
      case 'PetitionChart':
        return {
          title: 'Petition Chart',
          description: 'Visualize petition data using a bar chart with breakdowns by approval and denial categories.'
        };
      case 'EmployerVisualization':
        return {
          title: 'Employer Visualization',
          description: 'Explore employer-related petitions and their outcomes using a detailed visualization.'
        };
      case 'MultiLevelMap':
        return {
          title: 'Multi-Level Petition Data Visualization',
          description: 'Interactive U.S. map showcasing petition data by state and city, with top cities and employers highlighted.'
        };
      default:
        return { title: '', description: '' };
    }
  };

  const getUserGuide = () => {
    switch (selectedVisualization) {
      case 'PetitionChart':
        return (
          <div>
            <h3>User Guide - Petition Chart</h3>
            <ul>
              <li>Hover over bars to view petition counts.</li>
            </ul>
          </div>
        );
      case 'EmployerVisualization':
        return (
          <div>
            <h3>User Guide - Employer Visualization</h3>
            <ul>
              <li>hover on bars to  view detailed data.</li>
            </ul>
          </div>
        );
      case 'MultiLevelMap':
        return (
          <div>
            <h3>User Guide - Multi-Level Map</h3>
            <ul>
              <li>click over states to view the  top 3 cities based on peitions</li>
              <li>Click on city names to view the stacked bar chart of approvals and denials</li>
            </ul>
          </div>
        );
      default:
        return null;
    }
  };

  const { title, description } = getTitleAndDescription();

  return (
    <>
      <DataDashboard data={data} />
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, margin: '20px 0' }}>
        <label style={{ alignSelf: 'center', fontSize: 18, fontWeight: 'bold' }}>Select Visualization</label>
        <FormControl sx={{ minWidth: 200 }}>
          <Select
            value={selectedVisualization || 'PetitionChart'}
            onChange={handleChange}
            displayEmpty
          >
            <MenuItem value="" disabled>Select...</MenuItem>
            <MenuItem value="PetitionChart">Petition Chart</MenuItem>
            <MenuItem value="EmployerVisualization">Employer Visualization</MenuItem>
            <MenuItem value="MultiLevelMap">Multi-Level Map</MenuItem>
          </Select>
        </FormControl>
      </div>

      {title && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 40, alignItems: 'flex-start', marginTop: 20 }}>
          <div style={{ maxWidth: '70%', textAlign: 'center' }}>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
          <div style={{ maxWidth: '30%' }}>
            {getUserGuide()}
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: 'center', marginTop: 20 }}>
        {selectedVisualization === 'PetitionChart' && <PetitionChart data={data} />}
        {selectedVisualization === 'EmployerVisualization' && <EmployerVisualization data={data} />}
      
      </div>
      {selectedVisualization === 'MultiLevelMap' && <MultiLevelMap data={data} />}
      {/* <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh", // Full viewport height
        width: "100vw", // Full viewport width
        position: "absolute", // Position it relative to the viewport
        top: 0,
        left: 0,
      }}
    >
      <ColorRing
        height="80"
        visible={loader}
        width="80"
        ariaLabel="color-ring-loading"
        wrapperStyle={{}} // Optional style for wrapper
        wrapperClass="color-ring-wrapper"
        colors={['#e15b64', '#f47e60', '#f8b26a', '#abbd81', '#849b87']}
      />
    </div> */}
    </>
  );
};

export default Visualizations;
