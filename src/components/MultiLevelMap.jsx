import React, { useState } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import * as d3 from "d3";
import Tooltip from '@mui/material/Tooltip';
// Geo URL for US states
const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

// State Abbreviations Mapping
const stateAbbreviations = {
  al: "Alabama",
  ak: "Alaska",
  az: "Arizona",
  ar: "Arkansas",
  ca: "California",
  co: "Colorado",
  ct: "Connecticut",
  de: "Delaware",
  fl: "Florida",
  ga: "Georgia",
  hi: "Hawaii",
  id: "Idaho",
  il: "Illinois",
  in: "Indiana",
  ia: "Iowa",
  ks: "Kansas",
  ky: "Kentucky",
  la: "Louisiana",
  me: "Maine",
  md: "Maryland",
  ma: "Massachusetts",
  mi: "Michigan",
  mn: "Minnesota",
  ms: "Mississippi",
  mo: "Missouri",
  mt: "Montana",
  ne: "Nebraska",
  nv: "Nevada",
  nh: "New Hampshire",
  nj: "New Jersey",
  nm: "New Mexico",
  ny: "New York",
  nc: "North Carolina",
  nd: "North Dakota",
  oh: "Ohio",
  ok: "Oklahoma",
  or: "Oregon",
  pa: "Pennsylvania",
  ri: "Rhode Island",
  sc: "South Carolina",
  sd: "South Dakota",
  tn: "Tennessee",
  tx: "Texas",
  ut: "Utah",
  vt: "Vermont",
  va: "Virginia",
  wa: "Washington",
  wv: "West Virginia",
  wi: "Wisconsin",
  wy: "Wyoming",
};

