import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Eye, RotateCcw } from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'
import type { ErrorTemplate } from '@/api/customErrorPages'
import { generateTemplate } from '../helpers'

interface ErrorTemplateTabProps {
  errorCode: '403' | '404' | '500'
  templates: { templates?: Record<string, ErrorTemplate> } | undefined
  onEdit: (errorCode: string) => void
  onReset: (errorCode: string) => void
  isResetPending: boolean
}

export function ErrorTemplateTab({ errorCode, templates, onEdit, onReset, isResetPending }: ErrorTemplateTabProps) {
  const { t } = useI18n()

  const template = templates?.templates?.[errorCode]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t('customErrorPages.editTemplate')} - {errorCode}</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(errorCode)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {t('customErrorPages.edit')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReset(errorCode)}
              disabled={isResetPending}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {t('customErrorPages.reset')}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {template ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">{errorCode}</span>
              {template.updated_at && (
                <Badge variant="accent" className="text-xs">
                  {t('customErrorPages.customized')}
                </Badge>
              )}
            </div>
            <div className="border rounded-lg overflow-hidden">
              <div
                className="w-full h-96 bg-white"
                dangerouslySetInnerHTML={{ __html: template.content || '' }}
              />
              <div className="p-3 bg-muted text-sm text-muted-foreground">
                {t('customErrorPages.lastUpdated')}: {new Date(template.updated_at || 0).toLocaleString()}
              </div>
            </div>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <div
              className="w-full h-96 bg-white"
              dangerouslySetInnerHTML={{ __html: generateTemplate(errorCode).content }}
            />
            <div className="p-3 bg-muted text-sm text-muted-foreground">
              {t('customErrorPages.usingDefault')}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
