import React from "react";
import { Card, CardContent, Typography, Grid, Box } from "@mui/material";

const DataCard = ({ title, description, data}) => {
  return (
    <Card
      sx={{
        minWidth: 275,
        maxWidth: 350,
        boxShadow: 3,
        borderRadius: 2,
        p: 2,
        m: 1,
        backgroundColor: "#f5f5f5",
      }}
    >
      <CardContent>
        {/* Title */}
        <Typography
          variant="h6"
          component="div"
          gutterBottom
          sx={{ fontWeight: "bold", color: "#333" }}
        >
          {title}
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ mb: 1.5 }}
        >
          {description}
        </Typography>

        {/* Data (Numbers, Info, etc.) */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 0.5,
          }}
        >
            <Typography  variant="body1" sx={{ color: "#555" }}>
              <strong>{data}</strong>
            </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DataCard;
