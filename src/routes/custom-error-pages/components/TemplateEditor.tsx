import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Eye, Save } from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'
import type { ErrorTemplateInput } from '@/api/customErrorPages'

interface TemplateEditorProps {
  editingTemplate: ErrorTemplateInput | null
  onTemplateChange: (template: ErrorTemplateInput | null) => void
  onSave: () => void
  onPreview: (content: string) => void
  isPending: boolean
}

export function TemplateEditor({ editingTemplate, onTemplateChange, onSave, onPreview, isPending }: TemplateEditorProps) {
  const { t } = useI18n()

  if (!editingTemplate) return null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t('customErrorPages.editTemplate')} - {editingTemplate.error_code}</CardTitle>
          <div className="flex gap-2">
            <Button onClick={onSave} disabled={isPending}>
              <Save className="w-4 h-4 mr-2" />
              {t('common.save')}
            </Button>
            <Button variant="ghost" onClick={() => onTemplateChange(null)}>
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">{t('customErrorPages.title')}</label>
          <Input
            value={editingTemplate.title}
            onChange={(e) => onTemplateChange({
              ...editingTemplate,
              title: e.target.value
            })}
            placeholder={t('customErrorPages.titlePlaceholder')}
          />
        </div>
        <div>
          <label className="text-sm font-medium">{t('customErrorPages.content')}</label>
          <textarea
            value={editingTemplate.content}
            onChange={(e) => onTemplateChange({
              ...editingTemplate,
              content: e.target.value
            })}
            className="w-full h-96 p-3 border rounded-lg font-mono text-sm resize-none"
            placeholder={t('customErrorPages.contentPlaceholder')}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {t('customErrorPages.contentHelp')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => onPreview(editingTemplate.content)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {t('customErrorPages.preview')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
