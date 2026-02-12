'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { 
  Users, FolderKanban, DollarSign, BarChart3, UserCheck, 
  Download, Plus, Pencil, Trash2, FileSpreadsheet, FileJson, FileText,
  Calendar, Hash, Wallet, TrendingUp, AlertCircle, CheckCircle2
} from 'lucide-react'

// ==================== TYPES ====================
interface Member {
  id: string
  code: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  createdAt: string
}

interface ProjectMember {
  memberId: string
  budget: number
}

interface ProjectFee {
  id: string
  label: string
  amount: number
}

interface Project {
  id: string
  code: string
  name: string
  members: ProjectMember[]
  fees: ProjectFee[]
  createdAt: string
}

interface Allocation {
  id: string
  projectId: string
  memberId: string
  date: string
  checkNumber: string
  amount: number
  createdAt: string
}

interface AppData {
  members: Member[]
  projects: Project[]
  allocations: Allocation[]
}

// ==================== STORAGE MODULE ====================
const STORAGE_KEY = 'urbasen_data'

const StorageModule = {
  save(data: AppData): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    }
  },

  load(): AppData {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    }
    return { members: [], projects: [], allocations: [] }
  },

  clear(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
  }
}

// ==================== CALCULATIONS MODULE ====================
const CalculationsModule = {
  getTotalReceivedByMemberInProject(allocations: Allocation[], projectId: string, memberId: string): number {
    return allocations
      .filter(a => a.projectId === projectId && a.memberId === memberId)
      .reduce((sum, a) => sum + a.amount, 0)
  },

  getTotalBudgetByProject(project: Project): number {
    return project.members.reduce((sum, m) => sum + m.budget, 0)
  },

  getTotalFeesByProject(project: Project): number {
    return project.fees.reduce((sum, f) => sum + f.amount, 0)
  },

  getTotalProjectCost(project: Project): number {
    return this.getTotalBudgetByProject(project) + this.getTotalFeesByProject(project)
  },

  getMemberRemainingBudget(project: Project, memberId: string, allocations: Allocation[]): number {
    const memberData = project.members.find(m => m.memberId === memberId)
    if (!memberData) return 0
    const received = this.getTotalReceivedByMemberInProject(allocations, project.id, memberId)
    return memberData.budget - received
  }
}

