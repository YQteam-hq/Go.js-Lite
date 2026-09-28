import { EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useI18n } from '@/hooks/useI18n'

interface PreviewModalProps {
  showPreview: boolean
  previewContent: string
  activeTab: string
  onClose: () => void
}

export function PreviewModal({ showPreview, previewContent, activeTab, onClose }: PreviewModalProps) {
  const { t } = useI18n()

  if (!showPreview) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-medium">{t('customErrorPages.preview')} - {activeTab}</h3>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              <EyeOff className="w-4 h-4 mr-2" />
              {t('customErrorPages.closePreview')}
            </Button>
          </div>
        </div>
        <div className="flex-1 p-4">
          <iframe
            srcDoc={previewContent}
            className="w-full h-full border rounded-lg"
            title="Preview"
          />
        </div>
      </div>
    </div>
  )
}
