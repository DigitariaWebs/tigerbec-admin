"use client"

import { useState } from "react"
import { Settings, FileText, Download, Loader2, FileSpreadsheet, Users, Car, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { carSalesApi } from "@/lib/api/car-sales"
import { membersApi } from "@/lib/api/members"
import { analyticsApi } from "@/lib/api/analytics"

// Utility to convert data to CSV
function convertToCSV<T extends Record<string, unknown>>(data: T[], headers?: string[]): string {
  if (data.length === 0) return ""
  
  const keys = headers || Object.keys(data[0])
  const csvHeaders = keys.join(",")
  
  const csvRows = data.map(row => 
    keys.map(key => {
      const value = row[key]
      // Handle values that might contain commas or quotes
      if (value === null || value === undefined) return ""
      const stringValue = String(value)
      if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    }).join(",")
  )
  
  return [csvHeaders, ...csvRows].join("\n")
}

// Utility to download a file
function downloadFile(content: string, filename: string, mimeType: string = "text/csv") {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Format date for filenames
function getFormattedDate(): string {
  return new Date().toISOString().split("T")[0]
}

export function QuickActions() {
  const [isExporting, setIsExporting] = useState<string | null>(null)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)

  // Export Car Sales
  const exportCarSales = async () => {
    setIsExporting("car-sales")
    try {
      const sales = await carSalesApi.list()
      
      if (sales.length === 0) {
        toast.info("No car sales data to export")
        return
      }

      const csvData = sales.map(sale => ({
        "Sale ID": sale.id,
        "Car ID": sale.car_id,
        "Member ID": sale.member_id,
        "VIN": sale.vin_snapshot,
        "Make": sale.make_snapshot,
        "Model": sale.model_snapshot,
        "Year": sale.year_snapshot,
        "Purchase Price": sale.purchase_price_snapshot,
        "Purchase Date": sale.purchase_date_snapshot,
        "Sold Price": sale.sold_price,
        "Sold Date": sale.sold_date,
        "Profit": sale.profit,
        "Created At": sale.created_at,
      }))

      const csv = convertToCSV(csvData)
      downloadFile(csv, `car-sales-${getFormattedDate()}.csv`)
      toast.success("Car sales exported successfully")
    } catch (error) {
      console.error("Failed to export car sales:", error)
      toast.error("Failed to export car sales")
    } finally {
      setIsExporting(null)
    }
  }

  // Export Members
  const exportMembers = async () => {
    setIsExporting("members")
    try {
      const response = await membersApi.getAll()
      const members = Array.isArray(response) ? response : (response as { data?: unknown[] }).data || []
      
      if (members.length === 0) {
        toast.info("No members data to export")
        return
      }

      const csvData = (members as Record<string, unknown>[]).map((member) => ({
        "User ID": member.user_id || member.id || "",
        "Name": member.name || member.full_name || "",
        "Email": member.email || "",
        "Phone": member.phone || "",
        "Date of Birth": member.date_of_birth || "",
        "Created At": member.created_at || "",
        "Updated At": member.updated_at || "",
      }))

      const csv = convertToCSV(csvData)
      downloadFile(csv, `members-${getFormattedDate()}.csv`)
      toast.success("Members exported successfully")
    } catch (error) {
      console.error("Failed to export members:", error)
      toast.error("Failed to export members")
    } finally {
      setIsExporting(null)
    }
  }

  // Export Analytics
  const exportAnalytics = async () => {
    setIsExporting("analytics")
    try {
      const [kpisResponse, memberProfitResponse, ageBandsResponse] = await Promise.allSettled([
        analyticsApi.getGlobalKPIs(),
        analyticsApi.getMemberProfitData(),
        analyticsApi.getAgeBandAnalytics(),
      ])

      const kpis = kpisResponse.status === 'fulfilled' ? kpisResponse.value : null
      const memberProfit = memberProfitResponse.status === 'fulfilled' 
        ? (Array.isArray(memberProfitResponse.value) ? memberProfitResponse.value : (memberProfitResponse.value as { data?: unknown[] })?.data || [])
        : []
      const ageBands = ageBandsResponse.status === 'fulfilled'
        ? (Array.isArray(ageBandsResponse.value) ? ageBandsResponse.value : (ageBandsResponse.value as { data?: unknown[] })?.data || [])
        : []

      // Create KPIs CSV
      const kpisData = kpis ? [{
        "Total Invested": kpis.total_invested || 0,
        "Total Profit": kpis.total_profit || 0,
        "Total Cars Bought": kpis.total_cars_bought || 0,
        "Total Cars Sold": kpis.total_cars_sold || 0,
        "Total Members": kpis.total_members || 0,
        "Average Profit Ratio": `${((kpis.average_profit_ratio || 0) * 100).toFixed(2)}%`,
      }] : []

      // Create Member Profit CSV
      const memberProfitData = (memberProfit as Record<string, unknown>[]).map((mp) => ({
        "Member ID": mp.member_id || "",
        "Member Name": mp.member_name || "",
        "Total Invested": mp.total_invested || 0,
        "Profit": mp.profit || 0,
        "Profit Ratio": `${((mp.profit_ratio as number || 0) * 100).toFixed(2)}%`,
      }))

      // Create Age Band CSV
      const ageBandData = (ageBands as Record<string, unknown>[]).map((ab) => ({
        "Age Band": ab.age_band || "",
        "Member Count": ab.member_count || 0,
        "Cars Purchased": ab.cars_purchased || 0,
        "Total Profit": ab.total_profit || 0,
        "Profit Ratio": `${((ab.profit_ratio as number || 0) * 100).toFixed(2)}%`,
      }))

      // Combine all into one CSV with sections
      const sections = []
      if (kpisData.length > 0) {
        sections.push("=== GLOBAL KPIs ===", convertToCSV(kpisData), "")
      }
      if (memberProfitData.length > 0) {
        sections.push("=== MEMBER PROFIT DATA ===", convertToCSV(memberProfitData), "")
      }
      if (ageBandData.length > 0) {
        sections.push("=== AGE BAND ANALYTICS ===", convertToCSV(ageBandData))
      }
      
      if (sections.length === 0) {
        toast.info("No analytics data to export")
        return
      }
      
      const combinedCSV = sections.join("\n")

      downloadFile(combinedCSV, `analytics-${getFormattedDate()}.csv`)
      toast.success("Analytics exported successfully")
    } catch (error) {
      console.error("Failed to export analytics:", error)
      toast.error("Failed to export analytics")
    } finally {
      setIsExporting(null)
    }
  }

  // Export All Data
  const exportAllData = async () => {
    setIsExporting("all")
    try {
      await Promise.all([
        exportCarSalesData(),
        exportMembersData(),
        exportAnalyticsData(),
      ])
      toast.success("All data exported successfully")
    } catch (error) {
      console.error("Failed to export all data:", error)
      toast.error("Failed to export some data")
    } finally {
      setIsExporting(null)
    }
  }

  // Helper functions that return promises without toasts (for parallel export)
  const exportCarSalesData = async () => {
    const sales = await carSalesApi.list()
    if (sales.length === 0) return
    
    const csvData = sales.map(sale => ({
      "Sale ID": sale.id,
      "Car ID": sale.car_id,
      "Member ID": sale.member_id,
      "VIN": sale.vin_snapshot,
      "Make": sale.make_snapshot,
      "Model": sale.model_snapshot,
      "Year": sale.year_snapshot,
      "Purchase Price": sale.purchase_price_snapshot,
      "Purchase Date": sale.purchase_date_snapshot,
      "Sold Price": sale.sold_price,
      "Sold Date": sale.sold_date,
      "Profit": sale.profit,
      "Created At": sale.created_at,
    }))
    
    const csv = convertToCSV(csvData)
    downloadFile(csv, `car-sales-${getFormattedDate()}.csv`)
  }

  const exportMembersData = async () => {
    const response = await membersApi.getAll()
    const members = Array.isArray(response) ? response : (response as { data?: unknown[] }).data || []
    if (members.length === 0) return
    
    const csvData = (members as Record<string, unknown>[]).map((member) => ({
      "User ID": member.user_id || member.id || "",
      "Name": member.name || member.full_name || "",
      "Email": member.email || "",
      "Phone": member.phone || "",
      "Date of Birth": member.date_of_birth || "",
      "Created At": member.created_at || "",
      "Updated At": member.updated_at || "",
    }))
    
    const csv = convertToCSV(csvData)
    downloadFile(csv, `members-${getFormattedDate()}.csv`)
  }

  const exportAnalyticsData = async () => {
    const [kpisResponse, memberProfitResponse, ageBandsResponse] = await Promise.allSettled([
      analyticsApi.getGlobalKPIs(),
      analyticsApi.getMemberProfitData(),
      analyticsApi.getAgeBandAnalytics(),
    ])

    const kpis = kpisResponse.status === 'fulfilled' ? kpisResponse.value : null
    const memberProfit = memberProfitResponse.status === 'fulfilled' 
      ? (Array.isArray(memberProfitResponse.value) ? memberProfitResponse.value : (memberProfitResponse.value as { data?: unknown[] })?.data || [])
      : []
    const ageBands = ageBandsResponse.status === 'fulfilled'
      ? (Array.isArray(ageBandsResponse.value) ? ageBandsResponse.value : (ageBandsResponse.value as { data?: unknown[] })?.data || [])
      : []

    const kpisData = kpis ? [{
      "Total Invested": kpis.total_invested || 0,
      "Total Profit": kpis.total_profit || 0,
      "Total Cars Bought": kpis.total_cars_bought || 0,
      "Total Cars Sold": kpis.total_cars_sold || 0,
      "Total Members": kpis.total_members || 0,
      "Average Profit Ratio": `${((kpis.average_profit_ratio || 0) * 100).toFixed(2)}%`,
    }] : []

    const memberProfitData = (memberProfit as Record<string, unknown>[]).map((mp) => ({
      "Member ID": mp.member_id || "",
      "Member Name": mp.member_name || "",
      "Total Invested": mp.total_invested || 0,
      "Profit": mp.profit || 0,
      "Profit Ratio": `${((mp.profit_ratio as number || 0) * 100).toFixed(2)}%`,
    }))

    const ageBandData = (ageBands as Record<string, unknown>[]).map((ab) => ({
      "Age Band": ab.age_band || "",
      "Member Count": ab.member_count || 0,
      "Cars Purchased": ab.cars_purchased || 0,
      "Total Profit": ab.total_profit || 0,
      "Profit Ratio": `${((ab.profit_ratio as number || 0) * 100).toFixed(2)}%`,
    }))

    const sections = []
    if (kpisData.length > 0) {
      sections.push("=== GLOBAL KPIs ===", convertToCSV(kpisData), "")
    }
    if (memberProfitData.length > 0) {
      sections.push("=== MEMBER PROFIT DATA ===", convertToCSV(memberProfitData), "")
    }
    if (ageBandData.length > 0) {
      sections.push("=== AGE BAND ANALYTICS ===", convertToCSV(ageBandData))
    }

    if (sections.length > 0) {
      const combinedCSV = sections.join("\n")
      downloadFile(combinedCSV, `analytics-${getFormattedDate()}.csv`)
    }
  }

  // Generate Report (PDF-style HTML report that can be printed)
  const generateReport = async () => {
    setIsGeneratingReport(true)
    try {
      const [kpisResponse, memberProfitResponse, ageBandsResponse, salesResponse, membersResponse] = await Promise.allSettled([
        analyticsApi.getGlobalKPIs(),
        analyticsApi.getMemberProfitData(),
        analyticsApi.getAgeBandAnalytics(),
        carSalesApi.list(),
        membersApi.getAll(),
      ])

      // Extract data with fallbacks
      const kpis = kpisResponse.status === 'fulfilled' ? kpisResponse.value : null
      const memberProfit = memberProfitResponse.status === 'fulfilled' 
        ? (Array.isArray(memberProfitResponse.value) ? memberProfitResponse.value : (memberProfitResponse.value as { data?: unknown[] })?.data || [])
        : []
      const ageBands = ageBandsResponse.status === 'fulfilled'
        ? (Array.isArray(ageBandsResponse.value) ? ageBandsResponse.value : (ageBandsResponse.value as { data?: unknown[] })?.data || [])
        : []
      const sales = salesResponse.status === 'fulfilled'
        ? (Array.isArray(salesResponse.value) ? salesResponse.value : [])
        : []
      const membersRaw = membersResponse.status === 'fulfilled' ? membersResponse.value : []
      const members = Array.isArray(membersRaw) ? membersRaw : (membersRaw as { data?: unknown[] })?.data || []

      const reportDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })

      // Calculate additional stats
      const totalSalesValue = sales.reduce((sum, sale) => sum + Number(sale.sold_price), 0)
      const totalProfit = sales.reduce((sum, sale) => sum + Number(sale.profit), 0)
      const avgProfit = sales.length > 0 ? totalProfit / sales.length : 0

      // Top performers
      const topPerformers = [...memberProfit]
        .sort((a, b) => Number((b as Record<string, unknown>).profit) - Number((a as Record<string, unknown>).profit))
        .slice(0, 5)

      // Recent sales
      const recentSales = [...sales]
        .sort((a, b) => {
          const aDate = (a as unknown as Record<string, unknown>).created_at as string
          const bDate = (b as unknown as Record<string, unknown>).created_at as string
          return new Date(bDate).getTime() - new Date(aDate).getTime()
        })
        .slice(0, 10)

      const htmlReport = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TCTPRO Business Report - ${getFormattedDate()}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background: #fff;
      padding: 40px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      padding-bottom: 30px;
      border-bottom: 3px solid #3b82f6;
      margin-bottom: 40px;
    }
    .header h1 { font-size: 2.5rem; color: #1e40af; margin-bottom: 5px; }
    .header .brand { font-size: 1rem; color: #3b82f6; font-weight: 600; margin-bottom: 10px; }
    .header p { color: #64748b; font-size: 1rem; }
    .section { margin-bottom: 40px; }
    .section-title {
      font-size: 1.5rem;
      color: #1e40af;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .kpi-card {
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      padding: 20px;
      border-radius: 12px;
      text-align: center;
      border: 1px solid #e2e8f0;
    }
    .kpi-value { font-size: 1.8rem; font-weight: 700; color: #1e40af; }
    .kpi-label { font-size: 0.875rem; color: #64748b; margin-top: 5px; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
      font-size: 0.9rem;
    }
    th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background: #f1f5f9; font-weight: 600; color: #475569; }
    tr:hover { background: #f8fafc; }
    .profit-positive { color: #059669; font-weight: 600; }
    .profit-negative { color: #dc2626; font-weight: 600; }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      color: #94a3b8;
      font-size: 0.875rem;
    }
    @media print {
      body { padding: 20px; }
      .section { page-break-inside: avoid; }
      .no-print { display: none; }
    }
    .print-btn {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #3b82f6;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .print-btn:hover { background: #2563eb; }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">Save as PDF</button>
  
  <div class="header">
    <div class="brand">TCTPRO</div>
    <h1>Business Performance Report</h1>
    <p>Generated on ${reportDate}</p>
  </div>

  <div class="section">
    <h2 class="section-title">Key Performance Indicators</h2>
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-value">$${Number(kpis?.total_invested || 0).toLocaleString()}</div>
        <div class="kpi-label">Total Invested</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-value">$${Number(kpis?.total_profit || 0).toLocaleString()}</div>
        <div class="kpi-label">Total Profit</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-value">${kpis?.total_cars_bought || 0}</div>
        <div class="kpi-label">Cars Purchased</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-value">${kpis?.total_cars_sold || 0}</div>
        <div class="kpi-label">Cars Sold</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-value">${kpis?.total_members || 0}</div>
        <div class="kpi-label">Active Members</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-value">${((kpis?.average_profit_ratio || 0) * 100).toFixed(1)}%</div>
        <div class="kpi-label">Avg Profit Ratio</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">Top Performing Members</h2>
    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Member Name</th>
          <th>Total Invested</th>
          <th>Profit</th>
          <th>Profit Ratio</th>
        </tr>
      </thead>
      <tbody>
        ${topPerformers.length > 0 ? (topPerformers as Record<string, unknown>[]).map((mp, i) => `
          <tr>
            <td>#${i + 1}</td>
            <td>${mp.member_name || 'Unknown'}</td>
            <td>$${Number(mp.total_invested || 0).toLocaleString()}</td>
            <td class="${Number(mp.profit || 0) >= 0 ? 'profit-positive' : 'profit-negative'}">
              $${Number(mp.profit || 0).toLocaleString()}
            </td>
            <td>${((mp.profit_ratio as number || 0) * 100).toFixed(1)}%</td>
          </tr>
        `).join('') : '<tr><td colspan="5" style="text-align: center; color: #64748b;">No data available</td></tr>'}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2 class="section-title">Age Band Analysis</h2>
    <table>
      <thead>
        <tr>
          <th>Age Band</th>
          <th>Members</th>
          <th>Cars Purchased</th>
          <th>Total Profit</th>
          <th>Profit Ratio</th>
        </tr>
      </thead>
      <tbody>
        ${ageBands.length > 0 ? (ageBands as Record<string, unknown>[]).map((ab) => `
          <tr>
            <td>${ab.age_band || 'Unknown'}</td>
            <td>${ab.member_count || 0}</td>
            <td>${ab.cars_purchased || 0}</td>
            <td class="${Number(ab.total_profit || 0) >= 0 ? 'profit-positive' : 'profit-negative'}">
              $${Number(ab.total_profit || 0).toLocaleString()}
            </td>
            <td>${((ab.profit_ratio as number || 0) * 100).toFixed(1)}%</td>
          </tr>
        `).join('') : '<tr><td colspan="5" style="text-align: center; color: #64748b;">No data available</td></tr>'}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2 class="section-title">Recent Sales</h2>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Vehicle</th>
          <th>Year</th>
          <th>Purchase Price</th>
          <th>Sold Price</th>
          <th>Profit</th>
        </tr>
      </thead>
      <tbody>
        ${recentSales.length > 0 ? (recentSales as unknown as Record<string, unknown>[]).map((sale) => `
          <tr>
            <td>${sale.sold_date ? new Date(sale.sold_date as string).toLocaleDateString() : 'N/A'}</td>
            <td>${sale.make_snapshot || ''} ${sale.model_snapshot || ''}</td>
            <td>${sale.year_snapshot || 'N/A'}</td>
            <td>$${Number(sale.purchase_price_snapshot || 0).toLocaleString()}</td>
            <td>$${Number(sale.sold_price || 0).toLocaleString()}</td>
            <td class="${Number(sale.profit || 0) >= 0 ? 'profit-positive' : 'profit-negative'}">
              $${Number(sale.profit || 0).toLocaleString()}
            </td>
          </tr>
        `).join('') : '<tr><td colspan="6" style="text-align: center; color: #64748b;">No sales data available</td></tr>'}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2 class="section-title">Summary Statistics</h2>
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-value">${sales.length}</div>
        <div class="kpi-label">Total Sales Records</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-value">$${totalSalesValue.toLocaleString()}</div>
        <div class="kpi-label">Total Sales Value</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-value">$${avgProfit.toFixed(0)}</div>
        <div class="kpi-label">Avg Profit per Sale</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-value">${members.length}</div>
        <div class="kpi-label">Total Members</div>
      </div>
    </div>
  </div>

  <div class="footer">
    <p>This report was automatically generated by TCTPRO. For questions, contact your administrator.</p>
    <p>&copy; ${new Date().getFullYear()} TCTPRO - All Rights Reserved</p>
  </div>
</body>
</html>
      `

      // Open report in new window and trigger print dialog for PDF
      const reportWindow = window.open('', '_blank')
      if (reportWindow) {
        reportWindow.document.write(htmlReport)
        reportWindow.document.close()
        // Auto-trigger print dialog after a short delay
        setTimeout(() => {
          reportWindow.print()
        }, 500)
        toast.success("Report generated! Use 'Save as PDF' in the print dialog.")
      } else {
        // Fallback: download as HTML
        downloadFile(htmlReport, `TCTPRO-report-${getFormattedDate()}.html`, "text/html")
        toast.success("Report downloaded! Open in browser and print to save as PDF.")
      }
    } catch (error) {
      console.error("Failed to generate report:", error)
      toast.error("Failed to generate report")
    } finally {
      setIsGeneratingReport(false)
    }
  }

  const isLoading = isExporting !== null || isGeneratingReport

  return (
    <div className="flex items-center space-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="cursor-pointer" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Settings className="h-4 w-4 mr-2" />
            )}
            Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem 
            className="cursor-pointer" 
            onClick={generateReport}
            disabled={isGeneratingReport}
          >
            <FileText className="h-4 w-4 mr-2" />
            {isGeneratingReport ? "Generating..." : "Generate Report"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem 
                  className="cursor-pointer" 
                  onClick={exportCarSales}
                  disabled={isExporting === "car-sales"}
                >
                  <Car className="h-4 w-4 mr-2" />
                  {isExporting === "car-sales" ? "Exporting..." : "Car Sales"}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer" 
                  onClick={exportMembers}
                  disabled={isExporting === "members"}
                >
                  <Users className="h-4 w-4 mr-2" />
                  {isExporting === "members" ? "Exporting..." : "Members"}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer" 
                  onClick={exportAnalytics}
                  disabled={isExporting === "analytics"}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  {isExporting === "analytics" ? "Exporting..." : "Analytics"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer" 
                  onClick={exportAllData}
                  disabled={isExporting === "all"}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  {isExporting === "all" ? "Exporting..." : "Export All"}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
