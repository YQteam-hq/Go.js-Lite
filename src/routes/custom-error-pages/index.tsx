import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Badge } from '@/components/ui/Badge'
import { Code } from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'
import { customErrorPagesApi, type ErrorTemplateInput } from '@/api/customErrorPages'
import { ErrorTemplateTab } from './components/ErrorTemplateTab'
import { TemplateEditor } from './components/TemplateEditor'
import { PreviewModal } from './components/PreviewModal'

export default function CustomErrorPages() {
  const { t } = useI18n()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'403' | '404' | '500'>('403')
  const [editingTemplate, setEditingTemplate] = useState<ErrorTemplateInput | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [previewContent, setPreviewContent] = useState('')

  const { data: templates, isLoading } = useQuery({
    queryKey: ['custom-error-pages'],
    queryFn: () => customErrorPagesApi.config(),
  })

  const updateTemplateMutation = useMutation({
    mutationFn: (data: ErrorTemplateInput) => customErrorPagesApi.saveTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-error-pages'] })
      setEditingTemplate(null)
    }
  })

  const resetTemplateMutation = useMutation({
    mutationFn: (error_code: string) => customErrorPagesApi.resetTemplate(error_code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-error-pages'] })
    }
  })

  const handleEditTemplate = (error_code: string) => {
    const saved = templates?.templates[error_code]
    const fallback = generateLocalTemplate(error_code)
    setEditingTemplate({
      error_code,
      title: saved?.title || fallback.title,
      content: saved?.content || fallback.content
    })
  }

  const handleSaveTemplate = () => {
    if (editingTemplate) {
      updateTemplateMutation.mutate({
        error_code: editingTemplate.error_code,
        title: editingTemplate.title,
        content: editingTemplate.content
      })
    }
  }

  const handleResetTemplate = (error_code: string) => {
    if (!activeTab || !confirm(t('customErrorPages.confirmReset'))) return
    resetTemplateMutation.mutate(error_code)
  }

  const handlePreview = (content: string) => {
    setPreviewContent(content)
    setShowPreview(true)
  }

  const handlePreviewClose = () => {
    setShowPreview(false)
  }

  if (isLoading) {
    return <div className="p-6">{t('common.loading')}</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('customErrorPages.title')}</h1>
        <Badge variant="muted">
          {t('customErrorPages.beta')}
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as '403' | '404' | '500')} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="403" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            {t('customErrorPages.error403')}
          </TabsTrigger>
          <TabsTrigger value="404" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            {t('customErrorPages.error404')}
          </TabsTrigger>
          <TabsTrigger value="500" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            {t('customErrorPages.error500')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="403" className="space-y-4">
          <ErrorTemplateTab
            errorCode="403"
            templates={templates}
            onEdit={handleEditTemplate}
            onReset={handleResetTemplate}
            isResetPending={resetTemplateMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="404" className="space-y-4">
          <ErrorTemplateTab
            errorCode="404"
            templates={templates}
            onEdit={handleEditTemplate}
            onReset={handleResetTemplate}
            isResetPending={resetTemplateMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="500" className="space-y-4">
          <ErrorTemplateTab
            errorCode="500"
            templates={templates}
            onEdit={handleEditTemplate}
            onReset={handleResetTemplate}
            isResetPending={resetTemplateMutation.isPending}
          />
        </TabsContent>
      </Tabs>

      <TemplateEditor
        editingTemplate={editingTemplate}
        onTemplateChange={setEditingTemplate}
        onSave={handleSaveTemplate}
        onPreview={handlePreview}
        isPending={updateTemplateMutation.isPending}
      />

      <PreviewModal
        showPreview={showPreview}
        previewContent={previewContent}
        activeTab={activeTab}
        onClose={handlePreviewClose}
      />
    </div>
  )
}

function generateLocalTemplate(error_code: string) {
  const defaultTemplates = {
    '403': {
      title: '403 Forbidden',
      content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>403 Forbidden</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
        .error-container { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto; }
        .error-code { font-size: 72px; font-weight: bold; color: #e74c3c; margin-bottom: 20px; }
        .error-message { font-size: 24px; color: #333; margin-bottom: 20px; }
        .error-details { font-size: 16px; color: #666; margin-bottom: 30px; }
        .back-button { background: #3498db; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
        .back-button:hover { background: #2980b9; }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="error-code">403</div>
        <div class="error-message">Forbidden</div>
        <div class="error-details">You do not have permission to access this page.</div>
        <button class="back-button" onclick="history.back()">Back to previous page</button>
    </div>
</body>
</html>`
    },
    '404': {
      title: '404 Not Found',
      content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 Not Found</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
        .error-container { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto; }
        .error-code { font-size: 72px; font-weight: bold; color: #e74c3c; margin-bottom: 20px; }
        .error-message { font-size: 24px; color: #333; margin-bottom: 20px; }
        .error-details { font-size: 16px; color: #666; margin-bottom: 30px; }
        .back-button { background: #3498db; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
        .back-button:hover { background: #2980b9; }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="error-code">404</div>
        <div class="error-message">Page Not Found</div>
        <div class="error-details">The page you are looking for does not exist or has been removed.</div>
        <button class="back-button" onclick="history.back()">Back to previous page</button>
    </div>
</body>
</html>`
    },
    '500': {
      title: '500 Internal Server Error',
      content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>500 Internal Server Error</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
        .error-container { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto; }
        .error-code { font-size: 72px; font-weight: bold; color: #e74c3c; margin-bottom: 20px; }
        .error-message { font-size: 24px; color: #333; margin-bottom: 20px; }
        .error-details { font-size: 16px; color: #666; margin-bottom: 30px; }
        .back-button { background: #3498db; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
        .back-button:hover { background: #2980b9; }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="error-code">500</div>
        <div class="error-message">Internal Server Error</div>
        <div class="error-details">The server encountered an unexpected error and could not complete your request.</div>
        <button class="back-button" onclick="history.back()">Back to previous page</button>
    </div>
</body>
</html>`
    }
  }
  return defaultTemplates[error_code as keyof typeof defaultTemplates]
}
