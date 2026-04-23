import React from "react";
import { Text, View } from "react-native";

interface MonthlyIncomeChartProps {
  data: { label: string; value: number; color: string }[];
}

const MonthlyIncomeChart: React.FC<MonthlyIncomeChartProps> = ({ data }) => {
  const maxValue = Math.max(...data.map((item) => item.value), 1);
  const chartHeight = 120;

  return (
    <View className="chart-container">
      <View className="chart-header">
        <Text className="chart-title">Monthly Income</Text>
        <Text className="chart-subtitle">This month</Text>
      </View>
      <View className="chart-body">
        <View className="chart-bars">
          {data.map((item, index) => {
            const barHeight = (item.value / maxValue) * chartHeight;
            return (
              <View key={index} className="chart-bar-wrapper">
                <View
                  className="chart-bar"
                  style={{
                    height: barHeight,
                    backgroundColor: item.color,
                  }}
                />
                <Text className="chart-label">{item.label}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default MonthlyIncomeChart;
