import React from "react"
import { useNavigate } from "react-router-dom"
import { DashboardCanvas } from "./DashboardCanvas"
import { useDashboardData } from "./useDashboardData"

const DashboardRebuild: React.FC = () => {
  const navigate = useNavigate()
  const data = useDashboardData()

  return <DashboardCanvas data={data} onNavigate={(to) => navigate(to)} />
}

export default DashboardRebuild
