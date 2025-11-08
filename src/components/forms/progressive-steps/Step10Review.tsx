import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Edit, Loader2, FileText, Tag, AlertTriangle, Calendar, MapPin, Paperclip, FileTextIcon } from 'lucide-react';
import { ProgressiveFormData } from '../ProgressiveReportForm';

interface Step10ReviewProps {
  formData: ProgressiveFormData;
  attachedFiles: File[];
  onEdit: (step: number) => void;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
}

const Step10Review = ({ formData, attachedFiles, onEdit, onSubmit, isSubmitting }: Step10ReviewProps) => {
  const getUrgencyLabel = (priority: number) => {
    const labels = { 1: 'Critical', 2: 'High', 3: 'Medium', 4: 'Low', 5: 'Informational' };
    return labels[priority as keyof typeof labels] || 'Medium';
  };

  const getUrgencyColor = (priority: number) => {
    const colors = {
      1: 'bg-red-100 text-red-800 border-red-200',
      2: 'bg-orange-100 text-orange-800 border-orange-200',
      3: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      4: 'bg-blue-100 text-blue-800 border-blue-200',
      5: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[priority as keyof typeof colors] || colors[3];
  };

  const reviewSections = [
    {
      step: 1,
      title: 'Report Title',
      icon: FileText,
      content: formData.title,
      show: true
    },
    {
      step: 2,
      title: 'Description',
      icon: FileTextIcon,
      content: formData.description,
      show: true,
      multiline: true
    },
    {
      step: 4,
      title: 'Category',
      icon: Tag,
      content: `${formData.mainCategory} - ${formData.subCategory === "Other (Please Specify)" ? formData.customCategory : formData.subCategory}`,
      show: true
    },
    {
      step: 5,
      title: 'Priority',
      icon: AlertTriangle,
      content: getUrgencyLabel(formData.priority),
      badge: true,
      badgeColor: getUrgencyColor(formData.priority),
      show: true
    },
    {
      step: 6,
      title: 'When it happened',
      icon: Calendar,
      content: formData.incidentDate || 'Not specified',
      show: !!formData.incidentDate
    },
    {
      step: 6,
      title: 'Where it happened',
      icon: MapPin,
      content: formData.location || 'Not specified',
      show: !!formData.location
    },
    {
      step: 7,
      title: 'Evidence',
      icon: Paperclip,
      content: attachedFiles.length > 0
        ? `${attachedFiles.length} file${attachedFiles.length > 1 ? 's' : ''} attached`
        : 'No files attached',
      show: attachedFiles.length > 0
    },
    {
      step: 8,
      title: 'Witnesses',
      icon: FileTextIcon,
      content: formData.witnesses || 'None specified',
      show: !!formData.witnesses
    },
    {
      step: 8,
      title: 'Previous Reports',
      icon: FileTextIcon,
      content: formData.previousReports ? 'Yes, reported before' : 'First time reporting',
      show: formData.previousReports
    },
    {
      step: 8,
      title: 'Additional Notes',
      icon: FileTextIcon,
      content: formData.additionalNotes || 'None',
      show: !!formData.additionalNotes,
      multiline: true
    }
  ];

  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-green-100">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Review and submit
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Please review your report before submitting
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          ℹ️ Once submitted, you'll receive a tracking ID to check the status of your report and communicate anonymously with the review team.
        </p>
      </div>

      <div className="space-y-3">
        {reviewSections.filter(section => section.show).map((section, index) => {
          const Icon = section.icon;
          return (
            <Card key={index} className="border-2">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <Icon className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-600 mb-1">{section.title}</p>
                      {section.badge ? (
                        <Badge className={section.badgeColor}>
                          {section.content}
                        </Badge>
                      ) : (
                        <p className={`text-sm text-gray-900 ${section.multiline ? 'whitespace-pre-wrap' : 'truncate'}`}>
                          {section.content}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(section.step)}
                    className="flex-shrink-0"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {attachedFiles.length > 0 && (
        <Card className="border-2">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Paperclip className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2">Attached Files ({attachedFiles.length})</p>
                <ul className="space-y-1">
                  {attachedFiles.map((file, i) => (
                    <li key={i} className="text-sm text-gray-700 truncate">
                      • {file.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
        <div className="flex items-start gap-3 mb-4">
          <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-green-900 mb-2">Ready to submit?</h3>
            <p className="text-sm text-green-800 mb-4">
              Your report will be submitted anonymously and securely. You'll receive a tracking ID to monitor its progress.
            </p>
            <ul className="text-sm text-green-800 space-y-1 list-disc list-inside mb-4">
              <li>Your identity is protected with end-to-end encryption</li>
              <li>You can check the status using your tracking ID</li>
              <li>Two-way anonymous messaging is available</li>
              <li>All file metadata has been removed</li>
            </ul>
          </div>
        </div>

        <Button
          size="lg"
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Submitting Report...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Submit Report
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-center text-gray-500">
        By submitting, you confirm that the information provided is accurate to the best of your knowledge.
      </p>
    </div>
  );
};

export default Step10Review;
