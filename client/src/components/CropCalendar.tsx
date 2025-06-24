import { useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { Crop, CropActivity } from '@shared/schema';
import { CalendarOptions } from '@fullcalendar/core';

interface CropCalendarProps {
  crops: Crop[];
  activities: CropActivity[];
  onEventClick: (info: any) => void;
}

export default function CropCalendar({ crops, activities, onEventClick }: CropCalendarProps) {
  const calendarRef = useRef<FullCalendar>(null);

  const generateEvents = () => {
    const events: any[] = [];
    
    // Add planting dates from crops
    crops.forEach(crop => {
      if (crop.plantingDate) {
        events.push({
          id: `crop-planting-${crop.id}`,
          title: `🌱 Plant: ${crop.name}`,
          start: crop.plantingDate,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
          extendedProps: {
            type: 'planting',
            crop
          }
        });
      }
      
      if (crop.expectedHarvestDate) {
        events.push({
          id: `crop-harvest-${crop.id}`,
          title: `🌾 Harvest: ${crop.name}`,
          start: crop.expectedHarvestDate,
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.7)',
          extendedProps: {
            type: 'harvest',
            crop
          }
        });
      }
    });
    
    // Add activities
    activities.forEach(activity => {
      const cropName = crops.find(c => c.id === activity.cropId)?.name || 'Unknown crop';
      const activityColor = getActivityColor(activity.activityType);
      
      events.push({
        id: `activity-${activity.id}`,
        title: `${activity.activityType}: ${cropName}`,
        start: activity.activityDate,
        borderColor: activityColor,
        backgroundColor: activityColor.replace(')', ', 0.7)').replace('rgb', 'rgba'),
        extendedProps: {
          type: 'activity',
          activity,
          cropName
        }
      });
    });
    
    return events;
  };
  
  const getActivityColor = (activityType: string): string => {
    switch(activityType.toLowerCase()) {
      case 'fertilizing':
        return 'rgb(5, 150, 105)';
      case 'irrigation':
        return 'rgb(59, 130, 246)';
      case 'pest control':
        return 'rgb(239, 68, 68)';
      case 'weeding':
        return 'rgb(217, 119, 6)';
      case 'pruning':
        return 'rgb(124, 58, 237)';
      case 'harvesting':
        return 'rgb(245, 158, 11)';
      default:
        return 'rgb(156, 163, 175)';
    }
  };
  
  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.removeAllEvents();
      generateEvents().forEach(event => {
        calendarApi.addEvent(event);
      });
    }
  }, [crops, activities]);

  const calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek'
    },
    events: generateEvents(),
    eventClick: onEventClick,
    height: 'auto',
    themeSystem: 'standard',
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      meridiem: false
    },
    eventDidMount: (info) => {
      // Add tooltips or additional styling here if needed
    }
  };

  return (
    <div className="crop-calendar">
      <FullCalendar 
        ref={calendarRef}
        {...calendarOptions}
      />
    </div>
  );
}