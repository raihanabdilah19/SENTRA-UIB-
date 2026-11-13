import React from 'react';
import { Banner } from '../components/Banner';
import { MetricCards } from '../components/MetricCards';
import { FinanceChart } from '../components/FinanceChart';
import { AgendaCard } from '../components/AgendaCard';
import { QuickMenu } from '../components/QuickMenu';

export const DashboardView: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-6 pb-10 sm:pb-12 animate-in fade-in duration-200">
      {/* 1. Welcome Banner */}
      <Banner />

      {/* 2. Top Statistic Metric Cards */}
      <MetricCards />

      {/* 3. Middle Row: Finance Line Chart + Agenda Terdekat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        <div className="lg:col-span-7">
          <FinanceChart />
        </div>
        <div className="lg:col-span-5">
          <AgendaCard />
        </div>
      </div>

      {/* 4. Menu Cepat */}
      <div>
        <QuickMenu />
      </div>
    </div>
  );
};