const MultiLevelMap = ({ data }) => {
  const [selectedState, setSelectedState] = useState(null);
  const [cities, setCities] = useState([]);
  const [highlightedState, setHighlightedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [companyData, setCompanyData] = useState([]);
  const [tooltipContent, setTooltipContent] = useState("");

  const handleStateClick = (geo) => {
    const stateName = geo.properties.name;
    const stateData = data.filter(
      (item) => stateAbbreviations[item.PetitionerState] === stateName
    );

    const cityPetitions = stateData.reduce((acc, curr) => {
      const cityName = curr.PetitionerCity.trim().toLowerCase();
      const totalPetitions =
        parseInt(curr.InitialApproval || 0) + parseInt(curr.InitialDenial || 0);

      if (!acc[cityName]) {
        acc[cityName] = {
          city: curr.PetitionerCity,
          total: totalPetitions,
          latitude: parseFloat(curr.Latitude),
          longitude: parseFloat(curr.Longitude),
        };
      } else {
        acc[cityName].total += totalPetitions;
      }

      return acc;
    }, {});

    const sortedCities = Object.values(cityPetitions)
      .filter((city) => city.latitude && city.longitude)
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);

    setSelectedState(stateName);
    setCities(sortedCities);
    setHighlightedState(stateName);
  };

  const handleCityClick = (city) => {
    const cityData = data.filter(
      (item) => item.PetitionerCity.toLowerCase() === city.city.toLowerCase()
    );

    const companyPetitions = cityData.reduce((acc, curr) => {
      const companyName = curr.EmployerName || "Unknown Company";
      const initialApproval = parseInt(curr.InitialApproval || 0);
      const initialDenial = parseInt(curr.InitialDenial || 0);
      const continuingApproval = parseInt(curr.ContinuingApproval || 0);
      const continuingDenial = parseInt(curr.ContinuingDenial || 0);

      if (!acc[companyName]) {
        acc[companyName] = {
          company: companyName,
          initialApproval,
          initialDenial,
          continuingApproval,
          continuingDenial,
        };
      } else {
        acc[companyName].initialApproval += initialApproval;
        acc[companyName].initialDenial += initialDenial;
        acc[companyName].continuingApproval += continuingApproval;
        acc[companyName].continuingDenial += continuingDenial;
      }

      return acc;
    }, {});

    const sortedCompanies = Object.values(companyPetitions)
      .sort(
        (a, b) =>
          b.initialApproval +
          b.initialDenial -
          (a.initialApproval + a.initialDenial)
      )
      .slice(0, 5);

    setSelectedCity(city);
    setCompanyData(sortedCompanies);
  };

  // Calculate state-wise petition counts
  const petitionCounts = data.reduce((acc, curr) => {
    const stateName = stateAbbreviations[curr.PetitionerState];

    const totalPetitions =
      parseInt(curr.InitialApproval || 0) + parseInt(curr.InitialDenial || 0);

    if (!acc[stateName]) {
      acc[stateName] = totalPetitions;
    } else {
      acc[stateName] += totalPetitions;
    }
    return acc;
  }, {});

  const colorScale = d3
    .scaleLinear()
    .domain([0, d3.max(Object.values(petitionCounts))])
    .range(["#d4e4f7", "#08306b"]);

  const getTextOffset = (index) => {
    return index % 2 === 0 ? -10 : 10; // Alternate positions for text
  };

  const renderBarChart = () => {
    const margin = { top: 20, right: 30, bottom: 50, left: 300 };
    const width = 1000 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    console.log(companyData)

    // Set up scales
    const x = d3.scaleLinear()
      .domain([0, d3.max(companyData, d => d.initialApproval + d.initialDenial + d.continuingApproval + d.continuingDenial)])
      .range([0, width]);

    const y = d3.scaleBand()
      .domain(companyData.map(d => d.company))
      .range([0, height])
      .padding(0.1);

    const color = d3.scaleOrdinal()
      .domain(['initialApproval', 'initialDenial', 'continuingApproval', 'continuingDenial'])
      .range(['#69b3a2', '#ff9999', '#4f81bd', '#f07c00']);  // Color mapping

    // Tooltip logic
    const tooltip = d3.select('body').append('div')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background', 'rgba(0, 0, 0, 0.75)')
      .style('color', 'white')
      .style('border-radius', '4px')
      .style('padding', '8px')
      .style('font-size', '12px');

    return (
      <svg width={1000} height={height + margin.top + margin.bottom}>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Bars for each company */}
          {companyData.map((company, i) => {
            let xOffset = 0;
            console.log(company)
            const totalPetitions = company.initialApproval + company.initialDenial + company.continuingApproval + company.continuingDenial;
            console.log(totalPetitions)
            return (
              <g key={i} transform={`translate(0,${y(company.company)})`}>
                {['initialApproval', 'initialDenial', 'continuingApproval', 'continuingDenial'].map((category, index) => {
                  const value = company[category];
                  const colorValue = color(category);
                  const xPosition = xOffset;
                  xOffset += x(value);
                  return (
                    <g key={category}>
                      <rect
                        x={xPosition}
                        y={0}
                        width={x(value)}
                        height={y.bandwidth()}
                        fill={colorValue}
                        onMouseOver={() => tooltip.style('visibility', 'visible').text(`${category}: ${value}`)}
                        onMouseMove={(e) => tooltip.style('top', `${e.pageY + 5}px`).style('left', `${e.pageX + 5}px`)}
                        onMouseOut={() => tooltip.style('visibility', 'hidden')}
                      />
                    </g>
                  );
                })}
                <text x={-10} y={y.bandwidth() / 2} dy=".35em" textAnchor="end" style={{ fontSize: 12 }}>
                  {company.company}
                </text>
                {/* Total petitions text at the end of the bar */}
                <text x={xOffset} y={y.bandwidth() / 2} dy=".35em" style={{ fontSize: 12, fill: "#333", fontWeight: 'bold' }}>
                  {totalPetitions}
                </text>
              </g>
            );
          })}
        </g>

        {/* Legend */}
        {/* Legend */}
        {/* <g transform={`translate(${width - 200}, ${margin.top-50})`}>
    <text x={0} y={-10} style={{ fontSize: 12, fontWeight: 'bold' }}>Legend:</text>
    {['initialApproval', 'initialDenial', 'continuingApproval', 'continuingDenial'].map((category, index) => (
      <g key={category} transform={`translate(0, ${index * 20})`}>
        <rect width={12} height={12} fill={color(category)} />
        <text x={20} y={12} style={{ fontSize: 12 }}>
          {category.replace(/([A-Z])/g, ' $1').toUpperCase()}
        </text>
      </g>
    ))}
  </g> */}
      </svg>
    );
  };
  const adjustedTextPosition = (city, index, cities) => {
    const overlap = cities.some(
      (otherCity, i) =>
        i !== index &&
        Math.abs(otherCity.latitude - city.latitude) < 0.2 &&
        Math.abs(otherCity.longitude - city.longitude) < 0.2
    );

    return overlap ? 20 : 0; // Adjust position if overlap detected
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <ComposableMap projection="geoAlbersUsa" projectionConfig={{ center: [125, 29] }}>
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const stateName = geo.properties.name;
              const petitions = petitionCounts[stateName] || 0;
              return (
                <Tooltip title={geo.properties.name} placement="top">
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => handleStateClick(geo)}
                    onMouseEnter={() => { console.log("i am heree") }}

                    // // }setTooltipContent(`${stateName}: ${petitions} petitions`)}
                    // onMouseLeave={() => setTooltipContent("")}
                    style={{
                      default: {
                        fill: colorScale(petitions),
                        stroke: "#FFFFFF",
                        strokeWidth: 0.5,
                        outline: "none",
                      },
                      hover: {
                        fill: "#F53",
                        stroke: "#FFFFFF",
                        strokeWidth: 0.5,
                        outline: "none",
                      },
                      pressed: {
                        fill: "#E42",
                      },
                    }}
                  />
                </Tooltip>);
            })
          }

        </Geographies>

        {cities.map((city, index) => (
          <Marker key={index} coordinates={[city.longitude, city.latitude]} onClick={() => handleCityClick(city)}>
            <circle r={2} fill="white" style={{ cursor: "pointer" }} />
            <g>
              <rect
                x={-30} // Adjust position relative to text
                y={index % 2 === 0 ? -18 : 2} // Adjust position based on `y` of the text
                width={60} // Adjust width to fit text
                height={10} // Adjust height to fit text
                fill="#000000" // Background color (black)
                rx={2} // Rounded corners (optional)
                ry={2}
              />
              <text
                textAnchor="middle"
                y={index % 2 === 0 ? -10 : 10}
                style={{ fontSize: 8, fill: "#F4ECF7", cursor: "pointer" }}
              >
                {city.city} ({city.total})
              </text>
            </g>

          </Marker>
        ))}
      </ComposableMap>

      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        {["#d4e4f7", "#7292c3", "#36558e", "#08306b"].map((color, index) => (
          <div key={index} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div style={{ width: "20px", height: "20px", background: color }}></div>
            <span>{index === 0 ? "Low" : index === 3 ? "High" : ""}</span>
          </div>
        ))}
      </div>




      {selectedCity && (
        <div>
          <h3>Selected City: {selectedCity.city}</h3>
          <h4>Top 5 Companies by Petitions:</h4>
          {renderBarChart()}
        </div>
      )}


      {tooltipContent && (
        <div
          style={{
            position: "absolute",
            background: "#333",
            color: "#fff",
            padding: "5px",
            borderRadius: "5px",
            pointerEvents: "none",
            top: "10px",
            left: "10px",
          }}
        >
          {tooltipContent}
        </div>
      )}


    </div>
  );
};

export default MultiLevelMap;
