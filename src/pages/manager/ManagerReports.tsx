import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  FileText, 
  Download, 
  Calendar as CalendarIcon,
  Users,
  DoorOpen,
  ShoppingCart,
  Wrench,
  MessageSquareWarning,
  TrendingUp
} from 'lucide-react';
import { format, subDays, subMonths } from 'date-fns';
import { cn } from '@/lib/utils';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  frequency: string;
}

const reportTemplates: ReportTemplate[] = [
  {
    id: 'daily-operations',
    name: 'Daily Operations Report',
    description: 'Overview of daily hotel operations, occupancy, and key metrics',
    icon: TrendingUp,
    color: 'text-blue-500',
    frequency: 'Daily'
  },
  {
    id: 'weekly-occupancy',
    name: 'Weekly Occupancy Report',
    description: 'Detailed occupancy analysis with trends and forecasts',
    icon: DoorOpen,
    color: 'text-green-500',
    frequency: 'Weekly'
  },
  {
    id: 'monthly-revenue',
    name: 'Monthly Revenue Report',
    description: 'Comprehensive revenue breakdown by category and source',
    icon: ShoppingCart,
    color: 'text-accent',
    frequency: 'Monthly'
  },
  {
    id: 'guest-satisfaction',
    name: 'Guest Satisfaction Report',
    description: 'Guest feedback, complaints, and satisfaction metrics',
    icon: Users,
    color: 'text-purple-500',
    frequency: 'Monthly'
  },
  {
    id: 'service-performance',
    name: 'Service Performance Report',
    description: 'Service request response times and resolution rates',
    icon: Wrench,
    color: 'text-orange-500',
    frequency: 'Weekly'
  },
  {
    id: 'complaint-analysis',
    name: 'Complaint Analysis Report',
    description: 'Detailed analysis of complaints, trends, and resolution',
    icon: MessageSquareWarning,
    color: 'text-destructive',
    frequency: 'Monthly'
  }
];

const ManagerReports = () => {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [exportFormat, setExportFormat] = useState<string>('pdf');
  const [generating, setGenerating] = useState(false);

  const handleGenerateReport = async (templateId: string) => {
    setGenerating(true);
    setSelectedReport(templateId);
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real app, this would call an API to generate the report
    console.log('Generating report:', templateId, dateRange, exportFormat);
    
    setGenerating(false);
    setSelectedReport('');
  };

  const quickDateRanges = [
    { label: 'Last 7 days', from: subDays(new Date(), 7), to: new Date() },
    { label: 'Last 30 days', from: subDays(new Date(), 30), to: new Date() },
    { label: 'Last 3 months', from: subMonths(new Date(), 3), to: new Date() },
    { label: 'Last 6 months', from: subMonths(new Date(), 6), to: new Date() },
    { label: 'Last year', from: subMonths(new Date(), 12), to: new Date() }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground mt-1">
          Generate and export custom reports for hotel operations and analytics.
        </p>
      </div>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Report Settings</CardTitle>
          <CardDescription>Configure date range and export format</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Date Range Picker */}
            <div className="flex-1">
              <p className="text-sm font-medium mb-2">Date Range</p>
              <div className="flex flex-wrap gap-2">
                {quickDateRanges.map((range) => (
                  <Button
                    key={range.label}
                    variant={
                      dateRange.from.getTime() === range.from.getTime() && 
                      dateRange.to.getTime() === range.to.getTime()
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    onClick={() => setDateRange({ from: range.from, to: range.to })}
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-[200px] justify-start text-left font-normal")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(dateRange.from, 'MMM dd, yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => date && setDateRange(prev => ({ ...prev, from: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <span className="text-muted-foreground">to</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-[200px] justify-start text-left font-normal")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(dateRange.to, 'MMM dd, yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => date && setDateRange(prev => ({ ...prev, to: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Export Format */}
            <div className="w-full md:w-48">
              <p className="text-sm font-medium mb-2">Export Format</p>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="csv">CSV Spreadsheet</SelectItem>
                  <SelectItem value="xlsx">Excel Workbook</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Templates */}
      <div>
        <h2 className="text-xl font-serif font-semibold mb-4">Report Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-card-hover transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-lg bg-background ${template.color}`}>
                    <template.icon className="w-5 h-5" />
                  </div>
                  <Badge variant="outline">{template.frequency}</Badge>
                </div>
                <CardTitle className="text-lg mt-3">{template.name}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full gap-2"
                  onClick={() => handleGenerateReport(template.id)}
                  disabled={generating}
                >
                  {generating && selectedReport === template.id ? (
                    <>Generating...</>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Generate Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Reports</CardTitle>
          <CardDescription>Previously generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'Monthly Revenue Report', date: 'Dec 31, 2025', format: 'PDF', size: '2.4 MB' },
              { name: 'Weekly Occupancy Report', date: 'Dec 28, 2025', format: 'Excel', size: '1.2 MB' },
              { name: 'Guest Satisfaction Report', date: 'Dec 25, 2025', format: 'PDF', size: '3.1 MB' },
              { name: 'Daily Operations Report', date: 'Dec 24, 2025', format: 'CSV', size: '0.8 MB' }
            ].map((report, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <FileText className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{report.name}</p>
                    <p className="text-xs text-muted-foreground">{report.date} • {report.size}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{report.format}</Badge>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerReports;
