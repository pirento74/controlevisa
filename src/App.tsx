import React, { useState, useEffect, type FormEvent, type ReactNode } from "react";
import { SearchableSelect } from "./components/SearchableSelect";
import { SearchableMultiSelect } from "./components/SearchableMultiSelect";
import { 
  Users, 
  FileText, 
  Plus, 
  Trash2, 
  LayoutDashboard, 
  Settings, 
  LogOut,
  ChevronRight,
  Search,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  HandCoins,
  HeartPulse,
  MessageSquareWarning,
  Briefcase,
  Printer,
  IdCard,
  Eye,
  Pencil,
  SquarePen,
  Download,
  CheckCircle,
  Archive,
  Upload,
  Database,
  Menu,
  X,
  FolderOpen,
  UserPen
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  password?: string;
}

const ALL_PERMISSIONS = [
  { id: "dashboard", label: "Painel Geral" },
  { id: "contribuintes", label: "Contribuintes" },
  { id: "saude", label: "Carteira de Saúde" },
  { id: "reclamacoes", label: "Reclamações" },
  { id: "producao", label: "Produção" },
  { id: "impressos", label: "Impressos" },
  { id: "users", label: "Usuários" },
  { id: "alterar_cadastro", label: "Alterar Cadastro" },
  { id: "dados", label: "Gestão de Dados" },
  { id: "forms", label: "Formulários" }
];

interface Form {
  id: string;
  title: string;
  description: string;
  status: string;
  upload?: string;
  date: string;
}

interface Contributor {
  id: string;
  name: string;
  document: string;
  type: string;
  status: string;
  processNumber: string;
  entryDate: string;
  tradeName: string;
  activity: string;
  category: string;
  razaoSocial: string;
  cnpj: string;
  responsible: string;
  cpf: string;
  technicalResponsible: string;
  technicalCouncil: string;
  street: string;
  block: string;
  quadra: string;
  number: string;
  neighborhood: string;
  responsibleOfficers: string;
  previousYear: string;
  damIssuance: string;
  damValue: string;
  licenseNumber: string;
  licenseIssuance: string;
  licenseValidity: string;
  observation: string;
  contact: string;
  phone?: string;
  ownerName?: string;
  address?: string;
  addressNumber?: string;
  fantasyName?: string;
  alvaraNumber?: string;
  mainActivity?: string;
}

interface HealthWallet {
  id: string;
  patientName: string;
  rg?: string;
  gender?: string;
  birthDate?: string;
  category: string;
  expiration: string;
  status: string;
  entryDate?: string;
  workplace?: string;
  role?: string;
  street?: string;
  neighborhood?: string;
  issueDate?: string;
  examDate?: string;
  contact?: string;
  observation?: string;
  upload?: string;
}

interface Complaint {
  id: string;
  reclamanteName: string;
  reclamanteContact?: string;
  reclamanteStreet?: string;
  reclamanteNumber?: string;
  reclamanteBlock?: string;
  reclamanteQuadra?: string;
  reclamanteNeighborhood?: string;
  reclamadoName?: string;
  reclamadoStreet?: string;
  reclamadoNumber?: string;
  reclamadoBlock?: string;
  reclamadoQuadra?: string;
  reclamadoNeighborhood?: string;
  subject: string;
  priority: string;
  upload?: string;
  status: string;
  date: string;
}

interface ProductionRecord {
  id: string;
  date: string;
  officer: string;
  activity: string;
  quantity?: string;
  location?: string;
  neighborhood?: string;
  observation?: string;
  upload?: string;
  status: string;
}

