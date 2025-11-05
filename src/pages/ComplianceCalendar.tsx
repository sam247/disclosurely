import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { createBrandedPDF, addPDFSection, addPDFField, addPDFTable, downloadPDF, exportToCSV, formatExportDate } from '@/utils/export-utils';

interface CalendarEvent {
  id: string;
  event_title: string;
  event_description: string | null;
  event_type: string;
  due_date: string;
  completed_date: string | null;
  status: string;
  assigned_to_name: string | null;
  created_at: string;
}

export default function ComplianceCalendar() {
  const { organization } = useOrganization();
  const { toast } = useToast();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateEvents, setSelectedDateEvents] = useState<CalendarEvent[]>([]);
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    event_title: '',
    event_description: '',
    event_type: 'policy_review',
    due_date: format(new Date(), 'yyyy-MM-dd'),
    status: 'pending',
    assigned_to_name: ''
  });

  useEffect(() => {
    if (organization?.id) {
      loadEvents();
    }
  }, [organization?.id]);

  useEffect(() => {
    if (selectedDate) {
      const dayEvents = events.filter(event => 
        isSameDay(new Date(event.due_date), selectedDate)
      );
      setSelectedDateEvents(dayEvents);
    }
  }, [selectedDate, events]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('compliance_calendar')
        .select('*')
        .eq('organization_id', organization?.id)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading calendar events:', error);
      toast({
        title: 'Error',
        description: 'Failed to load calendar events.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    try {
      const { error } = await supabase
        .from('compliance_calendar')
        .insert({
          organization_id: organization?.id,
          ...formData
        });

      if (error) throw error;

      toast({
        title: '✅ Event Created',
        description: `${formData.event_title} has been added to the calendar.`
      });

      setIsCreateDialogOpen(false);
      resetForm();
      loadEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: 'Error',
        description: 'Failed to create event.',
        variant: 'destructive'
      });
    }
  };

  const handleCompleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('compliance_calendar')
        .update({ 
          status: 'completed',
          completed_date: new Date().toISOString()
        })
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: '✅ Event Completed',
        description: 'Event marked as completed.'
      });

      loadEvents();
    } catch (error) {
      console.error('Error completing event:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete event.',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      event_title: '',
      event_description: '',
      event_type: 'policy_review',
      due_date: format(new Date(), 'yyyy-MM-dd'),
      status: 'pending',
      assigned_to_name: ''
    });
  };

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      policy_review: 'Policy Review',
      risk_assessment: 'Risk Assessment',
      audit: 'Audit',
      training: 'Training',
      reporting: 'Reporting',
      certification: 'Certification',
      meeting: 'Meeting',
      deadline: 'Deadline',
      other: 'Other'
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: any; label: string; className?: string }> = {
      pending: { variant: 'secondary', label: 'Pending' },
      in_progress: { variant: 'default', label: 'In Progress', className: 'bg-blue-100 text-blue-800' },
      completed: { variant: 'default', label: 'Completed', className: 'bg-green-100 text-green-800' },
      overdue: { variant: 'default', label: 'Overdue', className: 'bg-red-100 text-red-800' },
      cancelled: { variant: 'outline', label: 'Cancelled' }
    };
    
    const { variant, label, className } = config[status] || config.pending;
    return <Badge variant={variant} className={className}>{label}</Badge>;
  };

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      policy_review: 'bg-blue-500',
      risk_assessment: 'bg-amber-500',
      audit: 'bg-purple-500',
      training: 'bg-green-500',
      reporting: 'bg-pink-500',
      certification: 'bg-indigo-500',
      meeting: 'bg-cyan-500',
      deadline: 'bg-red-500',
      other: 'bg-gray-500'
    };
    return colors[type] || colors.other;
  };

  // Export calendar events as PDF
  const exportEventsToPDF = () => {
    try {
      if (events.length === 0) {
        toast({
          title: 'No Data',
          description: 'No calendar events to export.',
          variant: 'destructive'
        });
        return;
      }

      const doc = createBrandedPDF('Compliance Calendar', organization?.name || '');
      
      let y = 50;
      y = addPDFSection(doc, 'Event Summary', y);
      y = addPDFField(doc, 'Total Events', events.length.toString(), y);
      y = addPDFField(doc, 'Pending Events', events.filter(e => e.status === 'pending').length.toString(), y);
      y = addPDFField(doc, 'In Progress', events.filter(e => e.status === 'in_progress').length.toString(), y);
      y = addPDFField(doc, 'Completed Events', events.filter(e => e.status === 'completed').length.toString(), y);
      y = addPDFField(doc, 'Overdue Events', events.filter(e => e.status === 'overdue').length.toString(), y);
      
      y += 5;
      
      // Table headers
      const headers = ['Event Title', 'Type', 'Due Date', 'Status', 'Assigned To'];
      
      // Table data (sorted by due date)
      const sortedEvents = [...events].sort((a, b) => 
        new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      );
      
      const tableData = sortedEvents.map(event => [
        event.event_title,
        getEventTypeLabel(event.event_type),
        formatExportDate(event.due_date),
        event.status.toUpperCase(),
        event.assigned_to_name || 'Unassigned'
      ]);
      
      addPDFTable(doc, headers, tableData, y);
      
      downloadPDF(doc, `compliance-calendar-${new Date().toISOString().split('T')[0]}`);
      
      toast({
        title: 'PDF Generated',
        description: `${events.length} events exported successfully.`
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate PDF.',
        variant: 'destructive'
      });
    }
  };

  // Export calendar events as CSV
  const exportEventsToCSV = () => {
    try {
      if (events.length === 0) {
        toast({
          title: 'No Data',
          description: 'No calendar events to export.',
          variant: 'destructive'
        });
        return;
      }

      const csvData = events.map(event => ({
        'Event Title': event.event_title,
        'Description': event.event_description || '',
        'Type': getEventTypeLabel(event.event_type),
        'Due Date': formatExportDate(event.due_date),
        'Status': event.status.toUpperCase(),
        'Completed Date': event.completed_date ? formatExportDate(event.completed_date) : '',
        'Assigned To': event.assigned_to_name || 'Unassigned',
        'Created': formatExportDate(event.created_at)
      }));

      exportToCSV(csvData, `calendar-events-${new Date().toISOString().split('T')[0]}`);

      toast({
        title: 'CSV Generated',
        description: `${events.length} events exported successfully.`
      });
    } catch (error) {
      console.error('Error generating CSV:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate CSV.',
        variant: 'destructive'
      });
    }
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Fill in days from previous/next month to make full weeks
  const firstDayOfWeek = monthStart.getDay();
  const lastDayOfWeek = monthEnd.getDay();
  const paddingStart = Array(firstDayOfWeek).fill(null);
  const paddingEnd = Array(6 - lastDayOfWeek).fill(null);
  const allDays = [...paddingStart, ...calendarDays, ...paddingEnd];

  const upcomingEvents = events
    .filter(e => e.status !== 'completed' && new Date(e.due_date) >= new Date())
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 5);

  const overdueEvents = events.filter(e => e.status === 'overdue');

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0 p-6 pb-4 border-b bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Compliance Calendar</h1>
            <p className="text-muted-foreground">Track deadlines, reviews, and compliance events</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportEventsToPDF}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" size="sm" onClick={exportEventsToCSV}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{upcomingEvents.length}</div>
            <p className="text-xs text-muted-foreground">Next 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overdueEvents.length}</div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Completed This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {events.filter(e => 
                e.status === 'completed' && 
                isSameMonth(new Date(e.due_date), currentMonth)
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">{format(currentMonth, 'MMMM yyyy')}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2 flex flex-col min-h-0">
          <CardHeader className="flex-shrink-0">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle>{format(currentMonth, 'MMMM yyyy')}</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date())}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 overflow-auto">
            <div className="grid grid-cols-7 gap-1 sm:gap-2 min-w-0">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1 sm:py-2">
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {allDays.map((day, index) => {
                if (!day) {
                  return <div key={`empty-${index}`} className="aspect-square" />;
                }

                const dayEvents = events.filter(event => isSameDay(new Date(event.due_date), day));
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isTodayDate = isToday(day);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "aspect-square p-1 sm:p-2 rounded-lg border-2 transition-colors relative text-xs sm:text-sm",
                      isSelected && "border-primary bg-primary/5",
                      !isSelected && "border-transparent hover:border-primary/50",
                      !isCurrentMonth && "opacity-40",
                      isTodayDate && "bg-blue-50"
                    )}
                  >
                    <div className={cn(
                      "text-sm font-medium",
                      isTodayDate && "text-blue-600 font-bold"
                    )}>
                      {format(day, 'd')}
                    </div>
                    {dayEvents.length > 0 && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                        {dayEvents.slice(0, 3).map((event, i) => (
                          <div
                            key={i}
                            className={cn("w-1.5 h-1.5 rounded-full", getEventTypeColor(event.event_type))}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t flex-shrink-0">
              <div className="text-xs font-medium text-muted-foreground mb-2">Event Types:</div>
              <div className="flex flex-wrap gap-3 text-xs">
                {[
                  { type: 'policy_review', label: 'Policy Review' },
                  { type: 'risk_assessment', label: 'Risk Assessment' },
                  { type: 'audit', label: 'Audit' },
                  { type: 'training', label: 'Training' }
                ].map(({ type, label }) => (
                  <div key={type} className="flex items-center gap-1.5">
                    <div className={cn("w-2 h-2 rounded-full", getEventTypeColor(type))}></div>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Events / Upcoming Events */}
        <Card className="flex flex-col min-h-0">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="text-base">
              {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Upcoming Events'}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 overflow-y-auto">
            <div className="space-y-3">
              {selectedDate && selectedDateEvents.length > 0 ? (
                selectedDateEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={() => {
                      setSelectedEvent(event);
                      setIsViewDialogOpen(true);
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <div className={cn("w-3 h-3 rounded-full mt-1 flex-shrink-0", getEventTypeColor(event.event_type))}></div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{event.event_title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{getEventTypeLabel(event.event_type)}</div>
                        <div className="mt-1">{getStatusBadge(event.status)}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : selectedDate && selectedDateEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No events on this date
                </div>
              ) : (
                upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={() => {
                      setSelectedEvent(event);
                      setIsViewDialogOpen(true);
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <div className={cn("w-3 h-3 rounded-full mt-1 flex-shrink-0", getEventTypeColor(event.event_type))}></div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{event.event_title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {format(new Date(event.due_date), 'MMM d, yyyy')} • {getEventTypeLabel(event.event_type)}
                        </div>
                        <div className="mt-1">{getStatusBadge(event.status)}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      </div>

      {/* Create Event Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Calendar Event</DialogTitle>
            <DialogDescription>
              Schedule a compliance activity or deadline
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="event_title">Event Title *</Label>
              <Input
                id="event_title"
                placeholder="e.g., Annual Data Privacy Policy Review"
                value={formData.event_title}
                onChange={(e) => setFormData({ ...formData, event_title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_description">Description</Label>
              <Textarea
                id="event_description"
                placeholder="Additional details about this event..."
                value={formData.event_description}
                onChange={(e) => setFormData({ ...formData, event_description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event_type">Event Type *</Label>
                <Select 
                  value={formData.event_type} 
                  onValueChange={(value) => setFormData({ ...formData, event_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="policy_review">Policy Review</SelectItem>
                    <SelectItem value="risk_assessment">Risk Assessment</SelectItem>
                    <SelectItem value="audit">Audit</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="reporting">Reporting</SelectItem>
                    <SelectItem value="certification">Certification</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date *</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assigned_to_name">Assigned To</Label>
                <Input
                  id="assigned_to_name"
                  placeholder="e.g., Sarah Johnson"
                  value={formData.assigned_to_name}
                  onChange={(e) => setFormData({ ...formData, assigned_to_name: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateEvent} disabled={!formData.event_title}>
              Add Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Event Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.event_title}</DialogTitle>
            <DialogDescription>Event Details</DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="outline">{getEventTypeLabel(selectedEvent.event_type)}</Badge>
                {getStatusBadge(selectedEvent.status)}
                <div className="text-sm text-muted-foreground">
                  Due: {format(new Date(selectedEvent.due_date), 'MMMM d, yyyy')}
                </div>
              </div>

              {selectedEvent.event_description && (
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedEvent.event_description}</p>
                </div>
              )}

              {selectedEvent.assigned_to_name && (
                <div>
                  <Label className="text-sm font-medium">Assigned To</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedEvent.assigned_to_name}</p>
                </div>
              )}

              {selectedEvent.completed_date && (
                <div>
                  <Label className="text-sm font-medium">Completed On</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {format(new Date(selectedEvent.completed_date), 'MMMM d, yyyy')}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            {selectedEvent && selectedEvent.status !== 'completed' && (
              <Button onClick={() => {
                handleCompleteEvent(selectedEvent.id);
                setIsViewDialogOpen(false);
              }}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark Complete
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

