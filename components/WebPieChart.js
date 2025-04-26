import React from "react";
import { Dimensions } from "react-native";
import { PieChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width - 40;

const WebPieChart = ({ data }) => {
  return (
    <PieChart
      data={data.map((item, index) => ({
        name: item.name,
        population: item.count,
        color: item.color,
        legendFontColor: "#333",
        legendFontSize: 14,
      }))}
      width={screenWidth}
      height={220}
      chartConfig={{
        backgroundColor: "#fff",
        backgroundGradientFrom: "#fff",
        backgroundGradientTo: "#fff",
        color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
      }}
      accessor="population"
      backgroundColor="transparent"
      paddingLeft="0"
      absolute
    />
  );
};

export default WebPieChart;