// ==================== FORMAT UTILS ====================
const formatFCFA = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
}

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('fr-FR')
}

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// ==================== MAIN COMPONENT ====================
export default function Home() {
  // Initial data loader
  const getInitialData = (): AppData => {
    if (typeof window !== 'undefined') {
      return StorageModule.load()
    }
    return { members: [], projects: [], allocations: [] }
  }

  // State
  const [data, setData] = useState<AppData>({ members: [], projects: [], allocations: [] })
  const [activeTab, setActiveTab] = useState('members')
  const [loaded, setLoaded] = useState(false)

  // Modal states
  const [memberModalOpen, setMemberModalOpen] = useState(false)
  const [projectModalOpen, setProjectModalOpen] = useState(false)
  const [allocationModalOpen, setAllocationModalOpen] = useState(false)
  const [feeModalOpen, setFeeModalOpen] = useState(false)
  const [projectDetailOpen, setProjectDetailOpen] = useState(false)

  // Edit states
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [editingFee, setEditingFee] = useState<ProjectFee | null>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

  // Form states
  const [memberForm, setMemberForm] = useState({ code: '', firstName: '', lastName: '', email: '', phone: '' })
  const [projectForm, setProjectForm] = useState({ code: '', name: '' })
  const [allocationForm, setAllocationForm] = useState({ projectId: '', memberId: '', date: '', checkNumber: '', amount: '' })
  const [feeForm, setFeeForm] = useState({ label: '', amount: '' })
  const [projectMembersForm, setProjectMembersForm] = useState<{ memberId: string; budget: string }[]>([])

  // Load data on mount
  useEffect(() => {
    const stored = getInitialData()
    // Use flushSync pattern by queuing state updates
    Promise.resolve().then(() => {
      setData(stored)
      setLoaded(true)
    })
  }, [])

  // Auto-save
  useEffect(() => {
    if (loaded) {
      StorageModule.save(data)
    }
  }, [data, loaded])

  // ==================== MEMBERS CRUD ====================
  const resetMemberForm = () => {
    setMemberForm({ code: '', firstName: '', lastName: '', email: '', phone: '' })
    setEditingMember(null)
  }

  const openMemberModal = (member?: Member) => {
    if (member) {
      setEditingMember(member)
      setMemberForm({
        code: member.code,
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email || '',
        phone: member.phone || ''
      })
    } else {
      resetMemberForm()
    }
    setMemberModalOpen(true)
  }

  const saveMember = () => {
    if (!memberForm.code.trim() || !memberForm.firstName.trim() || !memberForm.lastName.trim()) {
      toast.error('Erreur', { description: 'Le code, le prénom et le nom sont obligatoires' })
      return
    }

    const existingCode = data.members.find(m => 
      m.code.toLowerCase() === memberForm.code.toLowerCase() && m.id !== editingMember?.id
    )
    if (existingCode) {
      toast.error('Erreur', { description: 'Un membre avec ce code existe déjà' })
      return
    }

    if (editingMember) {
      setData(prev => ({
        ...prev,
        members: prev.members.map(m => m.id === editingMember.id ? {
          ...m,
          code: memberForm.code.trim(),
          firstName: memberForm.firstName.trim(),
          lastName: memberForm.lastName.trim(),
          email: memberForm.email.trim() || undefined,
          phone: memberForm.phone.trim() || undefined
        } : m)
      }))
      toast.success('Succès', { description: 'Membre modifié avec succès' })
    } else {
      const newMember: Member = {
        id: generateId(),
        code: memberForm.code.trim(),
        firstName: memberForm.firstName.trim(),
        lastName: memberForm.lastName.trim(),
        email: memberForm.email.trim() || undefined,
        phone: memberForm.phone.trim() || undefined,
        createdAt: new Date().toISOString()
      }
      setData(prev => ({ ...prev, members: [...prev.members, newMember] }))
      toast.success('Succès', { description: 'Membre ajouté avec succès' })
    }

    setMemberModalOpen(false)
    resetMemberForm()
  }

  const deleteMember = (memberId: string) => {
    const usedInProject = data.projects.some(p => p.members.some(m => m.memberId === memberId))
    if (usedInProject) {
      toast.error('Suppression impossible', { 
        description: 'Ce membre est utilisé dans un ou plusieurs projets' 
      })
      return
    }

    setData(prev => ({
      ...prev,
      members: prev.members.filter(m => m.id !== memberId)
    }))
    toast.success('Succès', { description: 'Membre supprimé avec succès' })
  }

  // ==================== PROJECTS CRUD ====================
  const resetProjectForm = () => {
    setProjectForm({ code: '', name: '' })
    setProjectMembersForm([])
    setEditingProject(null)
  }

  const openProjectModal = (project?: Project) => {
    if (project) {
      setEditingProject(project)
      setProjectForm({ code: project.code, name: project.name })
      setProjectMembersForm(project.members.map(m => ({ memberId: m.memberId, budget: m.budget.toString() })))
    } else {
      resetProjectForm()
    }
    setProjectModalOpen(true)
  }

  const saveProject = () => {
    if (!projectForm.code.trim() || !projectForm.name.trim()) {
      toast.error('Erreur', { description: 'Le code et le nom du projet sont obligatoires' })
      return
    }

    const existingCode = data.projects.find(p => 
      p.code.toLowerCase() === projectForm.code.toLowerCase() && p.id !== editingProject?.id
    )
    if (existingCode) {
      toast.error('Erreur', { description: 'Un projet avec ce code existe déjà' })
      return
    }

    const validMembers = projectMembersForm.filter(m => m.memberId && parseInt(m.budget) > 0)
    const members: ProjectMember[] = validMembers.map(m => ({
      memberId: m.memberId,
      budget: parseInt(m.budget)
    }))

    if (editingProject) {
      // Check budget reductions
      for (const newMember of members) {
        const oldMember = editingProject.members.find(m => m.memberId === newMember.memberId)
        if (oldMember && newMember.budget < oldMember.budget) {
          const received = CalculationsModule.getTotalReceivedByMemberInProject(
            data.allocations, editingProject.id, newMember.memberId
          )
          if (received > newMember.budget) {
            const member = data.members.find(m => m.id === newMember.memberId)
            toast.error('Budget insuffisant', { 
              description: `Le budget de ${member?.firstName} ${member?.lastName} ne peut pas être réduit car il a déjà reçu ${formatFCFA(received)}` 
            })
            return
          }
        }
      }

      setData(prev => ({
        ...prev,
        projects: prev.projects.map(p => p.id === editingProject.id ? {
          ...p,
          code: projectForm.code.trim(),
          name: projectForm.name.trim(),
          members
        } : p)
      }))
      toast.success('Succès', { description: 'Projet modifié avec succès' })
    } else {
      const newProject: Project = {
        id: generateId(),
        code: projectForm.code.trim(),
        name: projectForm.name.trim(),
        members,
        fees: [],
        createdAt: new Date().toISOString()
      }
      setData(prev => ({ ...prev, projects: [...prev.projects, newProject] }))
      toast.success('Succès', { description: 'Projet créé avec succès' })
    }

    setProjectModalOpen(false)
    resetProjectForm()
  }

  const openProjectDetail = (projectId: string) => {
    setSelectedProjectId(projectId)
    setProjectDetailOpen(true)
  }

  // ==================== FEES CRUD ====================
  const openFeeModal = (projectId: string, fee?: ProjectFee) => {
    setSelectedProjectId(projectId)
    if (fee) {
      setEditingFee(fee)
      setFeeForm({ label: fee.label, amount: fee.amount.toString() })
    } else {
      setEditingFee(null)
      setFeeForm({ label: '', amount: '' })
    }
    setFeeModalOpen(true)
  }

  const saveFee = () => {
    if (!feeForm.label.trim() || !feeForm.amount || parseInt(feeForm.amount) <= 0) {
      toast.error('Erreur', { description: 'Le libellé et le montant sont obligatoires' })
      return
    }

    if (!selectedProjectId) return

    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id !== selectedProjectId) return p
        
        if (editingFee) {
          return {
            ...p,
            fees: p.fees.map(f => f.id === editingFee.id ? {
              ...f,
              label: feeForm.label.trim(),
              amount: parseInt(feeForm.amount)
            } : f)
          }
        } else {
          return {
            ...p,
            fees: [...p.fees, {
              id: generateId(),
              label: feeForm.label.trim(),
              amount: parseInt(feeForm.amount)
            }]
          }
        }
      })
    }))

    toast.success(editingFee ? 'Frais modifié' : 'Frais ajouté')
    setFeeModalOpen(false)
    setEditingFee(null)
    setFeeForm({ label: '', amount: '' })
  }

  const deleteFee = (projectId: string, feeId: string) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => 
        p.id === projectId ? { ...p, fees: p.fees.filter(f => f.id !== feeId) } : p
      )
    }))
    toast.success('Frais supprimé')
  }

  // ==================== ALLOCATIONS CRUD ====================
  const resetAllocationForm = () => {
    setAllocationForm({ projectId: '', memberId: '', date: '', checkNumber: '', amount: '' })
  }

  const openAllocationModal = () => {
    resetAllocationForm()
    setAllocationModalOpen(true)
  }

  const saveAllocation = () => {
    const amount = parseInt(allocationForm.amount)
    
    if (!allocationForm.projectId || !allocationForm.memberId || !allocationForm.date || !allocationForm.amount || amount <= 0) {
      toast.error('Erreur', { description: 'Tous les champs sont obligatoires' })
      return
    }

    const project = data.projects.find(p => p.id === allocationForm.projectId)
    const memberBudget = project?.members.find(m => m.memberId === allocationForm.memberId)
    
    if (!memberBudget) {
      toast.error('Erreur', { description: 'Ce membre n\'est pas dans ce projet' })
      return
    }

    const alreadyReceived = CalculationsModule.getTotalReceivedByMemberInProject(
      data.allocations, allocationForm.projectId, allocationForm.memberId
    )

    if (alreadyReceived + amount > memberBudget.budget) {
      const remaining = memberBudget.budget - alreadyReceived
      toast.error('Budget dépassé', { 
        description: `Budget restant: ${formatFCFA(remaining)}. Tentative d'allocation: ${formatFCFA(amount)}` 
      })
      return
    }

    const newAllocation: Allocation = {
      id: generateId(),
      projectId: allocationForm.projectId,
      memberId: allocationForm.memberId,
      date: allocationForm.date,
      checkNumber: allocationForm.checkNumber.trim(),
      amount,
      createdAt: new Date().toISOString()
    }

    setData(prev => ({ ...prev, allocations: [...prev.allocations, newAllocation] }))
    toast.success('Allocation enregistrée', { description: formatFCFA(amount) })
    setAllocationModalOpen(false)
    resetAllocationForm()
  }

  // ==================== EXPORT FUNCTIONS ====================
  const exportJSON = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      members: data.members,
      projects: data.projects.map(p => ({
        ...p,
        memberDetails: p.members.map(pm => {
          const m = data.members.find(mem => mem.id === pm.memberId)
          return { ...m, budget: pm.budget }
        }),
        totalBudget: CalculationsModule.getTotalBudgetByProject(p),
        totalFees: CalculationsModule.getTotalFeesByProject(p),
        totalCost: CalculationsModule.getTotalProjectCost(p)
      })),
      allocations: data.allocations.map(a => {
        const project = data.projects.find(p => p.id === a.projectId)
        const member = data.members.find(m => m.id === a.memberId)
        return {
          ...a,
          projectName: project?.name,
          memberName: member ? `${member.firstName} ${member.lastName}` : 'Inconnu'
        }
      })
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `urbasen_export_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Export JSON réussi')
  }

  const exportCSV = () => {
    let csv = 'Type,Code/ID,Nom,Prénom,Email,Téléphone,Projet,Budget,Reçu,Reste,Date,N°Chèque,Montant\n'

    // Members
    data.members.forEach(m => {
      csv += `Membre,${m.code},${m.lastName},${m.firstName},${m.email || ''},${m.phone || ''},,,,,,,\n`
    })

    // Projects
    data.projects.forEach(p => {
      const totalBudget = CalculationsModule.getTotalBudgetByProject(p)
      const totalFees = CalculationsModule.getTotalFeesByProject(p)
      csv += `Projet,${p.code},${p.name},,,,,,,,Total Budget,${totalBudget}\n`
      csv += `Projet,${p.code},${p.name},,,,,,,,Total Frais,${totalFees}\n`
    })

    // Allocations
    data.allocations.forEach(a => {
      const project = data.projects.find(p => p.id === a.projectId)
      const member = data.members.find(m => m.id === a.memberId)
      csv += `Allocation,${a.id},${member?.lastName || ''},${member?.firstName || ''},,,${project?.name || ''},,,${a.date},${a.checkNumber},${a.amount}\n`
    })

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `urbasen_export_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Export CSV réussi')
  }

  const exportExcel = () => {
    // Generate Excel-compatible XML format
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<?mso-application progid="Excel.Sheet"?>\n<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet">\n'

    // Sheet 1: Members
    xml += '<Worksheet ss:Name="Membres"><Table>\n'
    xml += '<Row><Cell><Data ss:Type="String">Code</Data></Cell><Cell><Data ss:Type="String">Prénom</Data></Cell><Cell><Data ss:Type="String">Nom</Data></Cell><Cell><Data ss:Type="String">Email</Data></Cell><Cell><Data ss:Type="String">Téléphone</Data></Cell></Row>\n'
    data.members.forEach(m => {
      xml += `<Row><Cell><Data ss:Type="String">${m.code}</Data></Cell><Cell><Data ss:Type="String">${m.firstName}</Data></Cell><Cell><Data ss:Type="String">${m.lastName}</Data></Cell><Cell><Data ss:Type="String">${m.email || ''}</Data></Cell><Cell><Data ss:Type="String">${m.phone || ''}</Data></Cell></Row>\n`
    })
    xml += '</Table></Worksheet>\n'

    // Sheet 2: Projects
    xml += '<Worksheet ss:Name="Projets"><Table>\n'
    xml += '<Row><Cell><Data ss:Type="String">Code</Data></Cell><Cell><Data ss:Type="String">Nom</Data></Cell><Cell><Data ss:Type="String">Total Budget</Data></Cell><Cell><Data ss:Type="String">Total Frais</Data></Cell><Cell><Data ss:Type="String">Coût Total</Data></Cell></Row>\n'
    data.projects.forEach(p => {
      xml += `<Row><Cell><Data ss:Type="String">${p.code}</Data></Cell><Cell><Data ss:Type="String">${p.name}</Data></Cell><Cell><Data ss:Type="Number">${CalculationsModule.getTotalBudgetByProject(p)}</Data></Cell><Cell><Data ss:Type="Number">${CalculationsModule.getTotalFeesByProject(p)}</Data></Cell><Cell><Data ss:Type="Number">${CalculationsModule.getTotalProjectCost(p)}</Data></Cell></Row>\n`
    })
    xml += '</Table></Worksheet>\n'

    // Sheet 3: Allocations
    xml += '<Worksheet ss:Name="Allocations"><Table>\n'
    xml += '<Row><Cell><Data ss:Type="String">Projet</Data></Cell><Cell><Data ss:Type="String">Membre</Data></Cell><Cell><Data ss:Type="String">Date</Data></Cell><Cell><Data ss:Type="String">N° Chèque</Data></Cell><Cell><Data ss:Type="String">Montant (FCFA)</Data></Cell></Row>\n'
    data.allocations.forEach(a => {
      const project = data.projects.find(p => p.id === a.projectId)
      const member = data.members.find(m => m.id === a.memberId)
      xml += `<Row><Cell><Data ss:Type="String">${project?.name || ''}</Data></Cell><Cell><Data ss:Type="String">${member ? `${member.firstName} ${member.lastName}` : ''}</Data></Cell><Cell><Data ss:Type="String">${a.date}</Data></Cell><Cell><Data ss:Type="String">${a.checkNumber}</Data></Cell><Cell><Data ss:Type="Number">${a.amount}</Data></Cell></Row>\n`
    })
    xml += '</Table></Worksheet>\n'

    // Sheet 4: Suivi Projet
    xml += '<Worksheet ss:Name="Suivi Projet"><Table>\n'
    xml += '<Row><Cell><Data ss:Type="String">Projet</Data></Cell><Cell><Data ss:Type="String">Membre</Data></Cell><Cell><Data ss:Type="String">Budget Alloué</Data></Cell><Cell><Data ss:Type="String">Total Reçu</Data></Cell><Cell><Data ss:Type="String">Reste</Data></Cell></Row>\n'
    data.projects.forEach(p => {
      p.members.forEach(pm => {
        const member = data.members.find(m => m.id === pm.memberId)
        const received = CalculationsModule.getTotalReceivedByMemberInProject(data.allocations, p.id, pm.memberId)
        const remaining = pm.budget - received
        xml += `<Row><Cell><Data ss:Type="String">${p.name}</Data></Cell><Cell><Data ss:Type="String">${member ? `${member.firstName} ${member.lastName}` : ''}</Data></Cell><Cell><Data ss:Type="Number">${pm.budget}</Data></Cell><Cell><Data ss:Type="Number">${received}</Data></Cell><Cell><Data ss:Type="Number">${remaining}</Data></Cell></Row>\n`
      })
    })
    xml += '</Table></Worksheet>\n'

    xml += '</Workbook>'

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `urbasen_export_${new Date().toISOString().split('T')[0]}.xls`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Export Excel réussi')
  }

  // ==================== RENDER HELPERS ====================
  const getMemberName = (memberId: string): string => {
    const member = data.members.find(m => m.id === memberId)
    return member ? `${member.firstName} ${member.lastName}` : 'Inconnu'
  }

  const getProjectName = (projectId: string): string => {
    const project = data.projects.find(p => p.id === projectId)
    return project?.name || 'Inconnu'
  }

  const selectedProject = selectedProjectId ? data.projects.find(p => p.id === selectedProjectId) : null

  // ==================== RENDER ====================
  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  System de gestion de projet URBASEN
                </h1>
                <p className="text-xs text-muted-foreground">Gestion de projets et suivi financier</p>
              </div>
            </div>
            <Badge variant="outline" className="text-emerald-600 border-emerald-200">
              {formatFCFA(0).split(' ')[1]}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 lg:grid-cols-7 gap-2 h-auto p-2 bg-muted/50">
            <TabsTrigger value="members" className="flex items-center gap-2 py-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Membres</span>
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2 py-2">
              <FolderKanban className="w-4 h-4" />
              <span className="hidden sm:inline">Projets</span>
            </TabsTrigger>
            <TabsTrigger value="allocations" className="flex items-center gap-2 py-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Allocations</span>
            </TabsTrigger>
            <TabsTrigger value="project-tracking" className="flex items-center gap-2 py-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Suivi Projet</span>
            </TabsTrigger>
            <TabsTrigger value="member-tracking" className="flex items-center gap-2 py-2">
              <UserCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Suivi Membre</span>
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2 py-2">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </TabsTrigger>
          </TabsList>

          {/* MEMBERS TAB */}
          <TabsContent value="members" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Gestion des Membres</h2>
                <p className="text-muted-foreground">Gérez les membres de votre organisation</p>
              </div>
              <Button onClick={() => openMemberModal()} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau Membre
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                {data.members.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun membre enregistré</p>
                    <p className="text-sm">Cliquez sur "Nouveau Membre" pour commencer</p>
                  </div>
                ) : (
                  <ScrollArea className="max-h-[500px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Code</TableHead>
                          <TableHead>Prénom</TableHead>
                          <TableHead>Nom</TableHead>
                          <TableHead className="hidden md:table-cell">Email</TableHead>
                          <TableHead className="hidden md:table-cell">Téléphone</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.members.map((member) => (
                          <TableRow key={member.id}>
                            <TableCell className="font-mono font-medium">{member.code}</TableCell>
                            <TableCell>{member.firstName}</TableCell>
                            <TableCell>{member.lastName}</TableCell>
                            <TableCell className="hidden md:table-cell">{member.email || '-'}</TableCell>
                            <TableCell className="hidden md:table-cell">{member.phone || '-'}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => openMemberModal(member)}>
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => deleteMember(member.id)} className="text-destructive hover:text-destructive">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* PROJECTS TAB */}
          <TabsContent value="projects" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Gestion des Projets</h2>
                <p className="text-muted-foreground">Gérez vos projets, budgets et frais</p>
              </div>
              <Button onClick={() => openProjectModal()} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau Projet
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.projects.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <FolderKanban className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun projet créé</p>
                    <p className="text-sm">Cliquez sur "Nouveau Projet" pour commencer</p>
                  </CardContent>
                </Card>
              ) : (
                data.projects.map((project) => (
                  <Card key={project.id} className="overflow-hidden">
                    <CardHeader className="pb-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge variant="outline" className="mb-2">{project.code}</Badge>
                          <CardTitle className="text-lg">{project.name}</CardTitle>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openProjectModal(project)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Budget Membres:</span>
                          <span className="font-medium">{formatFCFA(CalculationsModule.getTotalBudgetByProject(project))}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Autres Frais:</span>
                          <span className="font-medium">{formatFCFA(CalculationsModule.getTotalFeesByProject(project))}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-medium">
                          <span>Total Projet:</span>
                          <span className="text-emerald-600">{formatFCFA(CalculationsModule.getTotalProjectCost(project))}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => openProjectDetail(project.id)} className="flex-1">
                          Détails
                        </Button>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {project.members.length} membre(s) • {project.fees.length} frais
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* ALLOCATIONS TAB */}
          <TabsContent value="allocations" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Allocations</h2>
                <p className="text-muted-foreground">Enregistrez les versements aux membres</p>
              </div>
              <Button 
                onClick={openAllocationModal} 
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={data.projects.length === 0 || data.members.length === 0}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle Allocation
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                {data.allocations.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune allocation enregistrée</p>
                    <p className="text-sm">Les allocations apparaîtront ici</p>
                  </div>
                ) : (
                  <ScrollArea className="max-h-[500px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Projet</TableHead>
                          <TableHead>Membre</TableHead>
                          <TableHead className="hidden md:table-cell">N° Chèque</TableHead>
                          <TableHead className="text-right">Montant</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.allocations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((allocation) => (
                          <TableRow key={allocation.id}>
                            <TableCell>{formatDate(allocation.date)}</TableCell>
                            <TableCell>{getProjectName(allocation.projectId)}</TableCell>
                            <TableCell>{getMemberName(allocation.memberId)}</TableCell>
                            <TableCell className="hidden md:table-cell font-mono">{allocation.checkNumber || '-'}</TableCell>
                            <TableCell className="text-right font-medium text-emerald-600">{formatFCFA(allocation.amount)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            {data.allocations.length > 0 && (
              <Card className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    <span className="font-medium">Total des allocations:</span>
                    <span className="ml-auto text-lg font-bold text-emerald-600">
                      {formatFCFA(data.allocations.reduce((sum, a) => sum + a.amount, 0))}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* PROJECT TRACKING TAB */}
          <TabsContent value="project-tracking" className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">Suivi par Projet</h2>
              <p className="text-muted-foreground">Vue d'ensemble des budgets et versements par projet</p>
            </div>

            {data.projects.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun projet à suivre</p>
                </CardContent>
              </Card>
            ) : (
              data.projects.map((project) => (
                <Card key={project.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{project.name}</CardTitle>
                        <CardDescription>Code: {project.code}</CardDescription>
                      </div>
                      <Badge variant="outline">
                        Total: {formatFCFA(CalculationsModule.getTotalProjectCost(project))}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {project.members.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">Aucun membre dans ce projet</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Membre</TableHead>
                            <TableHead className="text-right">Budget Alloué</TableHead>
                            <TableHead className="text-right">Total Reçu</TableHead>
                            <TableHead className="text-right">Reste</TableHead>
                            <TableHead className="hidden md:table-cell">Progression</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {project.members.map((pm) => {
                            const received = CalculationsModule.getTotalReceivedByMemberInProject(data.allocations, project.id, pm.memberId)
                            const remaining = pm.budget - received
                            const progress = pm.budget > 0 ? (received / pm.budget) * 100 : 0

                            return (
                              <TableRow key={pm.memberId}>
                                <TableCell className="font-medium">{getMemberName(pm.memberId)}</TableCell>
                                <TableCell className="text-right">{formatFCFA(pm.budget)}</TableCell>
                                <TableCell className="text-right text-emerald-600">{formatFCFA(received)}</TableCell>
                                <TableCell className="text-right">
                                  <span className={remaining === 0 ? 'text-emerald-600 font-medium' : ''}>
                                    {formatFCFA(remaining)}
                                  </span>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                  <div className="flex items-center gap-2">
                                    <Progress value={progress} className="h-2 flex-1" />
                                    <span className="text-xs text-muted-foreground w-12">{progress.toFixed(0)}%</span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    )}

                    {project.fees.length > 0 && (
                      <>
                        <Separator className="my-4" />
                        <h4 className="font-medium mb-2">Autres Frais</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Libellé</TableHead>
                              <TableHead className="text-right">Montant</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {project.fees.map((fee) => (
                              <TableRow key={fee.id}>
                                <TableCell>{fee.label}</TableCell>
                                <TableCell className="text-right">{formatFCFA(fee.amount)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* MEMBER TRACKING TAB */}
          <TabsContent value="member-tracking" className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">Suivi par Membre</h2>
              <p className="text-muted-foreground">Vue d'ensemble des budgets et versements par membre</p>
            </div>

            {data.members.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <UserCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun membre à suivre</p>
                </CardContent>
              </Card>
            ) : (
              data.members.map((member) => {
                const memberProjects = data.projects.filter(p => p.members.some(m => m.memberId === member.id))
                
                return (
                  <Card key={member.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                            <Users className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{member.firstName} {member.lastName}</CardTitle>
                            <CardDescription>Code: {member.code}</CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {memberProjects.length} projet(s)
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {memberProjects.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">Ce membre n'est dans aucun projet</p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Projet</TableHead>
                              <TableHead className="text-right">Budget Alloué</TableHead>
                              <TableHead className="text-right">Total Reçu</TableHead>
                              <TableHead className="text-right">Reste</TableHead>
                              <TableHead className="hidden md:table-cell">Progression</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {memberProjects.map((project) => {
                              const pm = project.members.find(m => m.memberId === member.id)
                              if (!pm) return null
                              
                              const received = CalculationsModule.getTotalReceivedByMemberInProject(data.allocations, project.id, member.id)
                              const remaining = pm.budget - received
                              const progress = pm.budget > 0 ? (received / pm.budget) * 100 : 0

                              return (
                                <TableRow key={project.id}>
                                  <TableCell className="font-medium">{project.name}</TableCell>
                                  <TableCell className="text-right">{formatFCFA(pm.budget)}</TableCell>
                                  <TableCell className="text-right text-emerald-600">{formatFCFA(received)}</TableCell>
                                  <TableCell className="text-right">
                                    <span className={remaining === 0 ? 'text-emerald-600 font-medium' : ''}>
                                      {formatFCFA(remaining)}
                                    </span>
                                  </TableCell>
                                  <TableCell className="hidden md:table-cell">
                                    <div className="flex items-center gap-2">
                                      <Progress value={progress} className="h-2 flex-1" />
                                      <span className="text-xs text-muted-foreground w-12">{progress.toFixed(0)}%</span>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                )
              })
            )}
          </TabsContent>

          {/* EXPORT TAB */}
          <TabsContent value="export" className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">Export des Données</h2>
              <p className="text-muted-foreground">Exportez toutes vos données dans différents formats</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={exportJSON}>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                      <FileJson className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Format JSON</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Idéal pour l'intégration avec d'autres systèmes ou la sauvegarde complète
                    </p>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <Download className="w-4 h-4 mr-2" />
                      Exporter JSON
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={exportCSV}>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                      <FileText className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Format CSV</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Compatible avec Excel, Google Sheets et la plupart des tableurs
                    </p>
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      <Download className="w-4 h-4 mr-2" />
                      Exporter CSV
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={exportExcel}>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-4">
                      <FileSpreadsheet className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Format Excel</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Fichier Excel natif avec plusieurs feuilles organisées
                    </p>
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                      <Download className="w-4 h-4 mr-2" />
                      Exporter Excel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800 dark:text-amber-200">Données exportées</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      L'export inclut tous les membres, projets, budgets, frais et allocations de votre application.
                      Les données sont extraites à l'instant de l'export.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/95 backdrop-blur mt-auto">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-sm text-muted-foreground">
            © 2026 URBASEN - Développé par ABDOULAHI
          </p>
        </div>
      </footer>

      {/* MEMBER MODAL */}
      <Dialog open={memberModalOpen} onOpenChange={setMemberModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMember ? 'Modifier le membre' : 'Nouveau membre'}</DialogTitle>
            <DialogDescription>
              {editingMember ? 'Modifiez les informations du membre' : 'Remplissez les informations du nouveau membre'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="member-code">Code membre *</Label>
                <Input
                  id="member-code"
                  value={memberForm.code}
                  onChange={(e) => setMemberForm({ ...memberForm, code: e.target.value })}
                  placeholder="M001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member-firstname">Prénom *</Label>
                <Input
                  id="member-firstname"
                  value={memberForm.firstName}
                  onChange={(e) => setMemberForm({ ...memberForm, firstName: e.target.value })}
                  placeholder="Jean"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-lastname">Nom *</Label>
              <Input
                id="member-lastname"
                value={memberForm.lastName}
                onChange={(e) => setMemberForm({ ...memberForm, lastName: e.target.value })}
                placeholder="Dupont"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-email">Email</Label>
              <Input
                id="member-email"
                type="email"
                value={memberForm.email}
                onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                placeholder="jean.dupont@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-phone">Téléphone</Label>
              <Input
                id="member-phone"
                value={memberForm.phone}
                onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                placeholder="+221 77 123 45 67"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMemberModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={saveMember} className="bg-emerald-600 hover:bg-emerald-700">
              {editingMember ? 'Modifier' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PROJECT MODAL */}
      <Dialog open={projectModalOpen} onOpenChange={setProjectModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProject ? 'Modifier le projet' : 'Nouveau projet'}</DialogTitle>
            <DialogDescription>
              {editingProject ? 'Modifiez les informations du projet' : 'Créez un nouveau projet'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project-code">Code projet *</Label>
                <Input
                  id="project-code"
                  value={projectForm.code}
                  onChange={(e) => setProjectForm({ ...projectForm, code: e.target.value })}
                  placeholder="PRJ001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-name">Nom du projet *</Label>
                <Input
                  id="project-name"
                  value={projectForm.name}
                  onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                  placeholder="Construction Salle A"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Membres du projet</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const availableMembers = data.members.filter(
                      m => !projectMembersForm.some(pm => pm.memberId === m.id)
                    )
                    if (availableMembers.length > 0) {
                      setProjectMembersForm([
                        ...projectMembersForm,
                        { memberId: availableMembers[0].id, budget: '' }
                      ])
                    }
                  }}
                  disabled={data.members.length === projectMembersForm.length || data.members.length === 0}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un membre
                </Button>
              </div>

              {projectMembersForm.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun membre ajouté. Cliquez sur "Ajouter un membre" pour commencer.
                </p>
              )}

              {projectMembersForm.map((pm, index) => {
                const member = data.members.find(m => m.id === pm.memberId)
                return (
                  <div key={index} className="flex items-end gap-2">
                    <div className="flex-1 space-y-2">
                      <Label>Membre</Label>
                      <Select
                        value={pm.memberId}
                        onValueChange={(value) => {
                          const updated = [...projectMembersForm]
                          updated[index].memberId = value
                          setProjectMembersForm(updated)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un membre" />
                        </SelectTrigger>
                        <SelectContent>
                          {data.members
                            .filter(m => 
                              m.id === pm.memberId || 
                              !projectMembersForm.some(p => p.memberId === m.id)
                            )
                            .map((m) => (
                              <SelectItem key={m.id} value={m.id}>
                                {m.firstName} {m.lastName} ({m.code})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-40 space-y-2">
                      <Label>Budget (FCFA)</Label>
                      <Input
                        type="number"
                        value={pm.budget}
                        onChange={(e) => {
                          const updated = [...projectMembersForm]
                          updated[index].budget = e.target.value
                          setProjectMembersForm(updated)
                        }}
                        placeholder="0"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setProjectMembersForm(projectMembersForm.filter((_, i) => i !== index))
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProjectModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={saveProject} className="bg-emerald-600 hover:bg-emerald-700">
              {editingProject ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ALLOCATION MODAL */}
      <Dialog open={allocationModalOpen} onOpenChange={setAllocationModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle allocation</DialogTitle>
            <DialogDescription>
              Enregistrez un versement à un membre pour un projet
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="allocation-project">Projet *</Label>
              <Select
                value={allocationForm.projectId}
                onValueChange={(value) => {
                  setAllocationForm({ ...allocationForm, projectId: value, memberId: '' })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un projet" />
                </SelectTrigger>
                <SelectContent>
                  {data.projects.filter(p => p.members.length > 0).map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {allocationForm.projectId && (
              <div className="space-y-2">
                <Label htmlFor="allocation-member">Membre *</Label>
                <Select
                  value={allocationForm.memberId}
                  onValueChange={(value) => setAllocationForm({ ...allocationForm, memberId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un membre" />
                  </SelectTrigger>
                  <SelectContent>
                    {(() => {
                      const project = data.projects.find(p => p.id === allocationForm.projectId)
                      return project?.members.map((pm) => {
                        const member = data.members.find(m => m.id === pm.memberId)
                        if (!member) return null
                        const received = CalculationsModule.getTotalReceivedByMemberInProject(
                          data.allocations, allocationForm.projectId, pm.memberId
                        )
                        const remaining = pm.budget - received
                        return (
                          <SelectItem key={pm.memberId} value={pm.memberId}>
                            {member.firstName} {member.lastName} - Reste: {formatFCFA(remaining)}
                          </SelectItem>
                        )
                      })
                    })()}
                  </SelectContent>
                </Select>
              </div>
            )}

            {allocationForm.projectId && allocationForm.memberId && (() => {
              const project = data.projects.find(p => p.id === allocationForm.projectId)
              const pm = project?.members.find(m => m.memberId === allocationForm.memberId)
              const received = CalculationsModule.getTotalReceivedByMemberInProject(
                data.allocations, allocationForm.projectId, allocationForm.memberId
              )
              const remaining = pm ? pm.budget - received : 0
              return (
                <Card className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span className="text-sm">Budget restant disponible:</span>
                      <span className="ml-auto font-bold text-emerald-600">{formatFCFA(remaining)}</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })()}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="allocation-date">Date de remise *</Label>
                <Input
                  id="allocation-date"
                  type="date"
                  value={allocationForm.date}
                  onChange={(e) => setAllocationForm({ ...allocationForm, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="allocation-check">N° Chèque</Label>
                <Input
                  id="allocation-check"
                  value={allocationForm.checkNumber}
                  onChange={(e) => setAllocationForm({ ...allocationForm, checkNumber: e.target.value })}
                  placeholder="CH001234"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="allocation-amount">Montant (FCFA) *</Label>
              <Input
                id="allocation-amount"
                type="number"
                value={allocationForm.amount}
                onChange={(e) => setAllocationForm({ ...allocationForm, amount: e.target.value })}
                placeholder="100000"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAllocationModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={saveAllocation} className="bg-emerald-600 hover:bg-emerald-700">
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* FEE MODAL */}
      <Dialog open={feeModalOpen} onOpenChange={setFeeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingFee ? 'Modifier le frais' : 'Nouveau frais'}</DialogTitle>
            <DialogDescription>
              {editingFee ? 'Modifiez les informations du frais' : 'Ajoutez un frais au projet'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fee-label">Libellé *</Label>
              <Input
                id="fee-label"
                value={feeForm.label}
                onChange={(e) => setFeeForm({ ...feeForm, label: e.target.value })}
                placeholder="Achat de matériel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fee-amount">Montant (FCFA) *</Label>
              <Input
                id="fee-amount"
                type="number"
                value={feeForm.amount}
                onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })}
                placeholder="50000"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeeModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={saveFee} className="bg-emerald-600 hover:bg-emerald-700">
              {editingFee ? 'Modifier' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PROJECT DETAIL MODAL */}
      <Dialog open={projectDetailOpen} onOpenChange={setProjectDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedProject?.name}</DialogTitle>
            <DialogDescription>
              Code: {selectedProject?.code}
            </DialogDescription>
          </DialogHeader>
          
          {selectedProject && (
            <div className="space-y-6 py-4">
              {/* Members Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Membres du projet</h4>
                  <Badge variant="outline">
                    Total: {formatFCFA(CalculationsModule.getTotalBudgetByProject(selectedProject))}
                  </Badge>
                </div>
                
                {selectedProject.members.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Aucun membre</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Membre</TableHead>
                        <TableHead className="text-right">Budget</TableHead>
                        <TableHead className="text-right">Reçu</TableHead>
                        <TableHead className="text-right">Reste</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedProject.members.map((pm) => {
                        const received = CalculationsModule.getTotalReceivedByMemberInProject(
                          data.allocations, selectedProject.id, pm.memberId
                        )
                        const remaining = pm.budget - received
                        return (
                          <TableRow key={pm.memberId}>
                            <TableCell className="font-medium">{getMemberName(pm.memberId)}</TableCell>
                            <TableCell className="text-right">{formatFCFA(pm.budget)}</TableCell>
                            <TableCell className="text-right text-emerald-600">{formatFCFA(received)}</TableCell>
                            <TableCell className="text-right">{formatFCFA(remaining)}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
              </div>

              <Separator />

              {/* Fees Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Autres frais</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      Total: {formatFCFA(CalculationsModule.getTotalFeesByProject(selectedProject))}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openFeeModal(selectedProject.id)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter
                    </Button>
                  </div>
                </div>

                {selectedProject.fees.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Aucun frais</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Libellé</TableHead>
                        <TableHead className="text-right">Montant</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedProject.fees.map((fee) => (
                        <TableRow key={fee.id}>
                          <TableCell>{fee.label}</TableCell>
                          <TableCell className="text-right">{formatFCFA(fee.amount)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => openFeeModal(selectedProject.id, fee)}>
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => deleteFee(selectedProject.id, fee.id)} className="text-destructive hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>

              <Separator />

              {/* Totals */}
              <Card className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800">
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total budgets membres:</span>
                      <span className="font-medium">{formatFCFA(CalculationsModule.getTotalBudgetByProject(selectedProject))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total autres frais:</span>
                      <span className="font-medium">{formatFCFA(CalculationsModule.getTotalFeesByProject(selectedProject))}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total projet:</span>
                      <span className="text-emerald-600">{formatFCFA(CalculationsModule.getTotalProjectCost(selectedProject))}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
