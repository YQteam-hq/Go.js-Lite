import { useState } from 'react'
import { Card, CardBody } from '@/components/ui/Card'
import { BackupHeader } from './components/BackupHeader'
import { BackupTabs } from './components/BackupTabs'
import { ArchivesTab } from './components/ArchivesTab'
import { DestinationsTab } from './components/DestinationsTab'
import { SchedulesTabStub } from './components/SchedulesTab'
import type { BackupTab } from './types'

export default function Backup() {
  const [activeTab, setActiveTab] = useState<BackupTab>('archives')

  return (
    <div className="p-4 md:p-6 space-y-5">
      <BackupHeader />

      <Card className="card-hover">
        <BackupTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <CardBody className="p-0">
          {activeTab === 'archives' && <ArchivesTab />}
          {activeTab === 'destinations' && <DestinationsTab />}
          {activeTab === 'schedules' && <SchedulesTabStub />}
        </CardBody>
      </Card>
    </div>
  )
}