interface PrintedMatter {
  id: string;
  name: string;
  size: string;
  type: string;
  date: string;
  filename: string;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState<"dashboard" | "users" | "dados" | "forms" | "contribuintes" | "saude" | "reclamacoes" | "producao" | "impressos">("dashboard");
  const [users, setUsers] = useState<User[]>([]);
  const [forms, setForms] = useState<Form[]>([]);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [healthWallets, setHealthWallets] = useState<HealthWallet[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [productionRecords, setProductionRecords] = useState<ProductionRecord[]>([]);
  const [productionFilterDate, setProductionFilterDate] = useState("");
  const [productionFilterName, setProductionFilterName] = useState("");
  const [productionFilterActivity, setProductionFilterActivity] = useState("");
  const [printedMatter, setPrintedMatter] = useState<PrintedMatter[]>([]);
  
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);

  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isAddingForm, setIsAddingForm] = useState(false);
  const [isAddingContributor, setIsAddingContributor] = useState(false);
  const [isAddingHealthWallet, setIsAddingHealthWallet] = useState(false);
  const [isAddingComplaint, setIsAddingComplaint] = useState(false);
  const [isAddingProduction, setIsAddingProduction] = useState(false);
  const [isAddingPrint, setIsAddingPrint] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [isSelfEditing, setIsSelfEditing] = useState(false);
  const [isEditingContributor, setIsEditingContributor] = useState(false);
  const [isEditingHealthWallet, setIsEditingHealthWallet] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEditingComplaint, setIsEditingComplaint] = useState(false);
  const [isEditingProduction, setIsEditingProduction] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string, type: 'user' | 'form' | 'contributor' | 'healthWallet' | 'complaint' | 'production' | 'print' } | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingContributor, setEditingContributor] = useState<Contributor | null>(null);
  const [editingHealthWallet, setEditingHealthWallet] = useState<HealthWallet | null>(null);
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null);
  const [editingProduction, setEditingProduction] = useState<ProductionRecord | null>(null);

  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
  const [officers, setOfficers] = useState<string[]>([]);
  const [streets, setStreets] = useState<string[]>([]);
  const [functions, setFunctions] = useState<string[]>([]);
  const [activities, setActivities] = useState<string[]>([]);
  const currentYear = new Date().getFullYear();
  const [years, setYears] = useState<string[]>([]);

  // States manager para opções do modulo de gestão de dados
  const [dataManagerCategory, setDataManagerCategory] = useState<"neighborhoods" | "officers" | "streets" | "years" | "functions" | "activities">("neighborhoods");
  const [dataManagerInputValue, setDataManagerInputValue] = useState("");

  const INITIAL_CONTRIBUTOR = { 
    name: "", 
    document: "", 
    type: "PJ", 
    status: "regular",
    processNumber: "",
    entryDate: "",
    tradeName: "",
    activity: "",
    category: "",
    razaoSocial: "",
    cnpj: "",
    responsible: "",
    cpf: "",
    technicalResponsible: "",
    technicalCouncil: "",
    street: "",
    block: "",
    quadra: "",
    number: "",
    neighborhood: "",
    responsibleOfficers: "",
    previousYear: "",
    damIssuance: "",
    damValue: "",
    licenseNumber: "",
    licenseIssuance: "",
    licenseValidity: "",
    observation: "",
    contact: "",
    upload: ""
  };

  const INITIAL_HEALTH_WALLET: Omit<HealthWallet, 'id'> = {
    patientName: "", 
    rg: "",
    birthDate: "",
    category: "Alimentação", 
    expiration: "", 
    status: "ativo",
    workplace: "",
    role: "",
    street: "",
    neighborhood: "",
    issueDate: "",
    examDate: "",
    contact: "",
    observation: "",
    upload: ""
  };

  // States para novos itens
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "editor", permissions: ["dashboard"], password: "" });
  const [newForm, setNewForm] = useState({ title: "", description: "", status: "ativo", upload: "" });
  const [newContributor, setNewContributor] = useState(INITIAL_CONTRIBUTOR);
  const [newHealthWallet, setNewHealthWallet] = useState<Omit<HealthWallet, 'id'>>(INITIAL_HEALTH_WALLET);
  const INITIAL_COMPLAINT: Omit<Complaint, 'id' | 'status' | 'date'> = {
    reclamanteName: "",
    reclamanteContact: "",
    reclamanteStreet: "",
    reclamanteNumber: "",
    reclamanteBlock: "",
    reclamanteQuadra: "",
    reclamanteNeighborhood: "",
    reclamadoName: "",
    reclamadoStreet: "",
    reclamadoNumber: "",
    reclamadoBlock: "",
    reclamadoQuadra: "",
    reclamadoNeighborhood: "",
    subject: "",
    priority: "baixa",
    upload: ""
  };

  const [newComplaint, setNewComplaint] = useState(INITIAL_COMPLAINT);
  const INITIAL_PRODUCTION: Omit<ProductionRecord, 'id' | 'status'> = {
    date: new Date().toISOString().split('T')[0],
    officer: "",
    activity: "",
    quantity: "",
    location: "",
    neighborhood: "",
    observation: "",
    upload: ""
  };
  const [newProduction, setNewProduction] = useState(INITIAL_PRODUCTION);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) throw new Error("Erro no upload do arquivo.");
    const data = await res.json();
    return data.filename;
  };

  useEffect(() => {
    const handleCloseMenu = () => setIsMobileMenuOpen(false);
    window.addEventListener('close-mobile-menu', handleCloseMenu);
    return () => window.removeEventListener('close-mobile-menu', handleCloseMenu);
  }, []);

  useEffect(() => {
    const checkDb = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          setDbConnected(true);
        } else {
          setDbConnected(false);
        }
      } catch (err) {
        setDbConnected(false);
      }
    };
    checkDb();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
      fetchForms();
      fetchContributors();
      fetchHealthWallets();
      fetchComplaints();
      fetchProduction();
      fetchPrintedMatter();
      fetchSettings();
    }
  }, [isAuthenticated]);

  const fetchSettings = async () => {
    let data: any = {};
    try {
      const res = await fetch("/api/settings");
      data = await res.json();
    } catch (e) {}
    
    const localStr = localStorage.getItem('appSettings');
    let localData = {};
    if (localStr) {
      try { localData = JSON.parse(localStr); } catch (e) {}
    }

    const isFromDb = !!data.id;
    const mergedData = isFromDb ? data : { ...data, ...localData };

    setNeighborhoods(mergedData.neighborhoods || []);
    setOfficers(mergedData.officers || []);
    setStreets(mergedData.streets || []);
    setFunctions(mergedData.functions || []);
    setActivities(mergedData.activities || []);
    setYears(mergedData.years || []);
  };

  const updateSettings = async (newSettings: any) => {
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
      });
    } catch (e) {}

    const localStr = localStorage.getItem('appSettings');
    let localData = {};
    if (localStr) {
      try { localData = JSON.parse(localStr); } catch (e) {}
    }
    const merged = { ...localData, ...newSettings };
    localStorage.setItem('appSettings', JSON.stringify(merged));
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();

      if (data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
        if (data.user.permissions && data.user.permissions.length > 0 && !data.user.permissions.includes(activeTab)) {
          setActiveTab(data.user.permissions[0]);
        }
      } else {
        setLoginError(data.message);
      }
    } catch (err) {
      setLoginError("Erro de conexão com o servidor.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setLoginEmail("");
    setLoginPassword("");
  };

  const handleAddDataManagerItem = async (e: FormEvent) => {
    e.preventDefault();
    if (!dataManagerInputValue.trim()) return;

    const v = dataManagerInputValue.trim();
    if (dataManagerCategory === "neighborhoods" && !neighborhoods.includes(v)) {
      const updated = [...neighborhoods, v].sort((a,b) => a.localeCompare(b));
      setNeighborhoods(updated);
      await updateSettings({ neighborhoods: updated });
    } else if (dataManagerCategory === "officers" && !officers.includes(v)) {
      const updated = [...officers, v].sort((a, b) => a.localeCompare(b));
      setOfficers(updated);
      await updateSettings({ officers: updated });
    } else if (dataManagerCategory === "streets" && !streets.includes(v)) {
      const updated = [...streets, v].sort((a, b) => a.localeCompare(b));
      setStreets(updated);
      await updateSettings({ streets: updated });
    } else if (dataManagerCategory === "years" && !years.includes(v)) {
      const updated = [v, ...years].sort((a, b) => b.localeCompare(a));
      setYears(updated);
      await updateSettings({ years: updated });
    } else if (dataManagerCategory === "functions" && !functions.includes(v)) {
      const updated = [...functions, v].sort((a, b) => a.localeCompare(b));
      setFunctions(updated);
      await updateSettings({ functions: updated });
    } else if (dataManagerCategory === "activities" && !activities.includes(v)) {
      const updated = [...activities, v].sort((a, b) => a.localeCompare(b));
      setActivities(updated);
      await updateSettings({ activities: updated });
    }
    
    setDataManagerInputValue("");
  };

  const handleRemoveDataManagerItem = async (item: string) => {
    if (dataManagerCategory === "neighborhoods") {
      const updated = neighborhoods.filter(n => n !== item);
       setNeighborhoods(updated);
       await updateSettings({ neighborhoods: updated });
    } else if (dataManagerCategory === "officers") {
      const updated = officers.filter(n => n !== item);
       setOfficers(updated);
       await updateSettings({ officers: updated });
    } else if (dataManagerCategory === "streets") {
      const updated = streets.filter(n => n !== item);
       setStreets(updated);
       await updateSettings({ streets: updated });
    } else if (dataManagerCategory === "years") {
      const updated = years.filter(n => n !== item);
       setYears(updated);
       await updateSettings({ years: updated });
    } else if (dataManagerCategory === "functions") {
      const updated = functions.filter(n => n !== item);
       setFunctions(updated);
       await updateSettings({ functions: updated });
    } else if (dataManagerCategory === "activities") {
      const updated = activities.filter(n => n !== item);
       setActivities(updated);
       await updateSettings({ activities: updated });
    }
  };

  const fetchUsers = async () => {
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data);
  };

  const fetchForms = async () => {
    const res = await fetch("/api/forms");
    const data = await res.json();
    setForms(data);
  };

  const fetchContributors = async () => {
    const res = await fetch("/api/contributors");
    const data = await res.json();
    setContributors(data);
  };

  const fetchHealthWallets = async () => {
    const res = await fetch("/api/health-wallets");
    const data = await res.json();
    setHealthWallets(data);
  };

  const fetchComplaints = async () => {
    const res = await fetch("/api/complaints");
    const data = await res.json();
    setComplaints(data);
  };

  const fetchProduction = async () => {
    const res = await fetch("/api/production");
    const data = await res.json();
    setProductionRecords(data);
  };

  const fetchPrintedMatter = async () => {
    const res = await fetch("/api/prints");
    const data = await res.json();
    setPrintedMatter(data);
  };

  const addUser = async (e: FormEvent) => {
    e.preventDefault();
    await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });
    setNewUser({ name: "", email: "", role: "editor", permissions: ["dashboard"], password: "" });
    setIsAddingUser(false);
    fetchUsers();
  };

  const addContributor = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/contributors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newContributor),
    });
    if (!res.ok) {
      const txt = await res.text();
      alert("Erro ao adicionar: " + txt);
      return;
    }
    setNewContributor(INITIAL_CONTRIBUTOR);
    setIsAddingContributor(false);
    fetchContributors();
  };

  const addHealthWallet = async (e: FormEvent) => {
    e.preventDefault();
    await fetch("/api/health-wallets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newHealthWallet),
    });
    setNewHealthWallet(INITIAL_HEALTH_WALLET);
    setIsAddingHealthWallet(false);
    fetchHealthWallets();
  };

  const addComplaint = async (e: FormEvent) => {
    e.preventDefault();
    await fetch("/api/complaints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newComplaint, status: "pendente" }),
    });
    setNewComplaint(INITIAL_COMPLAINT);
    setIsAddingComplaint(false);
    fetchComplaints();
  };

  const addProduction = async (e: FormEvent) => {
    e.preventDefault();
    await fetch("/api/production", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newProduction, status: "em_andamento" }),
    });
    setNewProduction(INITIAL_PRODUCTION);
    setIsAddingProduction(false);
    fetchProduction();
  };

  const uploadPrintFile = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    await fetch("/api/prints", {
      method: "POST",
      body: formData,
    });
    
    setSelectedFile(null);
    setIsAddingPrint(false);
    fetchPrintedMatter();
  };

  const togglePermission = (permissionId: string, isEditing: boolean) => {
    if (isEditing && editingUser) {
      const newPermissions = editingUser.permissions.includes(permissionId)
        ? editingUser.permissions.filter(p => p !== permissionId)
        : [...editingUser.permissions, permissionId];
      setEditingUser({ ...editingUser, permissions: newPermissions });
    } else {
      const newPermissions = newUser.permissions.includes(permissionId)
        ? newUser.permissions.filter(p => p !== permissionId)
        : [...newUser.permissions, permissionId];
      setNewUser({ ...newUser, permissions: newPermissions });
    }
  };

  const openEditUser = (user: User) => {
    setEditingUser(user);
    setIsSelfEditing(false);
    setIsEditingUser(true);
  };

  const updateUser = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    await fetch(`/api/users/${editingUser.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingUser),
    });
    setIsEditingUser(false);
    setIsSelfEditing(false);
    setEditingUser(null);
    if (user && editingUser.id === user.id) {
       setUser({...user, name: editingUser.name, email: editingUser.email});
    }
    fetchUsers();
  };

  const openEditContributor = (contributor: Contributor) => {
    setEditingContributor(contributor);
    setIsEditingContributor(true);
  };

  const updateContributor = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingContributor) return;

    const res = await fetch(`/api/contributors/${editingContributor.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingContributor),
    });
    if (!res.ok) {
      const txt = await res.text();
      alert("Erro ao atualizar: " + txt);
      return;
    }
    setIsEditingContributor(false);
    setEditingContributor(null);
    fetchContributors();
  };

  const openEditHealthWallet = (wallet: HealthWallet) => {
    setEditingHealthWallet(wallet);
    setIsEditingHealthWallet(true);
  };

  const updateHealthWallet = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingHealthWallet) return;

    await fetch(`/api/health-wallets/${editingHealthWallet.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingHealthWallet),
    });
    setIsEditingHealthWallet(false);
    setEditingHealthWallet(null);
    fetchHealthWallets();
  };

  const openEditComplaint = (complaint: Complaint) => {
    setEditingComplaint(complaint);
    setIsEditingComplaint(true);
  };

  const updateComplaint = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingComplaint) return;

    await fetch(`/api/complaints/${editingComplaint.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingComplaint),
    });
    setIsEditingComplaint(false);
    setEditingComplaint(null);
    fetchComplaints();
  };

  const openEditProduction = (record: ProductionRecord) => {
    setEditingProduction(record);
    setIsEditingProduction(true);
  };

  const updateProduction = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingProduction) return;

    await fetch(`/api/production/${editingProduction.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingProduction),
    });
    setIsEditingProduction(false);
    setEditingProduction(null);
    fetchProduction();
  };

  const addForm = async (e: FormEvent) => {
    e.preventDefault();
    await fetch("/api/forms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newForm),
    });
    setNewForm({ title: "", description: "", status: "ativo", upload: "" });
    setIsAddingForm(false);
    fetchForms();
  };

  const deleteUser = (id: string) => setDeleteConfirmation({ id, type: 'user' });
  const deleteForm = (id: string) => setDeleteConfirmation({ id, type: 'form' });
  const deleteContributor = (id: string) => setDeleteConfirmation({ id, type: 'contributor' });

  const confirmDelete = async () => {
    if (!deleteConfirmation) return;
    const { id, type } = deleteConfirmation;
    try {
      if (type === 'user') {
        await fetch(`/api/users/${id}`, { method: "DELETE" });
        fetchUsers();
      } else if (type === 'form') {
        await fetch(`/api/forms/${id}`, { method: "DELETE" });
        fetchForms();
      } else if (type === 'contributor') {
        await fetch(`/api/contributors/${id}`, { method: "DELETE" });
        fetchContributors();
      } else if (type === 'healthWallet') {
        await fetch(`/api/health-wallets/${id}`, { method: "DELETE" });
        fetchHealthWallets();
      } else if (type === 'complaint') {
        await fetch(`/api/complaints/${id}`, { method: "DELETE" });
        fetchComplaints();
      } else if (type === 'production') {
        await fetch(`/api/production/${id}`, { method: "DELETE" });
        fetchProduction();
      } else if (type === 'print') {
        await fetch(`/api/prints/${id}`, { method: "DELETE" });
        fetchPrintedMatter();
      }
    } finally {
      setDeleteConfirmation(null);
    }
  };

  const exportContributorsToExcel = () => {
    const data = contributors.map(c => ({
      "ID": c.id,
      "Nome Original": c.name,
      "Documento Original": c.document,
      "Tipo de Pessoa": c.type,
      "Status": c.status,
      "Número do Processo": c.processNumber,
      "Data de Entrada": c.entryDate,
      "Nome Fantasia": c.tradeName,
      "Atividade": c.activity,
      "Categoria": c.category,
      "Razão Social": c.razaoSocial,
      "CNPJ": c.cnpj,
      "Responsável": c.responsible,
      "CPF": c.cpf,
      "Responsável Técnico": c.technicalResponsible,
      "Conselho Técnico": c.technicalCouncil,
      "Rua / Logradouro": c.street,
      "Bloco": c.block,
      "Quadra": c.quadra,
      "Número": c.number,
      "Bairro": c.neighborhood,
      "Contato": c.contact,
      "Fiscais Responsáveis": c.responsibleOfficers,
      "Ano Anterior": c.previousYear,
      "Data Emissão DAM": c.damIssuance,
      "Valor DAM (R$)": c.damValue,
      "Número da Licença": c.licenseNumber,
      "Data Emissão da Licença": c.licenseIssuance,
      "Validade da Licença": c.licenseValidity,
      "Observação": c.observation
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Contribuintes");
    XLSX.writeFile(wb, "Contribuintes.xlsx");
  };

  const exportHealthWalletsToExcel = () => {
    const data = healthWallets.map(w => ({
      "ID": w.id,
      "Nome": w.patientName,
      "RG": w.rg,
      "Gênero": w.gender,
      "Data de Nascimento": w.birthDate,
      "Categoria": w.category,
      "Validade": w.expiration,
      "Status": w.status,
      "Data de Entrada": w.entryDate,
      "Local de Trabalho": w.workplace,
      "Função": w.role,
      "Endereço": w.street,
      "Bairro": w.neighborhood,
      "Emissão": w.issueDate,
      "Exame": w.examDate,
      "Contato": w.contact,
      "Observação": w.observation
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "CarteirasDeSaude");
    XLSX.writeFile(wb, "CarteirasDeSaude.xlsx");
  };

  const exportComplaintsToExcel = () => {
    const data = complaints.map(c => ({
      "ID": c.id,
      "Data": c.date,
      "Prioridade": c.priority,
      "Status": c.status,
      "Assunto": c.subject,
      "Reclamante": c.reclamanteName,
      "Contato Reclamante": c.reclamanteContact,
      "Endereço Reclamante": c.reclamanteStreet,
      "Número Reclamante": c.reclamanteNumber,
      "Bloco Reclamante": c.reclamanteBlock,
      "Quadra Reclamante": c.reclamanteQuadra,
      "Bairro Reclamante": c.reclamanteNeighborhood,
      "Reclamado": c.reclamadoName,
      "Endereço Reclamado": c.reclamadoStreet,
      "Número Reclamado": c.reclamadoNumber,
      "Bloco Reclamado": c.reclamadoBlock,
      "Quadra Reclamado": c.reclamadoQuadra,
      "Bairro Reclamado": c.reclamadoNeighborhood
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reclamacoes");
    XLSX.writeFile(wb, "Reclamacoes.xlsx");
  };

  const exportProductionToExcel = () => {
    const dataToExport = productionRecords.filter(p => {
      const matchDate = productionFilterDate ? p.date === productionFilterDate : true;
      const matchName = productionFilterName ? p.officer.toLowerCase().includes(productionFilterName.toLowerCase()) : true;
      const matchActivity = productionFilterActivity ? p.activity.toLowerCase().includes(productionFilterActivity.toLowerCase()) : true;
      return matchDate && matchName && matchActivity;
    });

    const data = dataToExport.map(p => ({
      "ID": p.id,
      "Data": p.date,
      "Fiscal": p.officer,
      "Atividade": p.activity,
      "Quantidade": p.quantity,
      "Assunto": p.subject,
      "Endereço": p.street,
      "Número": p.number,
      "Bloco": p.block,
      "Quadra": p.quadra,
      "Bairro": p.neighborhood,
      "Emissão DAM": p.damIssuance,
      "Relatório LRE": p.lreReport,
      "Auto de Infração": p.infractionNotice,
      "Auto de Apreensão": p.seizureNotice,
      "Termo de Visita": p.visitTerm,
      "Intimação": p.subpoena,
      "Observação": p.observation
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Producao");
    XLSX.writeFile(wb, "Producao.xlsx");
  };

  const exportAccessLogsToExcel = () => {
    const data = users.map(u => ({
      "ID": u.id,
      "Nome": u.name,
      "E-mail": u.email,
      "Nível de Acesso": u.role,
      "Módulos Permitidos": u.permissions ? u.permissions.map(pId => ALL_PERMISSIONS.find(ap => ap.id === pId)?.label || pId).join(", ") : ""
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "RegistrosAcesso");
    XLSX.writeFile(wb, "RegistrosAcesso.xlsx");
  };

  const generateProcessPDF = (c: Contributor) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const drawHeader = (doc: any) => {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("GOVERNO DO ESTADO DO PARÁ", 105, 20, { align: "center" });
      doc.text("PREFEITURA MUNICIPAL DE TUCURUÍ", 105, 25, { align: "center" });
      doc.text("SECRETARIA MUNICIPAL DE SAÚDE PÚBLICA", 105, 30, { align: "center" });
      doc.text("DEPARTAMENTO DE VIGILÂNCIA SANITÁRIA DE TUCURUÍ", 105, 35, { align: "center" });
    };

    const drawFooter = (doc: any) => {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("End. Rua C nº 625 - Jardim Paraiso - E-mail. visatucurui@gmail.com", 105, 285, { align: "center" });
    };

    // --- Page 1: Requerimento ---
    drawHeader(doc);
    
    doc.setLineWidth(0.5);
    doc.rect(10, 40, 100, 10);
    doc.setFontSize(14);
    doc.text("REQUERIMENTO", 60, 47, { align: "center" });
    doc.rect(110, 40, 90, 10);
    doc.text("Nº DO PROCESSO:", 155, 47, { align: "center" });

    doc.rect(10, 52, 190, 70);
    doc.line(10, 62, 200, 62);
    doc.line(10, 72, 200, 72);
    doc.line(10, 82, 200, 82);
    doc.line(10, 92, 200, 92);
    doc.line(10, 102, 200, 102);
    doc.line(10, 112, 200, 112);

    doc.line(155, 72, 155, 82);
    doc.line(60, 82, 60, 92);
    doc.line(105, 82, 105, 92);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`O RESPONSÁVEL LEGAL: ${c.ownerName || ""}`, 12, 59);
    doc.text(`RESIDENTE À RUA / LOGRADOURO: ${c.address || ""}`, 12, 69);
    doc.text(`BAIRRO: ${c.neighborhood || ""}`, 12, 79);
    doc.text(`NÚMERO: ${c.addressNumber || ""}`, 157, 79);
    doc.text(`BLOCO:`, 12, 89);
    doc.text(`QUADRA:`, 62, 89);
    doc.text(`RESPONSÁVEL PELO ESTABELECIMENTO: ${c.ownerName || ""}`, 107, 89);
    doc.text(`NOME FANSATIA: ${c.fantasyName || ""}`, 12, 99);
    doc.text(`RAZÃO SOCIAL: ${c.name || ""}`, 12, 109);
    doc.text(`CNPJ: ${c.document || ""}`, 12, 119);

    doc.setFont("helvetica", "bold");
    doc.text("SERVIÇO REQUERIDO", 12, 131);
    doc.setFont("helvetica", "normal");
    doc.text("[   ] LICENÇA    [   ] DISPENSA    [   ] OUTROS", 100, 131);

    doc.rect(10, 137, 100, 10);
    doc.rect(110, 137, 90, 10);
    doc.setFont("helvetica", "bold");
    doc.text("DIA DA EMISSÃO DO DAM ______/______/ 2026", 12, 143);
    doc.text("VALOR DO DAM R$: ____________________", 112, 143);

    doc.rect(10, 149, 190, 10);
    doc.text(`Nº DA LICENÇA DE FUNCIONAMENTO ${c.alvaraNumber || "______/__________"}        DATA DE EMISSÃO ______/______/ 2026`, 12, 155);

    doc.rect(10, 162, 190, 10);
    doc.setFontSize(14);
    doc.text("INFORMAÇÕES GERAIS", 105, 169, { align: "center" });

    doc.rect(10, 174, 190, 42);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`DESTINAÇÃO: __________________________________________________________________________________`, 12, 180);
    doc.text(`NOME DA EMPRESA: ${c.name || "__________________________________________________________________________"}`, 12, 186);
    doc.text(`NOME DO ESTABELECIMENTO: ${c.fantasyName || "_______________________________________________________________"}`, 12, 192);
    doc.text(`CNPJ: ${c.document || "___________________________________"}  CPF: _____________________________________________`, 12, 198);
    doc.text(`TÍTULO PROFISSIONAL: _________________ REGISTRO NO CONSELHO Nº: __________________________`, 12, 204);
    doc.text(`RESPONSÁVEL TÉCNICO: ________________________________________________________________________`, 12, 210);

    doc.rect(10, 218, 190, 45);
    doc.text("Tucuruí-PA,                  de                           de           2026.", 12, 227);
    doc.text("N. Termos,", 40, 235);
    doc.text("P. Deferimento.", 40, 240);
    doc.text("_______________________________________________", 105, 252, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.text("Responsável", 105, 257, { align: "center" });

    drawFooter(doc);

    // --- Page 2: Roteiro de Vistoria (1/2) ---
    doc.addPage();
    drawHeader(doc);

    doc.rect(10, 40, 100, 10);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("ROTEIRO DE VISTORIA", 60, 47, { align: "center" });
    doc.rect(110, 40, 90, 10);
    doc.text("PROCESSO Nº _______/2026", 155, 47, { align: "center" });

    doc.rect(10, 52, 190, 10);
    doc.text("DADOS DO ESTABELECIMENTO", 105, 59, { align: "center" });

    doc.rect(10, 64, 190, 45);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`NOME FANTASIA: ${c.fantasyName || "__________________________________________________________________________"}`, 12, 70);
    doc.text(`RAMO DE ATIVIDADE: ${c.mainActivity || c.type || "____________________________________________________________________"}`, 12, 77);
    doc.text(`RAZÃO SOCIAL: ${c.name || "_____________________________________________________________________________"}`, 12, 84);
    doc.text(`NOME DO PROPRIETÁRIO: ${c.ownerName || "_______________________________________________________________"}`, 12, 91);
    doc.text(`ENDEREÇO: ${c.address || "____________________________________"} QUADRA: ___________ Nº: ${c.addressNumber || "__________"}`, 12, 98);
    doc.text(`BOX/LOJA/SALA: ________ BAIRRO: ${c.neighborhood || "___________________________"} TELEFONE: ${c.phone || "______________"}`, 12, 105);

    doc.rect(10, 111, 190, 10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("SITUAÇÃO GERAL DO ESTABELECIMENTO", 105, 118, { align: "center" });

    doc.rect(10, 123, 190, 35);
    doc.setFontSize(10);
    doc.text("SITUAÇÃO NO ANO ANTERIOR:", 105, 129, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.text(`LICENCIADO: (   )    LIBERADO: (   )    PENDENTE: (   )    COM DAM: (   )    NOVO: (   )`, 12, 136);
    doc.setFont("helvetica", "bold");
    doc.text("CATEGORIA:", 105, 143, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.text("A (   )          B (   )          C (   )", 105, 149, { align: "center" });
    doc.text("NÚMERO DE FUNCIONÁRIOS: _________", 12, 155);
    doc.text("CARTEIRAS DE SAÚDE ATUALIZADAS: (   ) SIM  QUANTAS? _______   (   ) NÃO  QUANTAS? ________", 12, 162);

    doc.rect(10, 160, 190, 10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("ESTRUTURA FÍSICA DO ESTABELECIMENTO", 105, 167, { align: "center" });

    doc.rect(10, 172, 190, 50);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    doc.text("ASPECTO CONSTRUTIVO:", 12, 178);
    doc.text("(   ) ALVENARIA  (   ) MADEIRA  (   ) OUTRO:____________________", 70, 178);
    doc.line(10, 180, 200, 180);
    
    doc.text("ESGOTO SANITÁRIO:", 12, 185);
    doc.text("(   ) TANQUE SÉPTICO    (   ) FOSSA SECA    (   ) ETE", 70, 185);
    doc.line(10, 187, 200, 187);

    doc.text("PAREDES/DIVISÓRIAS: ________________________  PISO: ____________________________", 12, 192);
    doc.line(10, 194, 200, 194);

    doc.text("FORRO:", 12, 199);
    doc.text("(   ) LAJE  (   ) GESSO  (   ) PVC  (   ) MADEIRA  (   ) OUTRO:__________", 50, 199);
    doc.line(10, 201, 200, 201);

    doc.text("PROVENIÊNCIA DA ÁGUA:", 12, 206);
    doc.text("(   ) REDE PÚBLICA  (   ) BICA  (   ) MINERAL  (   ) OUTRO:________", 60, 206);
    doc.line(10, 208, 200, 208);

    doc.text("PIA COM ÁGUA CORRENTE:", 12, 213);
    doc.text("SIM(   )    NÃO(   )", 60, 213);
    doc.line(10, 215, 200, 215);

    doc.text("DESTINO DOS RESÍDUOS SÓLIDOS:", 12, 220);
    doc.text("(   ) COLETA PÚBLICA    (   ) COLETA PRIVADA", 75, 220);

    drawFooter(doc);

    // --- Page 3: Roteiro de Vistoria (2/2) ---
    doc.addPage();
    
    doc.rect(10, 10, 190, 40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("OBSERVAÇÕES – ESTRUTURA FÍSICA", 105, 15, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("PAREDES: (   ) Insatisfatório  (   ) Pouco satisfatório  (   ) Satisfatório  (   ) Plenamente satisfatório", 20, 22);
    doc.text("PISO: (   ) Insatisfatório  (   ) Pouco satisfatório  (   ) Satisfatório  (   ) Plenamente satisfatório", 25, 28);
    doc.text("FORRO: (   ) Insatisfatório  (   ) Pouco satisfatório  (   ) Satisfatório  (   ) Plenamente satisfatório", 23, 34);
    doc.text("ÁREA EXTERNA: (   ) Insatisfatório  (   ) Pouco satisfatório  (   ) Satisfatório  (   ) Plenamente satisfatório", 12, 40);
    doc.text("OBS:____________________________________________________________________________________", 12, 47);

    doc.rect(10, 55, 190, 45);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("OBSERVAÇÕES – HIGIENE (LIMPEZA)", 105, 60, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("AMBIENTE: (   ) Insatisfatório  (   ) Pouco satisfatório  (   ) Satisfatório  (   ) Plenamente satisfatório", 20, 67);
    doc.text("EQUIPAMENTOS: (   ) Insatisfatório  (   ) Pouco satisfatório  (   ) Satisfatório  (   ) Plenamente satisfatório", 13, 73);
    doc.text("UTENSÍLIOS: (   ) Insatisfatório  (   ) Pouco satisfatório  (   ) Satisfatório  (   ) Plenamente satisfatório", 19, 79);
    doc.text("MANIPULADOR: (   ) Insatisfatório  (   ) Pouco satisfatório  (   ) Satisfatório  (   ) Plenamente satisfatório", 15, 85);
    doc.text("OBS:____________________________________________________________________________________", 12, 92);
    doc.text("________________________________________________________________________________________", 12, 98);

    doc.rect(10, 105, 190, 25);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("OBSERVAÇÕES ESPECÍFICAS", 105, 110, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("LIMPEZA DE RESERVATÓRIO: (   ) Sim  (   ) Não     ÚLTIMO SERVIÇO DIA:______/_____/______", 25, 117);
    doc.text("CONTROLE DE PRAGAS URBANAS: (   ) Sim  (   ) Não     ÚLTIMO SERVIÇO DIA:______/_____/______", 15, 124);

    doc.rect(10, 135, 190, 25);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("OBSERVAÇÕES GERAIS", 105, 140, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("__________________________________________________________________________________________", 12, 148);
    doc.text("__________________________________________________________________________________________", 12, 155);

    doc.rect(10, 165, 190, 15);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("PARECER FINAL", 105, 170, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("__________________________________________________________________________________________", 12, 178);

    doc.rect(10, 185, 190, 65); // Table bounding box
    doc.line(10, 195, 200, 195);
    doc.line(10, 205, 200, 205);
    doc.line(10, 215, 200, 215);
    doc.line(10, 225, 200, 225);
    doc.line(10, 235, 200, 235);
    doc.line(10, 245, 200, 245);
    
    // Column lines
    const col1 = 25;
    const col2 = 65;
    const col3 = 95;
    const col4 = 145;
    
    doc.line(col1, 185, col1, 250);
    doc.line(col2, 185, col2, 250);
    doc.line(col3, 185, col3, 250);
    doc.line(col4, 185, col4, 250);

    doc.setFont("helvetica", "bold");
    doc.text("Visita", 17, 191, { align: "center" });
    doc.text("Especificação\nda Visita", 45, 189, { align: "center" });
    doc.text("Data", 80, 191, { align: "center" });
    doc.text("Assinaturas\ndos Fiscais", 120, 189, { align: "center" });
    doc.text("Assinatura do Proprietário", 172, 191, { align: "center" });

    doc.setFont("helvetica", "normal");
    for (let i = 1; i <= 6; i++) {
        let y = 195 + (i * 10) - 4;
        doc.text(`${i}ª`, 17, y, { align: "center" });
        doc.text(`___/___/_____`, 80, y, { align: "center" });
        doc.text(`_________________`, 120, y - 2, { align: "center" });
        doc.text(`_________________`, 120, y + 2, { align: "center" });
        doc.text(`______________________________`, 172, y, { align: "center" });
    }

    drawFooter(doc);

    doc.save(`Processo_${(c.name || "SemNome").replace(/\s+/g, "_")}.pdf`);
  };

  const exportContributorCertificate = (c: Contributor) => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    });

    // Borda estilo barroco trabalhada
    const drawCorner = (x: number, y: number, isRight: boolean, isBottom: boolean) => {
      const rx = isRight ? x - 15 : x;
      const ry = isBottom ? y - 15 : y;
      
      doc.setLineWidth(1);
      doc.setFillColor(255, 255, 255);
      doc.rect(rx, ry, 15, 15, "FD");
      
      doc.setLineWidth(0.3);
      doc.rect(rx + 2, ry + 2, 11, 11);
      
      doc.circle(rx + 7.5, ry + 7.5, 3.5);
      
      doc.setFillColor(0, 0, 0);
      doc.circle(rx + 7.5, ry + 7.5, 1.5, "F");

      for(let i=1; i<=6; i++) {
        doc.circle(rx + (isRight ? -3*i : 15 + 3*i), ry + 7.5, 1.2 - i*0.15, "F");
        doc.circle(rx + 7.5, ry + (isBottom ? -3*i : 15 + 3*i), 1.2 - i*0.15, "F");
      }
    };

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(2.5);
    doc.rect(10, 10, 277, 190);
    doc.setLineWidth(0.3);
    doc.rect(12, 12, 273, 186);
    doc.setLineWidth(1);
    doc.rect(16, 16, 265, 178);
    doc.setLineWidth(0.3);
    doc.rect(17.5, 17.5, 262, 175);

    drawCorner(16, 16, false, false);
    drawCorner(281, 16, true, false);
    drawCorner(16, 194, false, true);
    drawCorner(281, 194, true, true);

    doc.setFont("times", "bold");
    doc.setFontSize(10);
    doc.text("GOVERNO DO ESTADO DO PARÁ", 148.5, 25, { align: "center" });
    doc.text("PREFEITURA MUNICIPAL DE TUCURUÍ", 148.5, 30, { align: "center" });
    doc.text("SECRETARIA MUNICIPAL DE SAÚDE PÚBLICA", 148.5, 35, { align: "center" });
    doc.text("COORDENAÇÃO DE VIGILÂNCIA SANITÁRIA DE TUCURUÍ", 148.5, 40, { align: "center" });

    doc.setFontSize(28);
    doc.text("LICENÇA DE FUNCIONAMENTO", 148.5, 52, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Nº DO PROCESSO: ${c.processNumber || "______"}`, 20, 62);
    doc.text(`Nº DA LICENÇA: ${c.licenseNumber || "______"}`, 277, 62, { align: "right" });

    const startY = 66;
    doc.setLineWidth(0.5);
    doc.rect(20, startY, 257, 33);
    doc.line(20, startY + 7, 277, startY + 7);
    doc.line(20, startY + 14, 277, startY + 14);
    doc.line(20, startY + 21, 277, startY + 21);
    doc.line(20, startY + 28, 277, startY + 28);
    doc.line(180, startY + 7, 180, startY + 33);

    doc.setFontSize(14);
    doc.text("IDENTIFICAÇÃO DO SOLICITANTE", 148.5, startY + 5.5, { align: "center" });

    doc.setFontSize(10);
    doc.text("RAZÃO SOCIAL: ", 22, startY + 12.5);
    doc.setFont("helvetica", "normal"); doc.text(c.razaoSocial || c.name || "", 55, startY + 12.5);
    
    doc.setFont("helvetica", "bold"); doc.text("CNPJ: ", 182, startY + 12.5);
    doc.setFont("helvetica", "normal"); doc.text(c.cnpj || c.document || "", 195, startY + 12.5);

    doc.setFont("helvetica", "bold"); doc.text("NOME DO ESTABELECIMENTO: ", 22, startY + 19.5);
    doc.setFont("helvetica", "normal"); doc.text(c.tradeName || c.name || "", 80, startY + 19.5);
    
    doc.setFont("helvetica", "bold"); doc.text("CPF: ", 182, startY + 19.5);
    doc.setFont("helvetica", "normal"); doc.text(c.cpf || "", 193, startY + 19.5);

    doc.setFont("helvetica", "bold"); doc.text("RUA / LOGRADOURO: ", 22, startY + 26.5);
    doc.setFont("helvetica", "normal"); doc.text(c.street || "", 65, startY + 26.5);
    
    doc.setFont("helvetica", "bold"); doc.text("Nº: ", 182, startY + 26.5);
    doc.setFont("helvetica", "normal"); doc.text(c.number || "SN", 190, startY + 26.5);

    doc.setFont("helvetica", "bold"); doc.text("BAIRRO: ", 22, startY + 31.5);
    doc.setFont("helvetica", "normal"); doc.text(c.neighborhood || "", 42, startY + 31.5);
    
    doc.setFont("helvetica", "bold"); doc.text("MUNICIPIO: ", 182, startY + 31.5);
    doc.setFont("helvetica", "normal"); doc.text("TUCURUÍ - PA", 205, startY + 31.5);

    const t2Y = 103;
    doc.setFont("helvetica", "bold");
    doc.rect(20, t2Y, 257, 24); 
    doc.line(20, t2Y + 7, 277, t2Y + 7);
    doc.line(20, t2Y + 14, 277, t2Y + 14);
    
    doc.line(160, t2Y + 7, 160, t2Y + 14);

    doc.setFontSize(14);
    doc.text("IDENTIFICAÇÃO DO REPRESENTANTE LEGAL / RESPONSÁVEL TÉCNICO", 148.5, t2Y + 5.5, { align: "center" });

    doc.setFontSize(10);
    doc.text("NOME: ", 22, t2Y + 12.5);
    doc.setFont("helvetica", "normal"); doc.text(c.technicalResponsible || c.responsible || "", 35, t2Y + 12.5);
    
    doc.setFont("helvetica", "bold"); doc.text("INSCRIÇÃO DO CONSELHO REGIONAL: ", 162, t2Y + 12.5);
    doc.setFont("helvetica", "normal"); doc.text(c.technicalCouncil || "", 235, t2Y + 12.5);

    doc.setFont("helvetica", "bold"); doc.text("ATIVIDADE PRINCIPAL: ", 22, t2Y + 19.5);
    doc.setFont("helvetica", "normal"); doc.text(c.activity || "", 67, t2Y + 19.5);
    
    const disY = 138;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    const disclaimer = "O QUAL SE COMPROMETE A OBSERVAR AS BOAS PRÁTICAS DE FABRICAÇÃO E/OU SERVIÇOS E CUMPRIR NORMAS LEGAIS\nREGULAMENTARES DESTINADAS À PROMOÇÃO, RECUPERAÇÃO E DEFESA DA SAÚDE, REFERENTE AS ATIVIDADES EXERCIDAS.\nO NÃO CUMPRIMENTO DE TAIS EXIGÊNCIAS, IMPLICARÁ NA IMPOSIÇÃO DE PENALIDADES PREVISTAS NA LEGISLAÇÃO EM VIGOR,\nRESULTANDO INCLUSIVE NO CANCELAMENTO DA LICENÇA E/OU DISPENSA.";
    doc.text(disclaimer, 25, disY);

    const todayDate = new Date();
    const months = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];
    const dateStr = `TUCURUÍ-PA, ${todayDate.getDate()} DE ${months[todayDate.getMonth()]} DE ${todayDate.getFullYear()}`;
    
    doc.text(dateStr, 270, disY + 15, { align: "right" });

    const sigY = 166;
    doc.setLineWidth(0.5);
    doc.line(30, sigY, 110, sigY);
    doc.line(160, sigY, 260, sigY);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("TÉCNICO RESPONSÁVEL", 70, sigY + 4, { align: "center" });
    doc.text("COORDENADOR DA VISA", 210, sigY + 4, { align: "center" });

    doc.setLineWidth(1);
    doc.roundedRect(40, 175, 105, 10, 2, 2);
    
    let validityStr = "";
    const targetDateStr = c.licenseValidity || c.licenseIssuance;
    if (targetDateStr) {
        const parts = targetDateStr.split("-");
        if (parts.length >= 3) {
            const y = parseInt(parts[0]);
            const m = parseInt(parts[1]);
            const d = parseInt(parts[2]);
            const emDate = new Date(y, m - 1, d);
            if (!c.licenseValidity) {
                emDate.setFullYear(emDate.getFullYear() + 1); // fallback if no validity provided
            }
            validityStr = `${emDate.getDate().toString().padStart(2, '0')} / ${months[emDate.getMonth()]} / ${emDate.getFullYear()}`;
        }
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`VALIDADE:    ${validityStr}`, 43, 182);

    doc.roundedRect(150, 175, 105, 10, 2, 2);
    doc.text("AFIXAR EM LOCAL VISÍVEL AO PÚBLICO", 202.5, 182, { align: "center" });

    doc.save(`Licenca_Funcionamento_${c.document || c.id || "cad"}.pdf`);
  };

  const exportHealthWalletCertificate = (w: HealthWallet) => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [90, 60] // 9cm x 6cm landscape 
    });

    // Outer border
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.rect(2, 2, 86, 56);

    // Header Texts
    doc.setFontSize(4.5);
    doc.setFont("helvetica", "bold");
    doc.text("GOVERNO DO ESTADO DO PARÁ", 45, 6, { align: "center" });
    doc.text("PREFEITURA MUNICIPAL DE TUCURUÍ", 45, 8, { align: "center" });
    doc.text("SECRETARIA MUNICIPAL DE SAÚDE PÚBLICA", 45, 10, { align: "center" });
    doc.text("DIREÇÃO DE VIGILÂNCIA EM SAÚDE DE TUCURUÍ", 45, 12, { align: "center" });
    doc.text("DEPARTAMENTO DE VIGILÂNCIA SANITÁRIA", 45, 14, { align: "center" });

    // Title Background Box
    doc.setFillColor(34, 197, 94); // bg-green-500
    doc.rect(2, 16, 86, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.text("CARTEIRA DE SAÚDE", 45, 20.2, { align: "center" });

    // Back to black text
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(5.5);

    // Formatted Dates
    const formatDate = (dateStr?: string) => {
      if (!dateStr) return "";
      if (dateStr.includes('-')) {
        const [y, m, d] = dateStr.split('T')[0].split('-');
        if (y && m && d) return `${d}/${m}/${y}`;
      }
      return dateStr;
    };

    let yPos = 25;
    const spacing = 6;
    
    // Row 1: Nome and Data de Nasc
    doc.setFont("helvetica", "bold");
    doc.text("Nome:", 4, yPos);
    doc.setFont("helvetica", "normal");
    doc.text((w.patientName || "").toUpperCase(), 13, yPos);
    doc.line(12, yPos + 0.5, 60, yPos + 0.5);

    doc.setFont("helvetica", "bold");
    doc.text("Data de Nasc.:", 62, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(formatDate(w.birthDate), 77, yPos);
    doc.line(76, yPos + 0.5, 86, yPos + 0.5);

    yPos += spacing;
    
    // Row 2: Função and Nº do RG
    doc.setFont("helvetica", "bold");
    doc.text("Função:", 4, yPos);
    doc.setFont("helvetica", "normal");
    doc.text((w.role || "").toUpperCase(), 14, yPos);
    doc.line(13, yPos + 0.5, 59, yPos + 0.5);

    doc.setFont("helvetica", "bold");
    doc.text("Nº do RG:", 61, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(w.rg || "", 72, yPos);
    doc.line(71, yPos + 0.5, 86, yPos + 0.5);

    yPos += spacing;

    // Row 3: Emissão and Vencimento
    doc.setFont("helvetica", "bold");
    doc.text("Emissão:", 4, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(formatDate(w.issueDate), 15, yPos);
    doc.line(14, yPos + 0.5, 45, yPos + 0.5);

    doc.setFont("helvetica", "bold");
    doc.text("Vencimento:", 48, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(formatDate(w.expiration), 65, yPos);
    doc.line(64, yPos + 0.5, 86, yPos + 0.5);

    yPos += spacing + 1;

    // Row 4: Assinatura do portador
    doc.setFont("helvetica", "bold");
    doc.text("Assinatura do portador:", 4, yPos);
    doc.line(31, yPos + 0.5, 86, yPos + 0.5);

    yPos += spacing + 3;

    // Row 5: Assinatura da Autoridade Sanitária (centralizado)
    doc.line(20, yPos, 70, yPos);
    doc.text("Assinatura da Autoridade Sanitária", 45, yPos + 2.5, { align: "center" });

    doc.save(`Carteira_Saude_${(w.patientName || "Sem_Nome").replace(/\s+/g, '_')}.pdf`);
  };

  const printComplaintPDF = (c: Complaint) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    // Border
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.rect(10, 10, 190, 277);

    // Header Address
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("GOVERNO DO ESTADO DO PARÁ", 105, 20, { align: "center" });
    doc.text("PREFEITURA MUNICIPAL DE TUCURUÍ", 105, 25, { align: "center" });
    doc.text("SECRETARIA MUNICIPAL DE SAÚDE PÚBLICA", 105, 30, { align: "center" });
    doc.text("DIREÇÃO DE VIGILÂNCIA EM SAÚDE DE TUCURUÍ", 105, 35, { align: "center" });
    doc.text("DEPARTAMENTO DE VIGILÂNCIA SANITÁRIA", 105, 40, { align: "center" });

    // Header Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("REGISTRO DE OCORRÊNCIA / RECLAMAÇÃO", 105, 55, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Data do Registro: ${c.date || "-"}`, 15, 65);

    doc.setLineWidth(0.2);
    doc.line(10, 70, 200, 70);

    let yPos = 80;
    const lineSpacing = 8;
    const leftMargin = 15;

    // DADOS DO RECLAMANTE
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("1. DADOS DO RECLAMANTE", leftMargin, yPos);
    
    yPos += lineSpacing;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Nome:", leftMargin, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(c.reclamanteName || "-", leftMargin + 15, yPos);

    doc.setFont("helvetica", "bold");
    doc.text("Contato:", 120, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(c.reclamanteContact || "-", 138, yPos);

    yPos += lineSpacing;
    doc.setFont("helvetica", "bold");
    doc.text("Endereço:", leftMargin, yPos);
    doc.setFont("helvetica", "normal");
    const reclamanteEndereco = `${c.reclamanteStreet || "-"}, nº ${c.reclamanteNumber || "-"}, Bloco ${c.reclamanteBlock || "-"}, Qdr ${c.reclamanteQuadra || "-"}`;
    doc.text(reclamanteEndereco, leftMargin + 20, yPos);

    yPos += lineSpacing;
    doc.setFont("helvetica", "bold");
    doc.text("Bairro:", leftMargin, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(c.reclamanteNeighborhood || "-", leftMargin + 15, yPos);

    yPos += 15;
    doc.setDrawColor(200);
    doc.line(15, yPos - 5, 195, yPos - 5);

    // DADOS DO RECLAMADO
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("2. DADOS DO RECLAMADO", leftMargin, yPos);
    
    yPos += lineSpacing;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Nome/Apelido:", leftMargin, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(c.reclamadoName || "-", leftMargin + 30, yPos);

    yPos += lineSpacing;
    doc.setFont("helvetica", "bold");
    doc.text("Endereço:", leftMargin, yPos);
    doc.setFont("helvetica", "normal");
    const reclamadoEndereco = `${c.reclamadoStreet || "-"}, nº ${c.reclamadoNumber || "-"}, Bloco ${c.reclamadoBlock || "-"}, Qdr ${c.reclamadoQuadra || "-"}`;
    doc.text(reclamadoEndereco, leftMargin + 20, yPos);

    yPos += lineSpacing;
    doc.setFont("helvetica", "bold");
    doc.text("Bairro:", leftMargin, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(c.reclamadoNeighborhood || "-", leftMargin + 15, yPos);


    yPos += 15;
    doc.setDrawColor(200);
    doc.line(15, yPos - 5, 195, yPos - 5);

    // DESCRIÇÃO
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("3. ESPECIFICAÇÃO DO PROBLEMA", leftMargin, yPos);
    
    yPos += lineSpacing;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    const splitSubject = doc.splitTextToSize(c.subject || "", 170);
    doc.text(splitSubject, leftMargin, yPos);

    // Signatures at the bottom
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);

    const sigY = 240;

    // Reclamante signature
    doc.line(20, sigY, 80, sigY);
    doc.setFont("helvetica", "bold");
    doc.text("Reclamante", 50, sigY + 5, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const splitReclamante = doc.splitTextToSize(c.reclamanteName || "", 60);
    doc.text(splitReclamante, 50, sigY + 10, { align: "center" });

    // Reclamado signature
    doc.line(130, sigY, 190, sigY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Reclamado", 160, sigY + 5, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    let nameReclamadoToPrint = c.reclamadoName && c.reclamadoName.trim() !== '' ? c.reclamadoName : "";
    const splitReclamado = doc.splitTextToSize(nameReclamadoToPrint, 60);
    doc.text(splitReclamado, 160, sigY + 10, { align: "center" });

    doc.save(`Ocorrencia_${(c.reclamanteName || "Sem_Nome").replace(/\s+/g, '_')}.pdf`);
  };

  const deleteHealthWallet = (id: string) => setDeleteConfirmation({ id, type: 'healthWallet' });
  const deleteComplaint = (id: string) => setDeleteConfirmation({ id, type: 'complaint' });
  const deleteProduction = (id: string) => setDeleteConfirmation({ id, type: 'production' });
  const deletePrint = (id: string) => setDeleteConfirmation({ id, type: 'print' });

  const downloadPrint = (id: string) => {
    window.location.href = `/api/prints/download/${id}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,#3b82f6,transparent_70%)]"></div>
              </div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-lg shadow-blue-500/20">VT</div>
                <h1 className="text-2xl font-bold text-white tracking-tight">VISA TUCURUI</h1>
                <p className="text-slate-400 text-sm mt-1 uppercase tracking-widest font-bold opacity-60">Portal de Acesso</p>
              </div>
            </div>

            <div className="p-8">
              <form onSubmit={handleLogin} className="space-y-5">
                <AnimatePresence>
                  {loginError && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-3"
                    >
                      <AlertCircle size={18} />
                      {loginError}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest px-1">E-mail Corporativo</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                      type="email" 
                      required
                      placeholder="admin@exemplo.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Senha</label>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                      type="password" 
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 px-1">
                  <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <label htmlFor="remember" className="text-xs text-slate-500 font-medium">Lembrar neste dispositivo</label>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoggingIn}
                  className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group active:scale-[0.98] disabled:opacity-50"
                >
                  {isLoggingIn ? "Autenticando..." : "Entrar no Sistema"}
                  {!isLoggingIn && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>
            </div>
          </div>
          

        </motion.div>
      </div>
    );
  }

  const filteredProductionRecords = productionRecords.filter(p => {
    const matchDate = productionFilterDate ? p.date === productionFilterDate : true;
    const matchName = productionFilterName ? p.officer.toLowerCase().includes(productionFilterName.toLowerCase()) : true;
    const matchActivity = productionFilterActivity ? p.activity.toLowerCase().includes(productionFilterActivity.toLowerCase()) : true;
    return matchDate && matchName && matchActivity;
  });

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800 flex flex-col text-slate-400 z-30 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">VT</div>
            <span className="font-semibold text-lg tracking-tight text-white">VISA TUCURUI</span>
          </div>
          <button 
            className="md:hidden text-slate-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {user?.permissions.includes("dashboard") && (
            <SidebarLink 
              icon={<LayoutDashboard size={20} />} 
              label="Painel Geral" 
              active={activeTab === "dashboard"} 
              onClick={() => setActiveTab("dashboard")} 
            />
          )}
          
          <div className="pt-2 pb-1 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest opacity-50">Gestão</div>
          
          {user?.permissions.includes("contribuintes") && (
            <SidebarLink 
              icon={<HandCoins size={20} />} 
              label="Contribuintes" 
              active={activeTab === "contribuintes"} 
              onClick={() => setActiveTab("contribuintes")} 
            />
          )}
          {user?.permissions.includes("saude") && (
            <SidebarLink 
              icon={<HeartPulse size={20} />} 
              label="Carteira de Saúde" 
              active={activeTab === "saude"} 
              onClick={() => setActiveTab("saude")} 
            />
          )}
          {user?.permissions.includes("reclamacoes") && (
            <SidebarLink 
              icon={<MessageSquareWarning size={20} />} 
              label="Reclamações" 
              active={activeTab === "reclamacoes"} 
              onClick={() => setActiveTab("reclamacoes")} 
            />
          )}
          {user?.permissions.includes("producao") && (
            <SidebarLink 
              icon={<Briefcase size={20} />} 
              label="Produção" 
              active={activeTab === "producao"} 
              onClick={() => setActiveTab("producao")} 
            />
          )}
          {user?.permissions.includes("impressos") && (
            <SidebarLink 
              icon={<Printer size={20} />} 
              label="Impressos" 
              active={activeTab === "impressos"} 
              onClick={() => setActiveTab("impressos")} 
            />
          )}

          {user?.permissions.includes("users") && (
            <SidebarLink 
              icon={<Users size={20} />} 
              label="Usuários" 
              active={activeTab === "users"} 
              onClick={() => setActiveTab("users")} 
            />
          )}
          {user?.permissions.includes("alterar_cadastro") && (
            <SidebarLink 
              icon={<UserPen size={20} />} 
              label="Alterar Cadastro" 
              active={false} 
              onClick={() => {
                setEditingUser(user);
                setIsSelfEditing(true);
                setIsEditingUser(true);
              }} 
            />
          )}
          {user?.permissions.includes("dados") && (
            <SidebarLink 
              icon={<Database size={20} />} 
              label="Gestão de Dados" 
              active={activeTab === "dados"} 
              onClick={() => setActiveTab("dados")} 
            />
          )}
          {user?.permissions.includes("forms") && (
            <SidebarLink 
              icon={<FileText size={20} />} 
              label="Formulários" 
              active={activeTab === "forms"} 
              onClick={() => setActiveTab("forms")} 
            />
          )}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="mb-4 px-3 py-2 rounded-lg bg-slate-800/30 border border-slate-800 flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Banco de Dados</span>
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${dbConnected === null ? 'bg-amber-500 animate-pulse' : dbConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
              <span className={`text-[9px] font-bold uppercase tracking-widest ${dbConnected === null ? 'text-amber-500' : dbConnected ? 'text-emerald-500' : 'text-red-500'}`}>
                {dbConnected === null ? 'Conectando...' : dbConnected ? 'Conectado' : 'Erro'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">👨‍💻</div>
            <div className="flex-1 overflow-hidden text-xs">
              <p className="font-semibold truncate text-slate-200">{user?.name || "Usuário"}</p>
              <p className="text-[10px] text-slate-500">{user?.email || "admin@gestao.com"}</p>
            </div>
          </div>
          <nav className="space-y-1">
            <SidebarLink icon={<Settings size={20} />} label="Configurações" />
            <SidebarLink icon={<LogOut size={20} />} label="Sair" color="text-red-400 hover:text-red-300" onClick={handleLogout} />
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50 w-full">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-10 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-4 text-sm text-slate-500">
            <button 
              className="md:hidden text-slate-500 hover:text-slate-800 mr-2"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <span className="hover:text-blue-600 cursor-pointer transition-colors hidden sm:inline" onClick={() => setActiveTab("dashboard")}>Painel</span>
            <span className="text-slate-300 hidden sm:inline">/</span>
            <span className="font-medium text-slate-800 uppercase tracking-tighter text-xs">
              {activeTab === "dashboard" && "Dashboard Geral"}
              {activeTab === "contribuintes" && "Gestão de Contribuintes"}
              {activeTab === "saude" && "Carteira de Saúde"}
              {activeTab === "reclamacoes" && "Central de Reclamações"}
              {activeTab === "producao" && "Controle de Produção"}
              {activeTab === "impressos" && "Gestão de Impressos"}
              {activeTab === "users" && "Gestão de Usuários"}
              {activeTab === "dados" && "Gestão de Dados"}
              {activeTab === "forms" && "Gestão de Formulários"}
            </span>
          </div>
          
            <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Buscar registros..." 
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 w-48 lg:w-64 focus:outline-none transition-all shadow-sm"
              />
            </div>
            {(activeTab === "users" || activeTab === "forms" || activeTab === "contribuintes" || activeTab === "saude" || activeTab === "reclamacoes" || activeTab === "producao" || activeTab === "impressos") && (
              <button 
                onClick={() => {
                  if (activeTab === "users") setIsAddingUser(true);
                  else if (activeTab === "forms") setIsAddingForm(true);
                  else if (activeTab === "contribuintes") setIsAddingContributor(true);
                  else if (activeTab === "saude") setIsAddingHealthWallet(true);
                  else if (activeTab === "reclamacoes") setIsAddingComplaint(true);
                  else if (activeTab === "producao") setIsAddingProduction(true);
                  else if (activeTab === "impressos") setIsAddingPrint(true);
                }}
                className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold shadow-md hover:bg-blue-700 transition-all flex items-center gap-2"
              >
                <Plus size={18} /> 
                <span className="hidden sm:inline">
                  {activeTab === "users" && "Novo Usuário"}
                  {activeTab === "forms" && "Novo Formulário"}
                  {activeTab === "contribuintes" && "Novo Contribuinte"}
                  {activeTab === "saude" && "Nova Carteira"}
                  {activeTab === "reclamacoes" && "Novo Chamado"}
                  {activeTab === "producao" && "Nova Atividade"}
                  {activeTab === "impressos" && "Upload Arquivo"}
                </span>
              </button>
            )}
          </div>
        </header>

        <div className="p-4 sm:p-8 flex-1 overflow-y-auto space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard label="Total Cadastrados" value={contributors.length.toString()} icon={<Users className="text-blue-500" />} change="Contribuintes" changeColor="text-blue-500" />
                  <StatCard label="Emissão de Licença" value={contributors.filter(c => c.licenseIssuance && c.licenseIssuance.trim() !== "").length.toString()} icon={<CheckCircle className="text-emerald-500" />} change="Licenças" changeColor="text-emerald-500" />
                  <StatCard label="Emissão de DAM" value={contributors.filter(c => c.damIssuance && c.damIssuance.trim() !== "").length.toString()} icon={<FileText className="text-amber-500" />} change="DAMs Emitidos" changeColor="text-amber-500" />
                </div>

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 overflow-hidden">
                  <h3 className="font-semibold text-slate-700 mb-6">Gestão de Contribuintes - Visão Geral</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: 'Cadastrados', total: contributors.length },
                          { name: 'Licenças', total: contributors.filter(c => c.licenseIssuance && c.licenseIssuance.trim() !== "").length },
                          { name: 'DAMs Emitidos', total: contributors.filter(c => c.damIssuance && c.damIssuance.trim() !== "").length }
                        ]}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <Tooltip 
                          cursor={{ fill: '#f8fafc' }}
                          contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="total" radius={[4, 4, 0, 0]} maxBarSize={60}>
                          {
                            [
                              { name: 'Cadastrados', total: contributors.length },
                              { name: 'Licenças', total: contributors.filter(c => c.licenseIssuance && c.licenseIssuance.trim() !== "").length },
                              { name: 'DAMs Emitidos', total: contributors.filter(c => c.damIssuance && c.damIssuance.trim() !== "").length }
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : index === 1 ? '#10b981' : '#f59e0b'} />
                            ))
                          }
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 overflow-hidden mt-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                    <h3 className="font-semibold text-slate-700">Gestão de Carteiras de Saúde - Visão Geral</h3>
                    <div className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-widest border border-indigo-100">
                      Total Cadastrados: {healthWallets.length}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 text-center">Por Categoria</h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={
                                Object.entries(healthWallets.reduce((acc, hw) => {
                                  const cat = hw.category || "Sem Categoria";
                                  acc[cat] = (acc[cat] || 0) + 1;
                                  return acc;
                                }, {} as Record<string, number>)).map(([name, value]) => ({ name, value }))
                              }
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {
                                Object.entries(healthWallets.reduce((acc, hw) => {
                                  const cat = hw.category || "Sem Categoria";
                                  acc[cat] = (acc[cat] || 0) + 1;
                                  return acc;
                                }, {} as Record<string, number>)).map((entry, index) => {
                                  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];
                                  return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                })
                              }
                            </Pie>
                            <Tooltip 
                              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 text-center">Top 5 Funções</h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            layout="vertical"
                            data={
                              Object.entries(healthWallets.reduce((acc, hw) => {
                                const role = hw.role || "Sem Função";
                                acc[role] = (acc[role] || 0) + 1;
                                return acc;
                              }, {} as Record<string, number>))
                                .map(([name, total]) => ({ name, total }))
                                .sort((a, b) => Number(b.total) - Number(a.total))
                                .slice(0, 5)
                            }
                            margin={{ top: 0, right: 20, left: 20, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                            <Tooltip 
                              cursor={{ fill: '#f8fafc' }}
                              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="total" fill="#8b5cf6" radius={[0, 4, 4, 0]} maxBarSize={40}>
                              {
                                Object.entries(healthWallets.reduce((acc, hw) => {
                                  const role = hw.role || "Sem Função";
                                  acc[role] = (acc[role] || 0) + 1;
                                  return acc;
                                }, {} as Record<string, number>))
                                  .map(([name, total]) => ({ name, total }))
                                  .sort((a, b) => Number(b.total) - Number(a.total))
                                  .slice(0, 5)
                                  .map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill="#8b5cf6" />
                                  ))
                              }
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 overflow-hidden mt-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                    <h3 className="font-semibold text-slate-700">Central de Ocorrências e Reclamações - Visão Geral</h3>
                    <div className="px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-xs font-bold uppercase tracking-widest border border-red-100">
                      Total Cadastrados: {complaints.length}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 text-center">Por Status</h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={
                                Object.entries(complaints.reduce((acc, c) => {
                                  const status = c.status || "Pendente";
                                  acc[status] = (acc[status] || 0) + 1;
                                  return acc;
                                }, {} as Record<string, number>)).map(([name, value]) => ({ 
                                  name: name === 'pendente' ? 'Pendente' : name === 'em_analise' ? 'Em Análise' : name === 'resolvido' ? 'Resolvido' : name, 
                                  value 
                                }))
                              }
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {
                                Object.entries(complaints.reduce((acc, c) => {
                                  const status = c.status || "Pendente";
                                  acc[status] = (acc[status] || 0) + 1;
                                  return acc;
                                }, {} as Record<string, number>)).map((entry, index) => {
                                  const colors = ['#f59e0b', '#3b82f6', '#10b981', '#64748b'];
                                  return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                })
                              }
                            </Pie>
                            <Tooltip 
                              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 text-center">Por Prioridade</h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={
                              Object.entries(complaints.reduce((acc, c) => {
                                const priority = c.priority || "Média";
                                acc[priority] = (acc[priority] || 0) + 1;
                                return acc;
                              }, {} as Record<string, number>)).map(([name, total]) => ({ 
                                name: name === 'baixa' ? 'Baixa' : name === 'media' ? 'Média' : name === 'alta' ? 'Alta' : name, 
                                total 
                              }))
                            }
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <Tooltip 
                              cursor={{ fill: '#f8fafc' }}
                              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="total" radius={[4, 4, 0, 0]} maxBarSize={60}>
                              {
                                Object.entries(complaints.reduce((acc, c) => {
                                  const priority = c.priority || "Média";
                                  acc[priority] = (acc[priority] || 0) + 1;
                                  return acc;
                                }, {} as Record<string, number>)).map(([name], index) => (
                                  <Cell key={`cell-${index}`} fill={name === 'alta' ? '#ef4444' : name === 'media' ? '#f59e0b' : '#3b82f6'} />
                                ))
                              }
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 overflow-hidden mt-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                    <h3 className="font-semibold text-slate-700">Relatório de Atividades e Produção - Visão Geral</h3>
                    <div className="px-3 py-1.5 bg-sky-50 text-sky-700 rounded-full text-xs font-bold uppercase tracking-widest border border-sky-100">
                      Total Atividades: {productionRecords.length}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 text-center">Por Mês</h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={
                              Object.entries(productionRecords.reduce((acc, p) => {
                                if (!p.date) return acc;
                                const month = p.date.split('-')[1];
                                if (month) acc[month] = (acc[month] || 0) + 1;
                                return acc;
                              }, {} as Record<string, number>))
                              .sort((a, b) => a[0].localeCompare(b[0]))
                              .map(([month, total]) => ({ 
                                name: { "01": "Jan", "02": "Fev", "03": "Mar", "04": "Abr", "05": "Mai", "06": "Jun", "07": "Jul", "08": "Ago", "09": "Set", "10": "Out", "11": "Nov", "12": "Dez" }[month] || month, 
                                total 
                              }))
                            }
                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                            <Bar dataKey="total" fill="#0ea5e9" radius={[4, 4, 0, 0]} maxBarSize={40}>
                              {
                                Object.entries(productionRecords.reduce((acc, p) => {
                                  if (!p.date) return acc;
                                  const month = p.date.split('-')[1];
                                  if (month) acc[month] = (acc[month] || 0) + 1;
                                  return acc;
                                }, {} as Record<string, number>))
                                .sort((a, b) => a[0].localeCompare(b[0]))
                                .map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill="#0ea5e9" />
                                ))
                              }
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 text-center">Top Atividades</h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            layout="vertical"
                            data={
                              Object.entries(productionRecords.reduce((acc, p) => {
                                const activity = p.activity || "Não informada";
                                acc[activity] = (acc[activity] || 0) + 1;
                                return acc;
                              }, {} as Record<string, number>))
                                .map(([name, total]) => ({ name, total }))
                                .sort((a, b) => Number(b.total) - Number(a.total))
                                .slice(0, 5)
                            }
                            margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <YAxis dataKey="name" type="category" width={80} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                            <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                            <Bar dataKey="total" fill="#14b8a6" radius={[0, 4, 4, 0]} maxBarSize={30}>
                              {
                                Object.entries(productionRecords.reduce((acc, p) => {
                                  const activity = p.activity || "Não informada";
                                  acc[activity] = (acc[activity] || 0) + 1;
                                  return acc;
                                }, {} as Record<string, number>))
                                  .map(([name, total]) => ({ name, total }))
                                  .sort((a, b) => Number(b.total) - Number(a.total))
                                  .slice(0, 5)
                                  .map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill="#14b8a6" />
                                  ))
                              }
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 text-center">Por Fiscal</h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={
                                Object.entries(productionRecords.reduce((acc, p) => {
                                  const officer = p.officer || "Não informado";
                                  acc[officer] = (acc[officer] || 0) + 1;
                                  return acc;
                                }, {} as Record<string, number>)).map(([name, value]) => ({ name, value }))
                              }
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={70}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {
                                Object.entries(productionRecords.reduce((acc, p) => {
                                  const officer = p.officer || "Não informado";
                                  acc[officer] = (acc[officer] || 0) + 1;
                                  return acc;
                                }, {} as Record<string, number>)).map((entry, index) => {
                                  const colors = ['#8b5cf6', '#ec4899', '#f43f5e', '#6366f1', '#eab308', '#0ea5e9'];
                                  return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                })
                              }
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Legend wrapperStyle={{ fontSize: '11px' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "contribuintes" && (
              <motion.div 
                key="contribuintes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col min-h-0"
              >
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-semibold text-slate-700 underline decoration-blue-500/30 underline-offset-4">Gestão de Contribuintes</h3>
                  <div className="flex gap-2">
                    <button className="text-xs px-3 py-1.5 border border-slate-200 rounded hover:bg-white transition-colors font-medium text-slate-600">Exportar PDF</button>
                    <button onClick={exportContributorsToExcel} className="text-xs px-3 py-1.5 border border-green-200 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors font-medium flex items-center gap-1">
                      Exportar Excel
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-widest sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 font-bold text-blue-600/70">Razão Social / Nome</th>
                        <th className="px-6 py-4 font-bold">CNPJ/CPF</th>
                        <th className="px-6 py-4 font-bold text-center">Tipo</th>
                        <th className="px-6 py-4 font-bold text-center">Status VISA</th>
                        <th className="px-6 py-4 font-bold text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      {contributors.map(c => (
                        <tr key={c.id} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900">{c.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">ID: {c.id}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs">{c.document}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-600 border border-slate-200">{c.type}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              c.status === "regular" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                            }`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-3 text-slate-400">
                              <button 
                                onClick={() => generateProcessPDF(c)} 
                                className="p-2 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                title="Gerar Processo"
                              >
                                <FolderOpen size={18} />
                              </button>
                              <button 
                                onClick={() => exportContributorCertificate(c)} 
                                className="p-2 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                title="Imprimir Licença"
                              >
                                <Printer size={18} />
                              </button>
                              <button 
                                onClick={() => openEditContributor(c)} 
                                className="p-2 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                title="Editar"
                              >
                                <SquarePen size={18} />
                              </button>
                              <button 
                                onClick={() => deleteContributor(c.id)} 
                                className="p-2 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="Remover"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === "saude" && (
              <motion.div 
                key="saude"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col min-h-0"
              >
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-semibold text-slate-700 underline decoration-green-500/30 underline-offset-4">Gestão de Carteiras de Saúde</h3>
                  <div className="flex gap-2">
                    <button onClick={exportHealthWalletsToExcel} className="text-xs px-3 py-1.5 border border-green-200 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors font-medium flex items-center gap-1">
                      Exportar Excel
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-widest sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 font-bold text-green-600/70">Nome do Portador</th>
                        <th className="px-6 py-4 font-bold">Categoria</th>
                        <th className="px-6 py-4 font-bold text-center">Vencimento</th>
                        <th className="px-6 py-4 font-bold text-center">Status</th>
                        <th className="px-6 py-4 font-bold text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      {healthWallets.map(w => (
                        <tr key={w.id} className="hover:bg-green-50/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900">{w.patientName}</span>
                              {w.contact && <span className="text-[10px] text-slate-400 font-mono">Contato: {w.contact}</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4 font-medium">{w.category}</td>
                          <td className="px-6 py-4 text-center font-mono text-xs">{w.expiration}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              w.status === "ativo" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}>
                              {w.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => exportHealthWalletCertificate(w)} 
                                className="p-2 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                title="Imprimir Carteira"
                              >
                                <IdCard size={18} />
                              </button>
                              <button 
                                onClick={() => openEditHealthWallet(w)} 
                                className="p-2 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                title="Editar"
                              >
                                <SquarePen size={18} />
                              </button>
                              <button 
                                onClick={() => deleteHealthWallet(w.id)} 
                                className="p-2 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="Anular"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === "reclamacoes" && (
              <motion.div 
                key="reclamacoes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col min-h-0"
              >
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-semibold text-slate-700 underline decoration-red-500/30 underline-offset-4">Central de Ocorrências e Reclamações</h3>
                  <div className="flex gap-2">
                    <button onClick={exportComplaintsToExcel} className="text-xs px-3 py-1.5 border border-green-200 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors font-medium flex items-center gap-1">
                      Exportar Excel
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-widest sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 font-bold text-red-600/70">Relator / Assunto</th>
                        <th className="px-6 py-4 font-bold">Data</th>
                        <th className="px-6 py-4 font-bold text-center">Prioridade</th>
                        <th className="px-6 py-4 font-bold text-center">Status</th>
                        <th className="px-6 py-4 font-bold text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      {complaints.map(c => (
                        <tr key={c.id} className="hover:bg-red-50/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900">{c.reclamanteName}</span>
                              <span className="text-xs text-slate-500 italic serif">{c.subject}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs">{c.date}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              c.priority === "alta" ? "bg-red-100 text-red-700 border border-red-200" :
                              c.priority === "media" ? "bg-orange-100 text-orange-700 border border-orange-200" :
                              "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}>
                              {c.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              c.status === "resolvido" ? "bg-green-100 text-green-700" : 
                              c.status === "em_analise" ? "bg-blue-100 text-blue-700" :
                              "bg-slate-100 text-slate-500"
                            }`}>
                              {c.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => printComplaintPDF(c)} 
                                className="p-2 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                                title="Imprimir Ocorrência"
                              >
                                <Printer size={18} />
                              </button>
                              <button 
                                onClick={() => openEditComplaint(c)} 
                                className="p-2 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                title="Editar"
                              >
                                <SquarePen size={18} />
                              </button>
                              <button 
                                onClick={() => deleteComplaint(c.id)} 
                                className="p-2 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="Excluir"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === "producao" && (
              <motion.div 
                key="producao"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col min-h-0"
              >
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50/50 gap-4">
                  <h3 className="font-semibold text-slate-700 underline decoration-indigo-500/30 underline-offset-4 shrink-0">Relatório de Atividades e Produção</h3>
                  
                  <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <input 
                      type="date"
                      value={productionFilterDate}
                      onChange={e => setProductionFilterDate(e.target.value)}
                      className="border border-slate-200 rounded px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      title="Filtrar por Data"
                    />
                    <input 
                      type="text"
                      placeholder="Filtrar por Nome"
                      value={productionFilterName}
                      onChange={e => setProductionFilterName(e.target.value)}
                      className="border border-slate-200 rounded px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white min-w-[150px]"
                    />
                    <input 
                      type="text"
                      placeholder="Filtrar por Atividade"
                      value={productionFilterActivity}
                      onChange={e => setProductionFilterActivity(e.target.value)}
                      className="border border-slate-200 rounded px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white min-w-[150px]"
                    />
                    <button onClick={exportProductionToExcel} className="text-xs px-3 py-1.5 border border-green-200 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors font-medium flex items-center justify-center gap-1 shrink-0">
                      Exportar Excel
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-widest sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 font-bold text-indigo-600/70">Atividade / Bairro</th>
                        <th className="px-6 py-4 font-bold">Responsável</th>
                        <th className="px-6 py-4 font-bold text-center">Data Registro</th>
                        <th className="px-6 py-4 font-bold text-center">Progresso</th>
                        <th className="px-6 py-4 font-bold text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      {filteredProductionRecords.map(p => (
                        <tr key={p.id} className="hover:bg-indigo-50/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900">{p.activity}</span>
                              <span className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">{p.neighborhood || "-"}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-medium">{p.officer}</td>
                          <td className="px-6 py-4 text-center font-mono text-xs">{p.date}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              p.status === "concluido" ? "bg-green-100 text-green-700" : 
                              p.status === "em_andamento" ? "bg-yellow-100 text-yellow-700" :
                              "bg-slate-100 text-slate-500"
                            }`}>
                              {p.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-3">
                              <button 
                                onClick={() => openEditProduction(p)} 
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                title="EDITAR"
                              >
                                <SquarePen size={18} />
                              </button>
                              <button 
                                onClick={() => deleteProduction(p.id)} 
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="EXCLUIR"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === "impressos" && (
              <motion.div 
                key="impressos"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col min-h-0"
              >
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-semibold text-slate-700 underline decoration-slate-500/30 underline-offset-4">Gestão de Impressos e Documentos</h3>
                  <div className="flex gap-2">
                    <button className="text-xs px-3 py-1.5 border border-slate-200 rounded hover:bg-white transition-colors font-medium text-slate-600">Sincronizar Nuvem</button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-widest sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 font-bold text-slate-600/70">Nome do Documento</th>
                        <th className="px-6 py-4 font-bold">Tipo de Arquivo</th>
                        <th className="px-6 py-4 font-bold text-center">Tamanho</th>
                        <th className="px-6 py-4 font-bold text-center">Data Upload</th>
                        <th className="px-6 py-4 font-bold text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      {printedMatter.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900 truncate max-w-xs">{p.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">MD5: {p.id.slice(-8).toUpperCase()}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs text-slate-500 uppercase tracking-tighter">{p.type.split('/')[1] || "DOC"}</span>
                          </td>
                          <td className="px-6 py-4 text-center font-mono text-xs">{p.size}</td>
                          <td className="px-6 py-4 text-center text-xs">{p.date}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => downloadPrint(p.id)} 
                                className="p-2 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                title="Baixar"
                              >
                                <Download size={18} />
                              </button>
                              <button 
                                onClick={() => deletePrint(p.id)} 
                                className="p-2 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="Remover"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === "users" && (
              <motion.div 
                key="users"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col min-h-0"
              >
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-semibold text-slate-700">Registros de Acesso</h3>
                  <div className="flex gap-2">
                    <button onClick={exportAccessLogsToExcel} className="text-xs px-3 py-1.5 border border-green-200 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors font-medium flex items-center gap-1">
                      Exportar Excel
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-widest sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 font-bold">ID Usuário</th>
                        <th className="px-6 py-4 font-bold">Nome Completo</th>
                        <th className="px-6 py-4 font-bold">E-mail Corporativo</th>
                        <th className="px-6 py-4 font-bold">Módulos</th>
                        <th className="px-6 py-4 font-bold text-center">Nível Acesso</th>
                        <th className="px-6 py-4 font-bold text-right">Ação Direta</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      {users.map(user => (
                        <tr key={user.id} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs text-slate-400">#USR-{user.id.slice(-4)}</td>
                          <td className="px-6 py-4 font-medium text-slate-900">{user.name}</td>
                          <td className="px-6 py-4">{user.email}</td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {user.permissions && user.permissions.length > 0 ? (
                                user.permissions.map(pId => (
                                  <span key={pId} className="text-[9px] bg-slate-100 text-slate-500 px-1 rounded border border-slate-200 whitespace-nowrap">
                                    {ALL_PERMISSIONS.find(ap => ap.id === pId)?.label || pId}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[9px] text-red-400 italic">Nenhum acesso</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              user.role === "admin" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-3 text-slate-400">
                              <button 
                                onClick={() => openEditUser(user)} 
                                className="p-2 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                title="Editar"
                              >
                                <SquarePen size={18} />
                              </button>
                              <button 
                                onClick={() => deleteUser(user.id)} 
                                className="p-2 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="Excluir"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === "forms" && (
              <motion.div 
                key="forms"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 bg-slate-50/50 flex justify-between items-center">
                  <h3 className="font-semibold text-slate-700 tracking-tight">Catálogo de Formulários Ativos</h3>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{forms.length} Registrados</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {forms.map(form => (
                    <div key={form.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow hover:border-blue-200 transition-colors group">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{form.title}</h4>
                          <p className="text-slate-500 text-sm mt-2 italic serif leading-relaxed">{form.description}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          form.status === "ativo" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                        }`}>
                          {form.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Publicação</span>
                          <span className="text-xs text-slate-600 font-mono font-medium">{form.date}</span>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => deleteForm(form.id)} 
                            className="p-2 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Excluir"
                          >
                            <Trash2 size={18} />
                          </button>
                          <button 
                            className="p-2 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Publicar"
                          >
                            <ArrowRight size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "dados" && (
              <motion.div 
                key="dados"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 bg-slate-50/50">
                  <div className="flex items-center gap-4 mb-6">
                    <Database size={32} className="text-blue-500" />
                    <div>
                      <h3 className="font-semibold text-slate-700 tracking-tight text-lg">Módulo de Gestão de Dados</h3>
                      <p className="text-sm text-slate-500 mt-1">Gerencie listas estáticas e configurações do sistema.</p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] max-w-2xl">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-slate-700 mb-6 border-b border-slate-100 pb-4">
                      Inserir / Gerenciar Valores das Formatações
                    </h4>
                    
                    <form onSubmit={handleAddDataManagerItem} className="flex flex-col sm:flex-row gap-3 mb-6">
                      <select
                        value={dataManagerCategory}
                        onChange={(e: any) => setDataManagerCategory(e.target.value)}
                        className="border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 min-w-[200px]"
                      >
                        <option value="neighborhoods">Bairros</option>
                        <option value="officers">Fiscais</option>
                        <option value="streets">Ruas</option>
                        <option value="functions">Funções</option>
                        <option value="activities">Atividades</option>
                        <option value="years">Anos</option>
                      </select>

                      <div className="flex flex-1 gap-2">
                        <input 
                          type="text" 
                          placeholder="Digite um novo valor para a lista..."
                          value={dataManagerInputValue}
                          onChange={e => setDataManagerInputValue(e.target.value)}
                          className="flex-1 border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-inner bg-slate-50 relative top-0 hover:bg-white transition-colors" 
                        />
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 px-4 rounded-lg shadow-md transition-all active:scale-95 flex items-center justify-center font-medium text-sm whitespace-nowrap">
                          <Plus size={16} className="mr-2" /> Adicionar
                        </button>
                      </div>
                    </form>

                    <div className="mt-4">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                        Valores cadastrados em '{dataManagerCategory === "neighborhoods" ? 'Bairros' : dataManagerCategory === "officers" ? 'Fiscais Responsáveis' : dataManagerCategory === "streets" ? 'Ruas / Logradouros' : dataManagerCategory === "functions" ? 'Função' : dataManagerCategory === "activities" ? 'Atividade Realizada' : 'Anos Anteriores'}' ({
                          (dataManagerCategory === 'neighborhoods' ? neighborhoods : 
                          dataManagerCategory === 'officers' ? officers : 
                          dataManagerCategory === 'streets' ? streets : 
                          dataManagerCategory === 'functions' ? functions :
                          dataManagerCategory === 'activities' ? activities : years).length
                        })
                      </p>
                      
                      <div className="max-h-80 overflow-y-auto pr-2 border border-slate-100 rounded-lg bg-slate-50/50 p-2">
                        <ul className="space-y-1">
                          {(dataManagerCategory === 'neighborhoods' ? neighborhoods : 
                            dataManagerCategory === 'officers' ? officers : 
                            dataManagerCategory === 'streets' ? streets : 
                            dataManagerCategory === 'functions' ? functions :
                            dataManagerCategory === 'activities' ? activities : years).map((item, index) => (
                            <li key={index} className="px-4 py-3 bg-white border border-slate-100 rounded-md text-sm text-slate-700 font-medium whitespace-nowrap overflow-hidden text-ellipsis shadow-sm hover:border-blue-200 transition-colors cursor-default flex items-center justify-between group">
                              {item}
                              <button 
                                onClick={() => handleRemoveDataManagerItem(item)}
                                className="text-slate-300 hover:text-red-500 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity rounded-md hover:bg-red-50"
                                title="Remover"
                              >
                                <Trash2 size={16} />
                              </button>
                            </li>
                          ))}
                          
                          {(dataManagerCategory === 'neighborhoods' ? neighborhoods : 
                            dataManagerCategory === 'officers' ? officers : 
                            dataManagerCategory === 'streets' ? streets : 
                            dataManagerCategory === 'functions' ? functions :
                            dataManagerCategory === 'activities' ? activities : years).length === 0 && (
                            <li className="text-slate-400 text-sm text-center py-4 italic">
                              Nenhum valor encontrado nesta categoria.
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mt-6">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <h3 className="font-semibold text-slate-700">Atividades Recentes do Sistema</h3>
                      <div className="flex gap-2 text-xs font-medium text-slate-500">
                        <button className="px-3 py-1.5 border border-slate-200 rounded hover:bg-white transition-colors">Exportar CSV</button>
                      </div>
                    </div>
                    <div className="p-0">
                      <div className="divide-y divide-slate-100 italic serif">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                              <span className="text-sm font-medium text-slate-700">Sistema: Registro de atividade administrativa #{i}</span>
                            </div>
                            <span className="text-xs text-slate-400 font-mono tracking-tighter">Hoje, às {10 + i}:00</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Modals - Styled for Professional Polish */}
      {isAddingUser && (
        <Modal title="Novo Registro de Acesso" onClose={() => setIsAddingUser(false)} maxWidth="max-w-4xl">
          <form onSubmit={addUser} className="space-y-6 pb-4">
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-4 flex items-center gap-2">
                <span className="w-4 h-px bg-blue-200"></span> Dados do Usuário
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Identificação Nominal</label>
                  <input 
                    required 
                    placeholder="Nome do colaborador..."
                    value={newUser.name}
                    onChange={e => setNewUser({...newUser, name: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">E-mail Corporativo</label>
                  <input 
                    required 
                    type="email" 
                    placeholder="usuario@empresa.com"
                    value={newUser.email}
                    onChange={e => setNewUser({...newUser, email: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Senha de Acesso</label>
                  <input 
                    required 
                    type="password"
                    placeholder="Defina uma senha..."
                    value={newUser.password}
                    onChange={e => setNewUser({...newUser, password: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm" 
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-4 flex items-center gap-2">
                <span className="w-4 h-px bg-blue-200"></span> Permissões de Acesso
              </h4>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Nível de Permissão</label>
                  <SearchableSelect
                    value={newUser.role}
                    onChange={val => setNewUser({...newUser, role: val})}
                    options={["editor", "admin"]}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer shadow-sm"
                    placeholder="Selecione..."
                  />
                </div>
                
                <div className="mt-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Acesso às Guias / Módulos</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {ALL_PERMISSIONS.map(p => {
                      const checkMarked = newUser.role === "admin" ? true : newUser.permissions.includes(p.id);
                      return (
                        <label key={p.id} className={`flex items-center gap-2 p-3 rounded-lg border border-slate-100 bg-white shadow-sm transition-colors ${newUser.role === 'admin' ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-50'}`}>
                          <input 
                            type="checkbox" 
                            checked={checkMarked}
                            onChange={() => togglePermission(p.id, false)}
                            disabled={newUser.role === "admin"}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 disabled:opacity-70"
                          />
                          <span className="text-xs text-slate-700 font-medium">{p.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-lg text-xs font-bold uppercase tracking-widest mt-6 hover:bg-slate-800 transition-all shadow-md active:scale-[0.98]">Confirmar Acesso</button>
          </form>
        </Modal>
      )}

      {isAddingPrint && (
        <Modal title="Upload de Impressos / Documentos" onClose={() => setIsAddingPrint(false)}>
          <form onSubmit={uploadPrintFile} className="space-y-6">
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group relative">
              <input 
                type="file" 
                accept=".jpg,.jpeg,.gif,.png,.tiff,.bmp,.pdf"
                onChange={e => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Printer className="text-blue-500" />
                </div>
                <p className="text-sm font-bold text-slate-700">
                  {selectedFile ? selectedFile.name : "Clique ou arraste um arquivo"}
                </p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Limites: PDF, DOCX, Imagens (Máx 10MB)</p>
              </div>
            </div>
            
            {selectedFile && (
              <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-xl border border-blue-100">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                  {selectedFile.name.split('.').pop()}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-bold text-blue-900 truncate">{selectedFile.name}</p>
                  <p className="text-[10px] text-blue-600 font-mono tracking-tighter">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={!selectedFile}
              className="w-full bg-slate-900 text-white py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
            >
              Iniciar Upload para Servidor
            </button>
          </form>
        </Modal>
      )}

      {isAddingProduction && (
        <Modal title="Novo Registro de Produção" onClose={() => setIsAddingProduction(false)} maxWidth="max-w-4xl">
          <form onSubmit={addProduction} className="space-y-6 pb-4">
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 mb-4 flex items-center gap-2">
                <span className="w-4 h-px bg-indigo-200"></span> Dados do Registro
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Data da Atividade</label>
                  <input 
                    type="date"
                    required 
                    value={newProduction.date || ""}
                    onChange={e => setNewProduction({...newProduction, date: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white shadow-sm" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Fiscais Responsáveis</label>
                  <SearchableSelect
                    value={newProduction.officer}
                    onChange={val => setNewProduction({...newProduction, officer: val})}
                    options={officers}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer shadow-sm"
                    placeholder="Selecione os fiscais..."
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 mb-4 flex items-center gap-2">
                <span className="w-4 h-px bg-indigo-200"></span> Atividade e Local
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Atividade Realizada</label>
                  <SearchableSelect
                    value={newProduction.activity}
                    onChange={val => setNewProduction({...newProduction, activity: val})}
                    options={activities}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer shadow-sm"
                    placeholder="Selecione a atividade..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Quantidade</label>
                  <input 
                    type="text"
                    value={newProduction.quantity || ""}
                    onChange={e => setNewProduction({...newProduction, quantity: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white shadow-sm" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Local / Estabelecimento</label>
                  <input 
                    type="text"
                    value={newProduction.location || ""}
                    onChange={e => setNewProduction({...newProduction, location: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white shadow-sm" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Bairro</label>
                  <SearchableSelect
                    value={newProduction.neighborhood || ""}
                    onChange={val => setNewProduction({...newProduction, neighborhood: val})}
                    options={neighborhoods}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer shadow-sm"
                    placeholder="Selecione o bairro..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 mb-4 flex items-center gap-2">
                <span className="w-4 h-px bg-indigo-200"></span> Anexos e Observações
              </h4>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Observações Adicionais</label>
                  <textarea 
                    value={newProduction.observation || ""}
                    onChange={e => setNewProduction({...newProduction, observation: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white min-h-[80px] resize-y shadow-sm" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 flex justify-between items-center">
                    <span>Upload de Arquivos</span>
                    {newProduction.upload && (
                      <span className="flex items-center gap-2">
                         <span className="text-indigo-600 font-mono text-[10px] normal-case bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200" title={newProduction.upload}>
                           {newProduction.upload.length > 20 ? newProduction.upload.substring(14, 30) + '...' : newProduction.upload}
                         </span>
                         <button type="button" onClick={() => setNewProduction({...newProduction, upload: ""})} className="text-red-500 hover:text-red-700 font-bold" title="Remover Arquivo">x</button>
                      </span>
                    )}
                  </label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-white hover:bg-slate-50 transition-colors cursor-pointer group relative">
                    <input 
                      type="file" 
                      accept=".jpg,.jpeg,.gif,.png,.tiff,.bmp,.pdf"
                      onChange={async e => {
                        if (e.target.files && e.target.files[0]) {
                          try {
                            const filename = await handleFileUpload(e.target.files[0]);
                            setNewProduction({...newProduction, upload: filename});
                          } catch (err) {
                            alert("Erro no upload");
                          }
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      title="Selecione arquivos" 
                    />
                    <div className="flex flex-col items-center justify-center gap-3 pointer-events-none">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">Clique ou arraste e solte</p>
                        <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG (Max 10MB)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-lg text-xs font-bold uppercase tracking-widest mt-6 hover:bg-slate-800 transition-all shadow-md active:scale-[0.98]">Protocolar Produção</button>
          </form>
        </Modal>
      )}

      {isEditingProduction && editingProduction && (
        <Modal title="Gestão de Registro de Produção" onClose={() => { setIsEditingProduction(false); setEditingProduction(null); }} maxWidth="max-w-4xl">
          <form onSubmit={updateProduction} className="space-y-6 pb-4">
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 mb-4 flex items-center gap-2">
                <span className="w-4 h-px bg-indigo-200"></span> Dados do Registro
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Data da Atividade</label>
                  <input 
                    type="date"
                    required 
                    value={editingProduction.date || ""}
                    onChange={e => setEditingProduction({...editingProduction, date: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white shadow-sm" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Fiscais Responsáveis</label>
                  <SearchableSelect
                    value={editingProduction.officer || ""}
                    onChange={val => setEditingProduction({...editingProduction, officer: val})}
                    options={officers}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer shadow-sm"
                    placeholder="Selecione os fiscais..."
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 mb-4 flex items-center gap-2">
                <span className="w-4 h-px bg-indigo-200"></span> Atividade e Local
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Atividade Realizada</label>
                  <SearchableSelect
                    value={editingProduction.activity || ""}
                    onChange={val => setEditingProduction({...editingProduction, activity: val})}
                    options={activities}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer shadow-sm"
                    placeholder="Selecione a atividade..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Quantidade</label>
                  <input 
                    type="text"
                    value={editingProduction.quantity || ""}
                    onChange={e => setEditingProduction({...editingProduction, quantity: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white shadow-sm" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Local / Estabelecimento</label>
                  <input 
                    type="text"
                    value={editingProduction.location || ""}
                    onChange={e => setEditingProduction({...editingProduction, location: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white shadow-sm" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Bairro</label>
                  <SearchableSelect
                    value={editingProduction.neighborhood || ""}
                    onChange={val => setEditingProduction({...editingProduction, neighborhood: val})}
                    options={neighborhoods}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer shadow-sm"
                    placeholder="Selecione o bairro..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 mb-4 flex items-center gap-2">
                <span className="w-4 h-px bg-indigo-200"></span> Anexos e Observações
              </h4>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Observações Adicionais</label>
                  <textarea 
                    value={editingProduction.observation || ""}
                    onChange={e => setEditingProduction({...editingProduction, observation: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white min-h-[80px] resize-y shadow-sm" 
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 flex justify-between items-center">
                    <span>Upload de Arquivos</span>
                    {editingProduction.upload && (
                      <span className="flex items-center gap-2">
                         <a href={`/api/uploads/${editingProduction.upload}`} target="_blank" rel="noreferrer" className="text-indigo-600 font-mono text-[10px] normal-case bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 hover:underline" title={editingProduction.upload}>
                           {editingProduction.upload.length > 20 ? editingProduction.upload.substring(14, 30) + '...' : editingProduction.upload}
                         </a>
                         <button type="button" onClick={() => setEditingProduction({...editingProduction, upload: ""})} className="text-red-500 hover:text-red-700 font-bold" title="Remover Arquivo">x</button>
                      </span>
                    )}
                  </label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-white hover:bg-slate-50 transition-colors cursor-pointer group relative">
                    <input 
                      type="file" 
                      accept=".jpg,.jpeg,.gif,.png,.tiff,.bmp,.pdf"
                      onChange={async e => {
                        if (e.target.files && e.target.files[0]) {
                          try {
                            const filename = await handleFileUpload(e.target.files[0]);
                            setEditingProduction({...editingProduction, upload: filename});
                          } catch (err) {
                            alert("Erro no upload");
                          }
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      title="Selecione arquivos" 
                    />
                    <div className="flex flex-col items-center justify-center gap-3 pointer-events-none">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">Clique ou arraste e solte</p>
                        <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG (Max 10MB)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-lg text-xs font-bold uppercase tracking-widest mt-6 hover:bg-slate-800 transition-all shadow-md active:scale-[0.98]">Salvar Alterações</button>
          </form>
        </Modal>
      )}

      {isAddingComplaint && (
        <Modal title="Nova Ocorrência / Reclamação" onClose={() => setIsAddingComplaint(false)} maxWidth="max-w-4xl">
          <form onSubmit={addComplaint} className="space-y-6 pb-4">
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-red-600 mb-4 flex items-center gap-2">
                <span className="w-4 h-px bg-red-200"></span> Dados de Registro
              </h4>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-2">Data de Registro</label>
                <input 
                  type="date"
                  required
                  value={newComplaint.date || new Date().toISOString().split('T')[0]} // added date handle
                  onChange={e => setNewComplaint({...newComplaint, date: e.target.value})}
                  className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none shadow-sm" 
                />
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-red-600 mb-4 flex items-center gap-2">
                <span className="w-4 h-px bg-red-200"></span> Dados do Reclamante
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Nome Completo</label>
                  <input required value={newComplaint.reclamanteName} onChange={e => setNewComplaint({...newComplaint, reclamanteName: e.target.value})} className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-red-500 bg-white shadow-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Contato</label>
                  <input value={newComplaint.reclamanteContact || ""} onChange={e => setNewComplaint({...newComplaint, reclamanteContact: e.target.value})} className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-red-500 bg-white shadow-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Rua / Logradouro</label>
                  <SearchableSelect
                    value={newComplaint.reclamanteStreet || ""}
                    onChange={val => setNewComplaint({...newComplaint, reclamanteStreet: val})}
                    options={streets}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-red-500 bg-white cursor-pointer shadow-sm"
                    placeholder="Selecione a rua..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Número</label>
                  <input value={newComplaint.reclamanteNumber || ""} onChange={e => setNewComplaint({...newComplaint, reclamanteNumber: e.target.value})} className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-red-500 bg-white shadow-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Bloco</label>
                  <input value={newComplaint.reclamanteBlock || ""} onChange={e => setNewComplaint({...newComplaint, reclamanteBlock: e.target.value})} className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-red-500 bg-white shadow-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Quadra</label>
                  <input value={newComplaint.reclamanteQuadra || ""} onChange={e => setNewComplaint({...newComplaint, reclamanteQuadra: e.target.value})} className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-red-500 bg-white shadow-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Bairro</label>
                  <SearchableSelect
                    value={newComplaint.reclamanteNeighborhood || ""}
                    onChange={val => setNewComplaint({...newComplaint, reclamanteNeighborhood: val})}
                    options={neighborhoods}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-red-500 bg-white cursor-pointer shadow-sm"
                    placeholder="Selecione o bairro..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-red-600 mb-4 flex items-center gap-2">
                <span className="w-4 h-px bg-red-200"></span> Dados do Reclamado
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Nome / Apelido</label>
                  <input value={newComplaint.reclamadoName || ""} onChange={e => setNewComplaint({...newComplaint, reclamadoName: e.target.value})} className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-red-500 bg-white shadow-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Rua / Logradouro</label>
                  <SearchableSelect
                    value={newComplaint.reclamadoStreet || ""}
                    onChange={val => setNewComplaint({...newComplaint, reclamadoStreet: val})}
                    options={streets}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-red-500 bg-white cursor-pointer shadow-sm"
                    placeholder="Selecione a rua..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Número</label>
                  <input value={newComplaint.reclamadoNumber || ""} onChange={e => setNewComplaint({...newComplaint, reclamadoNumber: e.target.value})} className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-red-500 bg-white shadow-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Bloco</label>
                  <input value={newComplaint.reclamadoBlock || ""} onChange={e => setNewComplaint({...newComplaint, reclamadoBlock: e.target.value})} className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-red-500 bg-white shadow-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Quadra</label>
                  <input value={newComplaint.reclamadoQuadra || ""} onChange={e => setNewComplaint({...newComplaint, reclamadoQuadra: e.target.value})} className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-red-500 bg-white shadow-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Bairro</label>
                  <SearchableSelect
                    value={newComplaint.reclamadoNeighborhood || ""}
                    onChange={val => setNewComplaint({...newComplaint, reclamadoNeighborhood: val})}
                    options={neighborhoods}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-red-500 bg-white cursor-pointer shadow-sm"
                    placeholder="Selecione o bairro..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-red-600 mb-4 flex items-center gap-2">
                <span className="w-4 h-px bg-red-200"></span> Especificação do Problema
              </h4>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Assunto / Descrição do Fato</label>
                  <textarea 
                    required 
                    value={newComplaint.subject}
                    onChange={e => setNewComplaint({...newComplaint, subject: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none min-h-[100px] bg-white shadow-sm resize-y" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Nível de Prioridade</label>
                  <SearchableSelect
                    value={newComplaint.priority}
                    onChange={val => setNewComplaint({...newComplaint, priority: val})}
                    options={["baixa", "media", "alta"]}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none bg-white cursor-pointer shadow-sm"
                    placeholder="Selecione..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 flex justify-between items-center">
                    <span>Upload de Arquivos</span>
                    {newComplaint.upload && (
                      <span className="flex items-center gap-2">
                         <span className="text-red-600 font-mono text-[10px] normal-case bg-red-50 px-2 py-0.5 rounded border border-red-200" title={newComplaint.upload}>
                           {newComplaint.upload.length > 20 ? newComplaint.upload.substring(14, 30) + '...' : newComplaint.upload}
                         </span>
                         <button type="button" onClick={() => setNewComplaint({...newComplaint, upload: ""})} className="text-red-500 hover:text-red-700 font-bold" title="Remover Arquivo">x</button>
                      </span>
                    )}
                  </label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-white hover:bg-slate-50 transition-colors cursor-pointer group relative">
                    <input 
                      type="file" 
                      accept=".jpg,.jpeg,.gif,.png,.tiff,.bmp,.pdf"
                      onChange={async e => {
                        if (e.target.files && e.target.files[0]) {
                          try {
                            const filename = await handleFileUpload(e.target.files[0]);
                            setNewComplaint({...newComplaint, upload: filename});
                          } catch (err) {
                            alert("Erro no upload");
                          }
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      title="Selecione arquivos" 
                    />
                    <div className="flex flex-col items-center justify-center gap-3 pointer-events-none">
                      <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">Clique ou arraste e solte</p>
                        <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG (Max 10MB)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-lg text-xs font-bold uppercase tracking-widest mt-6 hover:bg-slate-800 transition-all shadow-md active:scale-[0.98]">Registrar Ocorrência</button>
          </form>
        </Modal>
      )}

      {isEditingComplaint && editingComplaint && (
        <Modal title="Gestão de Ocorrência" onClose={() => { setIsEditingComplaint(false); setEditingComplaint(null); }} maxWidth="max-w-4xl">
          <form onSubmit={updateComplaint} className="space-y-6 pb-4">
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-red-600 mb-4 flex items-center gap-2">
                <span className="w-4 h-px bg-red-200"></span> Dados de Registro
              </h4>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-2">Data de Registro</label>
                <input 
                  type="date"
                  required
                  value={editingComplaint.date || ""}
                  onChange={e => setEditingComplaint({...editingComplaint, date: e.target.value})}
                  className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none shadow-sm" 
                />
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-red-600 mb-4 flex items-center gap-2">
                <span className="w-4 h-px bg-red-200"></span> Dados do Reclamante
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Nome Completo</label>
                  <input required value={editingComplaint.reclamanteName} onChange={e => setEditingComplaint({...editingComplaint, reclamanteName: e.target.value})} className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-red-500 bg-white shadow-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Contato</label>
                  <input value={editingComplaint.reclamanteContact || ""} onChange={e => setEditingComplaint({...editingComplaint, reclamanteContact: e.target.value})} className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-red-500 bg-white shadow-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Rua / Logradouro</label>
                  <SearchableSelect
                    value={editingComplaint.reclamanteStreet || ""}
                    onChange={val => setEditingComplaint({...editingComplaint, reclamanteStreet: val})}
                    options={streets}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-red-500 bg-white cursor-pointer shadow-sm"
                    placeholder="Selecione a rua..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Número</label>
                  <input value={editingComplaint.reclamanteNumber || ""} onChange={e => setEditingComplaint({...editingComplaint, reclamanteNumber: e.target.value})} className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-red-500 bg-white shadow-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Bloco</label>
                  <input value={editingComplaint.reclamanteBlock || ""} onChange={e => setEditingComplaint({...editingComplaint, reclamanteBlock: e.target.value})} className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-red-500 bg-white shadow-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Quadra</label>
                  <input value={editingComplaint.reclamanteQuadra || ""} onChange={e => setEditingComplaint({...editingComplaint, reclamanteQuadra: e.target.value})} className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-red-500 bg-white shadow-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Bairro</label>
                  <SearchableSelect
                    value={editingComplaint.reclamanteNeighborhood || ""}
                    onChange={val => setEditingComplaint({...editingComplaint, reclamanteNeighborhood: val})}
                    options={neighborhoods}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-red-500 bg-white cursor-pointer shadow-sm"
                    placeholder="Selecione o bairro..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-red-600 mb-4 flex items-center gap-2">
                <span className="w-4 h-px bg-red-200"></span> Dados do Reclamado
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Nome / Apelido</label>
                  <input value={editingComplaint.reclamadoName || ""} onChange={e => setEditingComplaint({...editingComplaint, reclamadoName: e.target.value})} className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-red-500 bg-white shadow-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Rua / Logradouro</label>
                  <SearchableSelect
                    value={editingComplaint.reclamadoStreet || ""}
                    onChange={val => setEditingComplaint({...editingComplaint, reclamadoStreet: val})}
                    options={streets}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-red-500 bg-white cursor-pointer shadow-sm"
                    placeholder="Selecione a rua..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Número</label>
                  <input value={editingComplaint.reclamadoNumber || ""} onChange={e => setEditingComplaint({...editingComplaint, reclamadoNumber: e.target.value})} className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-red-500 bg-white shadow-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Bloco</label>
                  <input value={editingComplaint.reclamadoBlock || ""} onChange={e => setEditingComplaint({...editingComplaint, reclamadoBlock: e.target.value})} className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-red-500 bg-white shadow-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Quadra</label>
                  <input value={editingComplaint.reclamadoQuadra || ""} onChange={e => setEditingComplaint({...editingComplaint, reclamadoQuadra: e.target.value})} className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-red-500 bg-white shadow-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Bairro</label>
                  <SearchableSelect
                    value={editingComplaint.reclamadoNeighborhood || ""}
                    onChange={val => setEditingComplaint({...editingComplaint, reclamadoNeighborhood: val})}
                    options={neighborhoods}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-red-500 bg-white cursor-pointer shadow-sm"
                    placeholder="Selecione o bairro..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-red-600 mb-4 flex items-center gap-2">
                <span className="w-4 h-px bg-red-200"></span> Especificação do Problema
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Assunto / Descrição do Fato</label>
                  <textarea 
                    required 
                    value={editingComplaint.subject}
                    onChange={e => setEditingComplaint({...editingComplaint, subject: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none min-h-[100px] bg-white shadow-sm resize-y" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Nível de Prioridade</label>
                  <SearchableSelect
                    value={editingComplaint.priority}
                    onChange={val => setEditingComplaint({...editingComplaint, priority: val})}
                    options={["baixa", "media", "alta"]}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none bg-white cursor-pointer shadow-sm"
                    placeholder="Selecione..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Status</label>
                  <SearchableSelect
                    value={editingComplaint.status}
                    onChange={val => setEditingComplaint({...editingComplaint, status: val})}
                    options={["pendente", "em_analise", "resolvido"]}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none bg-white cursor-pointer shadow-sm"
                    placeholder="Selecione..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 flex justify-between items-center">
                    <span>Upload de Arquivos</span>
                    {editingComplaint.upload && (
                      <span className="flex items-center gap-2">
                         <a href={`/api/uploads/${editingComplaint.upload}`} target="_blank" rel="noreferrer" className="text-red-600 font-mono text-[10px] normal-case bg-red-50 px-2 py-0.5 rounded border border-red-200 hover:underline" title={editingComplaint.upload}>
                           {editingComplaint.upload.length > 20 ? editingComplaint.upload.substring(14, 30) + '...' : editingComplaint.upload}
                         </a>
                         <button type="button" onClick={() => setEditingComplaint({...editingComplaint, upload: ""})} className="text-red-500 hover:text-red-700 font-bold" title="Remover Arquivo">x</button>
                      </span>
                    )}
                  </label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-white hover:bg-slate-50 transition-colors cursor-pointer group relative">
                    <input 
                      type="file" 
                      accept=".jpg,.jpeg,.gif,.png,.tiff,.bmp,.pdf"
                      onChange={async e => {
                        if(e.target.files && e.target.files[0]) {
                          try {
                            const filename = await handleFileUpload(e.target.files[0]);
                            setEditingComplaint({...editingComplaint, upload: filename});
                          } catch (err) {
                            alert("Erro no upload");
                          }
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      title="Selecione arquivos" 
                    />
                    <div className="flex flex-col items-center justify-center gap-3 pointer-events-none">
                      <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">Clique ou arraste e solte</p>
                        <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG (Max 10MB)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-lg text-xs font-bold uppercase tracking-widest mt-6 hover:bg-slate-800 transition-all shadow-md active:scale-[0.98]">Atualizar Protocolo</button>
          </form>
        </Modal>
      )}

      {isAddingHealthWallet && (
        <Modal title="Nova Carteira de Saúde" onClose={() => setIsAddingHealthWallet(false)} maxWidth="max-w-4xl">
          <form onSubmit={addHealthWallet} className="space-y-6 pb-4">
            {/* Seção 1: Dados do Portador */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-green-600 mb-4 flex items-center gap-2">
                <span className="w-4 h-px bg-green-200"></span> Dados do Portador
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Nome Completo</label>
                  <input 
                    required 
                    placeholder="Nome do portador..."
                    value={newHealthWallet.patientName}
                    onChange={e => setNewHealthWallet({...newHealthWallet, patientName: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white shadow-sm" 
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">RG</label>
                  <input 
                    placeholder="00.000.000-0"
                    value={newHealthWallet.rg || ""}
                    onChange={e => setNewHealthWallet({...newHealthWallet, rg: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white shadow-sm" 
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Data de Nasc.</label>
                  <input 
                    type="date"
                    value={newHealthWallet.birthDate || ""}
                    onChange={e => setNewHealthWallet({...newHealthWallet, birthDate: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white shadow-sm" 
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Contato</label>
                  <input 
                    placeholder="(00) 00000-0000"
                    value={newHealthWallet.contact}
                    onChange={e => setNewHealthWallet({...newHealthWallet, contact: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white shadow-sm" 
                  />
                </div>
              </div>
            </div>

            {/* Seção 2: Local e Atividade */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-green-600 mb-4 flex items-center gap-2">
                <span className="w-4 h-px bg-green-200"></span> Local e Atividade
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-12">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Categoria</label>
                  <SearchableSelect
                    value={newHealthWallet.category}
                    onChange={val => setNewHealthWallet({...newHealthWallet, category: val})}
                    options={["Alimentação", "Serviços", "Estética", "Saúde"]}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white cursor-pointer shadow-sm"
                    placeholder="Selecione..."
                  />
                </div>

                <div className="md:col-span-8">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Local de Trabalho</label>
                  <input 
                    placeholder="Nome do estabelecimento..."
                    value={newHealthWallet.workplace}
                    onChange={e => setNewHealthWallet({...newHealthWallet, workplace: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white shadow-sm" 
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Função</label>
                  <SearchableSelect
                    value={newHealthWallet.role}
                    onChange={val => setNewHealthWallet({...newHealthWallet, role: val})}
                    options={functions}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white cursor-pointer shadow-sm"
                    placeholder="Selecione a Função..."
                  />
                </div>

                <div className="md:col-span-8">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Rua / Logradouro</label>
                  <SearchableSelect
                    value={newHealthWallet.street}
                    onChange={val => setNewHealthWallet({...newHealthWallet, street: val})}
                    options={streets}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white cursor-pointer shadow-sm"
                    placeholder="Selecione a rua..."
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Bairro</label>
                  <SearchableSelect
                    value={newHealthWallet.neighborhood}
                    onChange={val => setNewHealthWallet({...newHealthWallet, neighborhood: val})}
                    options={neighborhoods}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white cursor-pointer shadow-sm"
                    placeholder="Selecione o bairro..."
                  />
                </div>
              </div>
            </div>

            {/* Seção 3: Datas e Validamentos */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-green-600 mb-4 flex items-center gap-2">
                <span className="w-4 h-px bg-green-200"></span> Datas e Validade
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Data Emissão</label>
                  <input 
                    type="date"
                    value={newHealthWallet.issueDate}
                    onChange={e => setNewHealthWallet({...newHealthWallet, issueDate: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white shadow-sm" 
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Data Exame</label>
                  <input 
                    type="date"
                    value={newHealthWallet.examDate}
                    onChange={e => setNewHealthWallet({...newHealthWallet, examDate: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white shadow-sm" 
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Vencimento</label>
                  <input 
                    required 
                    type="date"
                    value={newHealthWallet.expiration}
                    onChange={e => setNewHealthWallet({...newHealthWallet, expiration: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white shadow-sm" 
                  />
                </div>
              </div>
            </div>

            {/* Seção 4: Outros */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-green-600 mb-4 flex items-center gap-2">
                <span className="w-4 h-px bg-green-200"></span> Outros
              </h4>
              <div className="grid grid-cols-1 gap-4">
                <div className="md:col-span-12">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Observação</label>
                  <textarea 
                    placeholder="Anotações adicionais..."
                    value={newHealthWallet.observation}
                    onChange={e => setNewHealthWallet({...newHealthWallet, observation: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white shadow-sm min-h-[60px]" 
                  />
                </div>

                <div className="md:col-span-12">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 flex justify-between items-center">
                    <span>Upload de Anexo</span>
                    {newHealthWallet.upload && (
                      <span className="flex items-center gap-2">
                         <span className="text-green-600 font-mono text-[10px] normal-case bg-green-50 px-2 py-0.5 rounded border border-green-200" title={newHealthWallet.upload}>
                           {newHealthWallet.upload.length > 20 ? newHealthWallet.upload.substring(14, 30) + '...' : newHealthWallet.upload}
                         </span>
                         <button type="button" onClick={() => setNewHealthWallet({...newHealthWallet, upload: ""})} className="text-red-500 hover:text-red-700 font-bold" title="Remover Arquivo">x</button>
                      </span>
                    )}
                  </label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-white hover:bg-slate-50 transition-colors cursor-pointer group relative">
                    <input 
                      type="file" 
                      accept=".jpg,.jpeg,.gif,.png,.tiff,.bmp,.pdf"
                      onChange={async e => {
                        if (e.target.files && e.target.files[0]) {
                          try {
                            const filename = await handleFileUpload(e.target.files[0]);
                            setNewHealthWallet({...newHealthWallet, upload: filename});
                          } catch (err) {
                            alert("Erro no upload");
                          }
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      title="Selecione arquivos" 
                    />
                    <div className="flex flex-col items-center justify-center gap-3 pointer-events-none">
                      <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">Clique ou arraste e solte</p>
                        <p className="text-xs text-slate-400 mt-1">SVG, PNG, JPG ou PDF (MAX. 5MB)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-lg text-xs font-bold uppercase tracking-widest mt-6 hover:bg-slate-800 transition-all shadow-md active:scale-[0.98]">Emitir Carteira</button>
          </form>
        </Modal>
      )}

      {isEditingHealthWallet && editingHealthWallet && (
        <Modal title="Editar Carteira de Saúde" onClose={() => { setIsEditingHealthWallet(false); setEditingHealthWallet(null); }} maxWidth="max-w-4xl">
          <form onSubmit={updateHealthWallet} className="space-y-6 pb-4">
            {/* Seção 1: Dados do Portador e Status */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-green-600 mb-4 flex items-center gap-2">
                <span className="w-4 h-px bg-green-200"></span> Dados do Portador e Status
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Nome Completo</label>
                  <input 
                    required 
                    placeholder="Nome do portador..."
                    value={editingHealthWallet.patientName}
                    onChange={e => setEditingHealthWallet({...editingHealthWallet, patientName: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white shadow-sm" 
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">RG</label>
                  <input 
                    placeholder="00.000.000-0"
                    value={editingHealthWallet.rg || ""}
                    onChange={e => setEditingHealthWallet({...editingHealthWallet, rg: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white shadow-sm" 
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Data de Nasc.</label>
                  <input 
                    type="date"
                    value={editingHealthWallet.birthDate || ""}
                    onChange={e => setEditingHealthWallet({...editingHealthWallet, birthDate: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white shadow-sm" 
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Contato</label>
                  <input 
                    placeholder="(00) 00000-0000"
                    value={editingHealthWallet.contact || ""}
                    onChange={e => setEditingHealthWallet({...editingHealthWallet, contact: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white shadow-sm" 
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Status da Carteira</label>
                  <SearchableSelect
                    value={editingHealthWallet.status}
                    onChange={val => setEditingHealthWallet({...editingHealthWallet, status: val})}
                    options={["ativo", "vencido", "suspenso"]}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white cursor-pointer shadow-sm"
                    placeholder="Selecione..."
                  />
                </div>
              </div>
            </div>

            {/* Seção 2: Local e Atividade */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-green-600 mb-4 flex items-center gap-2">
                <span className="w-4 h-px bg-green-200"></span> Local e Atividade
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-12">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Categoria</label>
                  <SearchableSelect
                    value={editingHealthWallet.category}
                    onChange={val => setEditingHealthWallet({...editingHealthWallet, category: val})}
                    options={["Alimentação", "Serviços", "Estética", "Saúde"]}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white cursor-pointer shadow-sm"
                    placeholder="Selecione..."
                  />
                </div>

                <div className="md:col-span-8">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Local de Trabalho</label>
                  <input 
                    placeholder="Nome do estabelecimento..."
                    value={editingHealthWallet.workplace || ""}
                    onChange={e => setEditingHealthWallet({...editingHealthWallet, workplace: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white shadow-sm" 
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Função</label>
                  <SearchableSelect
                    value={editingHealthWallet.role || ""}
                    onChange={val => setEditingHealthWallet({...editingHealthWallet, role: val})}
                    options={functions}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white cursor-pointer shadow-sm"
                    placeholder="Selecione a Função..."
                  />
                </div>

                <div className="md:col-span-8">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Rua / Logradouro</label>
                  <SearchableSelect
                    value={editingHealthWallet.street || ""}
                    onChange={val => setEditingHealthWallet({...editingHealthWallet, street: val})}
                    options={streets}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white cursor-pointer shadow-sm"
                    placeholder="Selecione a rua..."
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Bairro</label>
                  <SearchableSelect
                    value={editingHealthWallet.neighborhood || ""}
                    onChange={val => setEditingHealthWallet({...editingHealthWallet, neighborhood: val})}
                    options={neighborhoods}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white cursor-pointer shadow-sm"
                    placeholder="Selecione o bairro..."
                  />
                </div>
              </div>
            </div>

            {/* Seção 3: Datas e Validade */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-green-600 mb-4 flex items-center gap-2">
                <span className="w-4 h-px bg-green-200"></span> Datas e Validade
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Data Emissão</label>
                  <input 
                    type="date"
                    value={editingHealthWallet.issueDate || ""}
                    onChange={e => setEditingHealthWallet({...editingHealthWallet, issueDate: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white shadow-sm" 
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Data Exame</label>
                  <input 
                    type="date"
                    value={editingHealthWallet.examDate || ""}
                    onChange={e => setEditingHealthWallet({...editingHealthWallet, examDate: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white shadow-sm" 
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Vencimento</label>
                  <input 
                    required 
                    type="date"
                    value={editingHealthWallet.expiration}
                    onChange={e => setEditingHealthWallet({...editingHealthWallet, expiration: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white shadow-sm" 
                  />
                </div>
              </div>
            </div>

            {/* Seção 4: Outros */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-green-600 mb-4 flex items-center gap-2">
                <span className="w-4 h-px bg-green-200"></span> Outros
              </h4>
              <div className="grid grid-cols-1 gap-4">
                <div className="md:col-span-12">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Observação</label>
                  <textarea 
                    placeholder="Anotações adicionais..."
                    value={editingHealthWallet.observation || ""}
                    onChange={e => setEditingHealthWallet({...editingHealthWallet, observation: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white shadow-sm min-h-[60px]" 
                  />
                </div>

                <div className="md:col-span-12">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 flex justify-between items-center">
                    <span>Upload de Anexo</span>
                    {editingHealthWallet.upload && (
                      <span className="flex items-center gap-2">
                         <a href={`/api/uploads/${editingHealthWallet.upload}`} target="_blank" rel="noreferrer" className="text-green-600 font-mono text-[10px] normal-case bg-green-50 px-2 py-0.5 rounded border border-green-200 hover:underline" title={editingHealthWallet.upload}>
                           {editingHealthWallet.upload.length > 20 ? editingHealthWallet.upload.substring(14, 30) + '...' : editingHealthWallet.upload}
                         </a>
                         <button type="button" onClick={() => setEditingHealthWallet({...editingHealthWallet, upload: ""})} className="text-red-500 hover:text-red-700 font-bold" title="Remover Arquivo">x</button>
                      </span>
                    )}
                  </label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-white hover:bg-slate-50 transition-colors cursor-pointer group relative">
                    <input 
                      type="file" 
                      accept=".jpg,.jpeg,.gif,.png,.tiff,.bmp,.pdf"
                      onChange={async e => {
                        if (e.target.files && e.target.files[0]) {
                          try {
                            const filename = await handleFileUpload(e.target.files[0]);
                            setEditingHealthWallet({...editingHealthWallet, upload: filename});
                          } catch (err) {
                            alert("Erro no upload");
                          }
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      title="Selecione arquivos" 
                    />
                    <div className="flex flex-col items-center justify-center gap-3 pointer-events-none">
                      <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">Clique ou arraste e solte</p>
                        <p className="text-xs text-slate-400 mt-1">SVG, PNG, JPG ou PDF (MAX. 5MB)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-lg text-xs font-bold uppercase tracking-widest mt-6 hover:bg-slate-800 transition-all shadow-md active:scale-[0.98]">Salvar Alterações</button>
          </form>
        </Modal>
      )}

      {isAddingContributor && (
        <Modal title="Novo Cadastro de Contribuinte" onClose={() => setIsAddingContributor(false)} maxWidth="max-w-4xl">
          <form onSubmit={addContributor} className="space-y-6 pb-4">
            {/* Seção 1: Dados do Estabelecimento */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-4 flex items-center gap-2">
                <span className="w-4 h-px bg-blue-200"></span> Dados do Estabelecimento
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Data Entrada</label>
                  <input 
                    type="date"
                    value={newContributor.entryDate}
                    onChange={e => setNewContributor({...newContributor, entryDate: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Nº do Processo</label>
                  <input 
                    placeholder="0000/2024"
                    value={newContributor.processNumber}
                    onChange={e => setNewContributor({...newContributor, processNumber: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Nome Fantasia</label>
                  <input 
                    placeholder="Nome comercial..."
                    value={newContributor.tradeName}
                    onChange={e => setNewContributor({...newContributor, tradeName: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm" 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Razão Social</label>
                  <input 
                    required 
                    placeholder="Denominação completa..."
                    value={newContributor.razaoSocial}
                    onChange={e => setNewContributor({...newContributor, razaoSocial: e.target.value, name: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">CNPJ</label>
                  <input 
                    placeholder="00.000.000/0000-00"
                    value={newContributor.cnpj}
                    onChange={e => setNewContributor({...newContributor, cnpj: e.target.value, document: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm font-mono" 
                  />
                </div>
              </div>
            </div>

            {/* Seção 2: Atividade e Classificação */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-4 flex items-center gap-2">
                <span className="w-4 h-px bg-blue-200"></span> Atividade e Classificação
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Atividade Principal</label>
                  <input 
                    placeholder="CNAE ou descrição..."
                    value={newContributor.activity}
                    onChange={e => setNewContributor({...newContributor, activity: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Categoria</label>
                  <SearchableSelect
                    value={newContributor.category}
                    onChange={val => setNewContributor({...newContributor, category: val})}
                    options={["A", "B", "C"]}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm cursor-pointer"
                    placeholder="Selecione..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Tipo Cadastro</label>
                    <SearchableSelect
                    value={newContributor.type}
                    onChange={val => setNewContributor({...newContributor, type: val})}
                    options={["PJ", "PF"]}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer shadow-sm"
                    placeholder="Selecione..."
                  />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Status VISA</label>
                    <SearchableSelect
                    value={newContributor.status}
                    onChange={val => setNewContributor({...newContributor, status: val})}
                    options={["regular", "pendente", "irregular"]}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer shadow-sm"
                    placeholder="Selecione..."
                  />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Contato / Tel</label>
                  <input 
                    placeholder="(00) 00000-0000"
                    value={newContributor.contact}
                    onChange={e => setNewContributor({...newContributor, contact: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm" 
                  />
                </div>
              </div>
            </div>

            {/* Seção 3: Responsáveis */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-4 flex items-center gap-2">
                <span className="w-4 h-px bg-blue-200"></span> Responsáveis
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Responsável Legal</label>
                  <input 
                    placeholder="Nome do proprietário..."
                    value={newContributor.responsible}
                    onChange={e => setNewContributor({...newContributor, responsible: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">CPF Responsável</label>
                  <input 
                    placeholder="000.000.000-00"
                    value={newContributor.cpf}
                    onChange={e => setNewContributor({...newContributor, cpf: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Técnico Responsável</label>
                  <input 
                    placeholder="Nome do profissional..."
                    value={newContributor.technicalResponsible}
                    onChange={e => setNewContributor({...newContributor, technicalResponsible: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">CRM / CRO / CRMO</label>
                  <input 
                    placeholder="Nº do conselho..."
                    value={newContributor.technicalCouncil}
                    onChange={e => setNewContributor({...newContributor, technicalCouncil: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm" 
                  />
                </div>
              </div>
            </div>

            {/* Seção 4: Endereço */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-4 flex items-center gap-2">
                <span className="w-4 h-px bg-blue-200"></span> Localização
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Rua / Logradouro</label>
                  <SearchableSelect
                    value={newContributor.street}
                    onChange={val => setNewContributor({...newContributor, street: val})}
                    options={streets}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm cursor-pointer"
                    placeholder="Selecione a rua..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Número</label>
                  <input 
                    placeholder="Ex: 123"
                    value={newContributor.number}
                    onChange={e => setNewContributor({...newContributor, number: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Bloco</label>
                  <input 
                    placeholder="B"
                    value={newContributor.block}
                    onChange={e => setNewContributor({...newContributor, block: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Quadra</label>
                  <input 
                    placeholder="Q"
                    value={newContributor.quadra}
                    onChange={e => setNewContributor({...newContributor, quadra: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm" 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Bairro</label>
                  <SearchableSelect
                    value={newContributor.neighborhood}
                    onChange={val => setNewContributor({...newContributor, neighborhood: val})}
                    options={neighborhoods}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm cursor-pointer"
                    placeholder="Selecione o bairro..."
                  />
                </div>
              </div>
            </div>

            {/* Seção 5: Licenciamento e Fiscalização */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-4 flex items-center gap-2">
                <span className="w-4 h-px bg-blue-200"></span> Licenciamento e Fiscalização
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Fiscais Responsáveis</label>
                  <SearchableMultiSelect
                    value={newContributor.responsibleOfficers}
                    onChange={val => setNewContributor({...newContributor, responsibleOfficers: val})}
                    options={officers}
                    maxSelections={10}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm cursor-pointer"
                    placeholder="Selecione até 10 fiscais..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Ano Anterior</label>
                  <select 
                    value={newContributor.previousYear}
                    onChange={e => setNewContributor({...newContributor, previousYear: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm cursor-pointer"
                  >
                    <option value="" disabled>Selecione uma opção</option>
                    {years.map((year, index) => (
                      <option key={index} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Emissão DAM</label>
                  <input 
                    type="date"
                    value={newContributor.damIssuance}
                    onChange={e => setNewContributor({...newContributor, damIssuance: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Valor DAM</label>
                  <input 
                    placeholder="R$ 0,00"
                    value={newContributor.damValue}
                    onChange={e => setNewContributor({...newContributor, damValue: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Nº da Licença</label>
                  <input 
                    placeholder="L-0000/2024"
                    value={newContributor.licenseNumber}
                    onChange={e => setNewContributor({...newContributor, licenseNumber: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Emissão Licença</label>
                  <input 
                    type="date"
                    value={newContributor.licenseIssuance}
                    onChange={e => setNewContributor({...newContributor, licenseIssuance: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Validade da Licença</label>
                  <input 
                    type="date"
                    value={newContributor.licenseValidity}
                    onChange={e => setNewContributor({...newContributor, licenseValidity: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm" 
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Observação</label>
                  <textarea 
                    placeholder="Notas adicionais..."
                    value={newContributor.observation}
                    onChange={e => setNewContributor({...newContributor, observation: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm h-20 resize-none" 
                  />
                </div>
              </div>
            </div>

            {/* Seção 6: Anexos */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-px bg-blue-200"></span> Upload de Arquivos
                </div>
                {newContributor.upload && (
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600 font-mono text-[10px] normal-case bg-blue-50 px-2 py-0.5 rounded border border-blue-200" title={newContributor.upload}>
                      {newContributor.upload.length > 20 ? newContributor.upload.substring(14, 30) + '...' : newContributor.upload}
                    </span>
                    <button type="button" onClick={() => setNewContributor({...newContributor, upload: ""})} className="text-red-500 hover:text-red-700 font-bold" title="Remover Arquivo">x</button>
                  </div>
                )}
              </h4>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-white hover:bg-slate-50 transition-colors cursor-pointer group relative">
                <input 
                  type="file" 
                  accept=".jpg,.jpeg,.gif,.png,.tiff,.bmp,.pdf"
                  onChange={async e => {
                    if (e.target.files && e.target.files[0]) {
                      try {
                        const filename = await handleFileUpload(e.target.files[0]);
                        setNewContributor({...newContributor, upload: filename});
                      } catch (err) {
                        alert("Erro no upload");
                      }
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  title="Selecione arquivos" 
                />
                <div className="flex flex-col items-center justify-center gap-3 pointer-events-none">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Clique ou arraste e solte</p>
                    <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG (Max 10MB)</p>
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl active:scale-[0.99]">Finalizar Cadastro de Contribuinte</button>
          </form>
        </Modal>
      )}

      {isEditingContributor && editingContributor && (
        <Modal title="Editar cadastro de Contribuinte" onClose={() => { setIsEditingContributor(false); setEditingContributor(null); }} maxWidth="max-w-4xl">
          <form onSubmit={updateContributor} className="space-y-6 pb-4">
            {/* Seção 1: Dados do Estabelecimento */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-4 flex items-center gap-2">
                <span className="w-4 h-px bg-blue-200"></span> Dados do Estabelecimento
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Data Entrada</label>
                  <input 
                    type="date"
                    value={editingContributor.entryDate}
                    onChange={e => setEditingContributor({...editingContributor, entryDate: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Nº do Processo</label>
                  <input 
                    placeholder="0000/2024"
                    value={editingContributor.processNumber}
                    onChange={e => setEditingContributor({...editingContributor, processNumber: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Nome Fantasia</label>
                  <input 
                    placeholder="Nome comercial..."
                    value={editingContributor.tradeName}
                    onChange={e => setEditingContributor({...editingContributor, tradeName: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm" 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Razão Social</label>
                  <input 
                    required 
                    placeholder="Denominação completa..."
                    value={editingContributor.razaoSocial}
                    onChange={e => setEditingContributor({...editingContributor, razaoSocial: e.target.value, name: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">CNPJ</label>
                  <input 
                    placeholder="00.000.000/0000-00"
                    value={editingContributor.cnpj}
                    onChange={e => setEditingContributor({...editingContributor, cnpj: e.target.value, document: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm font-mono" 
                  />
                </div>
              </div>
            </div>

            {/* Seção 2: Atividade e Classificação */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-4 flex items-center gap-2">
                <span className="w-4 h-px bg-blue-200"></span> Atividade e Classificação
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Atividade Principal</label>
                  <input 
                    placeholder="CNAE ou descrição..."
                    value={editingContributor.activity}
                    onChange={e => setEditingContributor({...editingContributor, activity: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Categoria</label>
                  <SearchableSelect
                    value={editingContributor.category}
                    onChange={val => setEditingContributor({...editingContributor, category: val})}
                    options={["A", "B", "C"]}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm cursor-pointer"
                    placeholder="Selecione..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Tipo Cadastro</label>
                    <SearchableSelect
                    value={editingContributor.type}
                    onChange={val => setEditingContributor({...editingContributor, type: val})}
                    options={["PJ", "PF"]}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer shadow-sm"
                    placeholder="Selecione..."
                  />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Status VISA</label>
                    <SearchableSelect
                    value={editingContributor.status}
                    onChange={val => setEditingContributor({...editingContributor, status: val})}
                    options={["regular", "pendente", "irregular"]}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer shadow-sm"
                    placeholder="Selecione..."
                  />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Contato / Tel</label>
                  <input 
                    placeholder="(00) 00000-0000"
                    value={editingContributor.contact}
                    onChange={e => setEditingContributor({...editingContributor, contact: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm" 
                  />
                </div>
              </div>
            </div>

            {/* Seção 3: Responsáveis */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-4 flex items-center gap-2">
                <span className="w-4 h-px bg-blue-200"></span> Responsáveis
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Responsável Legal</label>
                  <input 
                    placeholder="Nome do proprietário..."
                    value={editingContributor.responsible}
                    onChange={e => setEditingContributor({...editingContributor, responsible: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">CPF Responsável</label>
                  <input 
                    placeholder="000.000.000-00"
                    value={editingContributor.cpf}
                    onChange={e => setEditingContributor({...editingContributor, cpf: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Técnico Responsável</label>
                  <input 
                    placeholder="Nome do profissional..."
                    value={editingContributor.technicalResponsible}
                    onChange={e => setEditingContributor({...editingContributor, technicalResponsible: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">CRM / CRO / CRMO</label>
                  <input 
                    placeholder="Nº do conselho..."
                    value={editingContributor.technicalCouncil}
                    onChange={e => setEditingContributor({...editingContributor, technicalCouncil: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm" 
                  />
                </div>
              </div>
            </div>

            {/* Seção 4: Endereço */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-4 flex items-center gap-2">
                <span className="w-4 h-px bg-blue-200"></span> Localização
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Rua / Logradouro</label>
                  <SearchableSelect
                    value={editingContributor.street}
                    onChange={val => setEditingContributor({...editingContributor, street: val})}
                    options={streets}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm cursor-pointer"
                    placeholder="Selecione a rua..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Número</label>
                  <input 
                    placeholder="Ex: 123"
                    value={editingContributor.number}
                    onChange={e => setEditingContributor({...editingContributor, number: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Bloco</label>
                  <input 
                    placeholder="B"
                    value={editingContributor.block}
                    onChange={e => setEditingContributor({...editingContributor, block: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Quadra</label>
                  <input 
                    placeholder="Q"
                    value={editingContributor.quadra}
                    onChange={e => setEditingContributor({...editingContributor, quadra: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm" 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Bairro</label>
                  <SearchableSelect
                    value={editingContributor.neighborhood}
                    onChange={val => setEditingContributor({...editingContributor, neighborhood: val})}
                    options={neighborhoods}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm cursor-pointer"
                    placeholder="Selecione o bairro..."
                  />
                </div>
              </div>
            </div>

            {/* Seção 5: Licenciamento e Fiscalização */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-4 flex items-center gap-2">
                <span className="w-4 h-px bg-blue-200"></span> Licenciamento e Fiscalização
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Fiscais Responsáveis</label>
                  <SearchableMultiSelect
                    value={editingContributor.responsibleOfficers}
                    onChange={val => setEditingContributor({...editingContributor, responsibleOfficers: val})}
                    options={officers}
                    maxSelections={10}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm cursor-pointer"
                    placeholder="Selecione até 10 fiscais..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Ano Anterior</label>
                  <select 
                    value={editingContributor.previousYear}
                    onChange={e => setEditingContributor({...editingContributor, previousYear: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm cursor-pointer"
                  >
                    <option value="" disabled>Ano...</option>
                    {years.map((year, index) => (
                      <option key={index} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Emissão DAM</label>
                  <input 
                    type="date"
                    value={editingContributor.damIssuance}
                    onChange={e => setEditingContributor({...editingContributor, damIssuance: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Valor DAM</label>
                  <input 
                    placeholder="R$ 0,00"
                    value={editingContributor.damValue}
                    onChange={e => setEditingContributor({...editingContributor, damValue: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Nº da Licença</label>
                  <input 
                    placeholder="L-0000/2024"
                    value={editingContributor.licenseNumber}
                    onChange={e => setEditingContributor({...editingContributor, licenseNumber: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Emissão Licença</label>
                  <input 
                    type="date"
                    value={editingContributor.licenseIssuance}
                    onChange={e => setEditingContributor({...editingContributor, licenseIssuance: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Validade da Licença</label>
                  <input 
                    type="date"
                    value={editingContributor.licenseValidity}
                    onChange={e => setEditingContributor({...editingContributor, licenseValidity: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm" 
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Observação</label>
                  <textarea 
                    placeholder="Notas adicionais..."
                    value={editingContributor.observation}
                    onChange={e => setEditingContributor({...editingContributor, observation: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm h-20 resize-none" 
                  />
                </div>
              </div>
            </div>

            {/* Seção 6: Anexos */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-px bg-blue-200"></span> Upload de Arquivos
                </div>
                {editingContributor.upload && (
                  <div className="flex items-center gap-2">
                    <a href={`/api/uploads/${editingContributor.upload}`} target="_blank" rel="noreferrer" className="text-blue-600 font-mono text-[10px] normal-case bg-blue-50 px-2 py-0.5 rounded border border-blue-200 hover:underline" title={editingContributor.upload}>
                      {editingContributor.upload.length > 20 ? editingContributor.upload.substring(14, 30) + '...' : editingContributor.upload}
                    </a>
                    <button type="button" onClick={() => setEditingContributor({...editingContributor, upload: ""})} className="text-red-500 hover:text-red-700 font-bold" title="Remover Arquivo">x</button>
                  </div>
                )}
              </h4>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-white hover:bg-slate-50 transition-colors cursor-pointer group relative">
                <input 
                  type="file" 
                  accept=".jpg,.jpeg,.gif,.png,.tiff,.bmp,.pdf"
                  onChange={async e => {
                    if (e.target.files && e.target.files[0]) {
                      try {
                        const filename = await handleFileUpload(e.target.files[0]);
                        setEditingContributor({...editingContributor, upload: filename});
                      } catch (err) {
                        alert("Erro no upload");
                      }
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  title="Selecione arquivos" 
                />
                <div className="flex flex-col items-center justify-center gap-3 pointer-events-none">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Clique ou arraste e solte</p>
                    <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG (Max 10MB)</p>
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl hover:shadow-2xl active:scale-[0.99]">Salvar Alterações do Contribuinte</button>
          </form>
        </Modal>
      )}

      {isEditingUser && editingUser && (
        <Modal title="Editar Registro de Acesso" onClose={() => { setIsEditingUser(false); setIsSelfEditing(false); setEditingUser(null); }}>
          <form onSubmit={updateUser} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Identificação Nominal</label>
              <input 
                required 
                placeholder="Nome do colaborador..."
                value={editingUser.name}
                onChange={e => setEditingUser({...editingUser, name: e.target.value})}
                className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-inner bg-slate-50" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">E-mail Corporativo</label>
              <input 
                required 
                type="email" 
                placeholder="usuario@empresa.com"
                value={editingUser.email}
                onChange={e => setEditingUser({...editingUser, email: e.target.value})}
                className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-inner bg-slate-50" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Senha de Acesso</label>
              <input 
                type="password"
                placeholder="Alterar senha (deixe vazio para manter)"
                value={editingUser.password || ""}
                onChange={e => setEditingUser({...editingUser, password: e.target.value})}
                className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-inner bg-slate-50" 
              />
            </div>
            {!isSelfEditing && (
              <>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Nível de Permissão</label>
                  <SearchableSelect
                    value={editingUser.role}
                    onChange={val => setEditingUser({...editingUser, role: val})}
                    options={["editor", "admin"]}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 cursor-pointer shadow-inner"
                    placeholder="Selecione..."
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Gerenciar Permissões de Módulo</label>
                  <div className="grid grid-cols-2 gap-3">
                    {ALL_PERMISSIONS.map(p => {
                      const checkMarked = editingUser.role === "admin" ? true : editingUser.permissions.includes(p.id);
                      return (
                        <label key={p.id} className={`flex items-center gap-2 p-2 rounded-lg border border-slate-100 bg-slate-50 transition-colors ${editingUser.role === 'admin' ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-white'}`}>
                          <input 
                            type="checkbox" 
                            checked={checkMarked}
                            onChange={() => togglePermission(p.id, true)}
                            disabled={editingUser.role === "admin"}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-slate-300"
                          />
                          <span className="text-xs font-medium text-slate-600">{p.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-lg text-xs font-bold uppercase tracking-widest mt-6 hover:bg-slate-800 transition-all shadow-md active:scale-[0.98]">Salvar Alterações</button>
          </form>
        </Modal>
      )}

      {isAddingForm && (
        <Modal title="Configuração de Novo Formulário" onClose={() => setIsAddingForm(false)}>
          <form onSubmit={addForm} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Título do Documento</label>
              <input 
                required 
                placeholder="Ex: Pesquisa de Q2..."
                value={newForm.title}
                onChange={e => setNewForm({...newForm, title: e.target.value})}
                className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-inner bg-slate-50" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Contexto / Descrição</label>
              <textarea 
                required 
                placeholder="Descreva a finalidade..."
                value={newForm.description}
                onChange={e => setNewForm({...newForm, description: e.target.value})}
                className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-24 shadow-inner bg-slate-50 resize-none" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 flex justify-between items-center">
                <span>Upload de Arquivos</span>
                {newForm.upload && (
                  <span className="flex items-center gap-2">
                     <span className="text-blue-600 font-mono text-[10px] normal-case bg-blue-50 px-2 py-0.5 rounded border border-blue-200" title={newForm.upload}>
                       {newForm.upload.length > 20 ? newForm.upload.substring(14, 30) + '...' : newForm.upload}
                     </span>
                     <button type="button" onClick={() => setNewForm({...newForm, upload: ""})} className="text-red-500 hover:text-red-700 font-bold" title="Remover Arquivo">x</button>
                  </span>
                )}
              </label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-white hover:bg-slate-50 transition-colors cursor-pointer group relative">
                <input 
                  type="file" 
                  accept=".jpg,.jpeg,.gif,.png,.tiff,.bmp,.pdf"
                  onChange={async e => {
                    if (e.target.files && e.target.files[0]) {
                      try {
                        const filename = await handleFileUpload(e.target.files[0]);
                        setNewForm({...newForm, upload: filename});
                      } catch (err) {
                        alert("Erro no upload");
                      }
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  title="Selecione arquivos" 
                />
                <div className="flex flex-col items-center justify-center gap-3 pointer-events-none">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Clique ou arraste e solte</p>
                    <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG (Max 10MB)</p>
                  </div>
                </div>
              </div>
            </div>
            <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-lg text-xs font-bold uppercase tracking-widest mt-6 hover:bg-slate-800 transition-all shadow-md active:scale-[0.98]">Gerar Formulário</button>
          </form>
        </Modal>
      )}

      {deleteConfirmation && (
        <Modal hideHeader onClose={() => setDeleteConfirmation(null)} maxWidth="max-w-xs">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Deseja Excluir?</h3>
            <div className="flex gap-3 w-full pt-2">
              <button 
                onClick={() => setDeleteConfirmation(null)}
                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors"
              >
                Não
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-colors shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Sim
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function SidebarLink({ icon, label, active, onClick, color }: { icon: ReactNode, label: string, active?: boolean, onClick?: () => void, color?: string }) {
  return (
    <button 
      onClick={() => {
        if (onClick) onClick();
        const event = new CustomEvent('close-mobile-menu');
        window.dispatchEvent(event);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all group ${
        active 
          ? "bg-blue-600 text-white shadow-sm" 
          : `${color || "text-slate-400 hover:text-white hover:bg-slate-800"}`
      }`}
    >
      <span className={active ? "" : "group-hover:text-blue-400 transition-colors"}>{icon}</span>
      {label}
      {active && <div className="w-1.5 h-1.5 rounded-full bg-white ml-auto shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>}
    </button>
  );
}

function StatCard({ label, value, icon, change, changeColor }: { label: string, value: string, icon: ReactNode, change?: string, changeColor?: string }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1 group hover:border-blue-300 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{label}</p>
        <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">{icon}</div>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-slate-800 font-mono tracking-tighter">{value}</span>
        {change && <span className={`text-[10px] font-bold mb-1 uppercase tracking-tighter ${changeColor}`}>{change}</span>}
      </div>
    </div>
  );
}

function Modal({ title, onClose, children, maxWidth = "max-w-md", hideHeader = false }: { title?: string, onClose: () => void, children: ReactNode, maxWidth?: string, hideHeader?: boolean }) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={`bg-white w-full ${maxWidth} rounded-2xl shadow-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col`}
      >
        {!hideHeader && (
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 backdrop-blur-sm shrink-0">
            <h3 className="font-bold text-slate-800 uppercase tracking-tighter text-sm flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              {title}
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors">×</button>
          </div>
        )}
        <div className="p-6 overflow-y-auto w-full max-h-full">
          {children}
        </div>
      </motion.div>
    </div>
  );
}


