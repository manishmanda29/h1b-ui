import React from "react";
import { Grid } from "@mui/material";
import DataCard from "./DataCard";

const DataDashboard = ({data}) => {
    
    
    
    const processH1BData=(data)=> {
        // Initialize counters
        let totalPetitions = 0;
        let totalApprovals = 0;
        let totalDenials = 0;
        const uniqueEmployers = new Set();
      
        // Process each record
        data.forEach((record) => {
          const initialApproval = parseInt(record.InitialApproval || "0", 10);
          const continuingApproval = parseInt(record.ContinuingApproval || "0", 10);
          const initialDenial = parseInt(record.InitialDenial || "0", 10);
          const continuingDenial = parseInt(record.ContinuingDenial || "0", 10);
      
          // Update totals
          totalPetitions += initialApproval + initialDenial + continuingApproval + continuingDenial;
          totalApprovals += initialApproval
          totalDenials += initialDenial + continuingDenial;
      
          // Track unique employers
          uniqueEmployers.add(record.EmployerName);
        });
      
        // Prepare array of objects for the card component
        return [
          { title: "Total Petitions Filed", value: totalPetitions },
          { title: "Total Approvals", value: totalApprovals },
          { title: "Unique Employers", value: uniqueEmployers.size },
        ];
      }
      
      // Process the data
      const cardData = processH1BData(data);
      
      

  return (
    <Grid container spacing={2} justifyContent={'center'}>
      {cardData.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <DataCard
            title={card.title}
            data={card.value}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default DataDashboard;
