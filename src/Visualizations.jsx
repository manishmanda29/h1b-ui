import React, { useEffect, useState } from "react";
import PetitionChart from "./components/PetitionChart";
import LZString from 'lz-string';
import MultiLevelMap from "./components/MultiLevelMap";
import EmployerVisualization from "./components/EmployerVisualization";
import DataDashboard from "./components/DataDashboard";
import { FormControl, MenuItem, Select } from '@mui/material';

const Visualizations = () => {
  const [data, setData] = useState([]);
  const [selectedVisualization, setSelectedVisualization] = useState('');

  const handleChange = (event) => {
    setSelectedVisualization(event.target.value);
  };

  useEffect(() => {
    fetchSpreadsheetData();
  }, []);

  useEffect(() => {
    console.log(data, "dataaaa");
  }, [data]);

  const fetchSpreadsheetData = async () => {
    try {
      if (window.localStorage.getItem("data")) {
        let storage = JSON.parse(LZString.decompress(window.localStorage.getItem("data")));
        if (storage) setData(storage);
      } else {
        const url = "https://sheetdb.io/api/v1/c10t6t6he1p2p";
        const response = await fetch(url);
        const data = await response.json();
        setData(data);
        let stringify = LZString.compress(JSON.stringify(data));
        window.localStorage.setItem("data", stringify);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getTitleAndDescription = () => {
    switch (selectedVisualization) {
      case 'PetitionChart':
        return { title: 'Petition Chart', description: 'A bar chart showing petitions data based on various parameters.' };
      case 'EmployerVisualization':
        return { title: 'Employer Visualization', description: 'A visualization showing employer-related petitions and their statistics.' };
      case 'MultiLevelMap':
        return { title: 'Multi-Level Petition Data Visualization by State and City', description: 'This interactive map allows users to explore petition data across U.S. states and cities, providing insights into the most petitioned cities and top companies involved. It features dynamic markers and bar charts for detailed exploration of petition trends.' };
      default:
        return { title: '', description: '' };
    }
  };

  const getUserGuide = () => {
    return (
      <div>
        <h3>User Guide</h3>
        <p><strong>Hover over any data points</strong> in the visualizations to see additional details.</p>
        <p><strong>Click</strong> on any bar in the chart or marker on the map for more in-depth information.</p>
        <p><strong>Select a visualization</strong> from the dropdown to switch between different data views.</p>
      </div>
    );
  };

  const { title, description } = getTitleAndDescription();

  return (
    <>
      <DataDashboard data={data} />
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
        <label style={{ alignSelf: 'center', fontSize: 20 }}><strong>Select Visualization</strong></label>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <Select
              labelId="visualization-select-label"
              id="visualization-select"
              value={selectedVisualization}
              onChange={handleChange}
            >
              <MenuItem value="PetitionChart">Petition Chart</MenuItem>
              <MenuItem value="EmployerVisualization">Employer Visualization</MenuItem>
              <MenuItem value="MultiLevelMap">Multi-Level Map</MenuItem>
            </Select>
          </FormControl>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: 'center', flexDirection:'column',alignItems: 'center' }}>
        {title && <h2>{title}</h2>}
        {description && <p>{description}</p>}
      </div>
      <div style={{ display: "flex", justifyContent: 'center', alignSelf: 'center' }}>
      {selectedVisualization === 'PetitionChart' && <PetitionChart data={data} />}
      {selectedVisualization === 'EmployerVisualization' && <EmployerVisualization data={data} />}


 </div>
 {selectedVisualization === 'MultiLevelMap' && <MultiLevelMap data={data} />}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
        {getUserGuide()}
      </div>
    </>
  );
};

export default Visualizations;
