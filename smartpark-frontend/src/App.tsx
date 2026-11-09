import { useState, useEffect } from 'react'
import {
  LayoutDashboard, MapPinned, CarFront, ReceiptText, Search, Bell,
  Plus, ArrowDownToLine, ArrowUpFromLine, MoreHorizontal, ParkingCircle,
  CircleCheck, Clock3, Menu, X, Activity, TrendingUp
} from 'lucide-react'
import axios from 'axios'

type Page = 'Dashboard' | 'Area Parkir' | 'Kendaraan' | 'Transaksi'
type Area = { id: number; name: string; location: string; capacity: number }
type Vehicle = { id: number; plate: string; type: string }
type Transaction = {
  id: number; vehicleId: number; areaId: number;
  plate: string; type: string; area: string;
  entry: string; exit?: string; fee: number; status: 'Parkir' | 'Selesai'
}

const API_BASE = 'http://localhost:3000/api'

const money = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

const formatDate = (value?: string | null) => {
  if (!value) return '—'
  const d = new Date(value)
  if (isNaN(d.getTime())) return String(value)
  return d.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const isToday = (value?: string) => {
  if (!value) return false
  const d = new Date(value)
  if (isNaN(d.getTime())) return false
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
}

export default function App() {
  const [page, setPage] = useState<Page>('Dashboard')
  const [areas, setAreas] = useState<Area[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<'area' | 'vehicle' | 'entry' | null>(null)
  const [mobileNav, setMobileNav] = useState(false)
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [loadError, setLoadError] = useState('')

  const showNotice = (message: string) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2600)
  }

  const loadData = async (showLoading = false) => {
    if (showLoading) setLoading(true)
    setLoadError('')
    try {
      const [areaRes, vehicleRes, trxRes] = await Promise.all([
        axios.get(`${API_BASE}/area-parkir`),
        axios.get(`${API_BASE}/kendaraan`),
        axios.get(`${API_BASE}/transaksi-parkir`),
      ])

      console.log('Areas:', areaRes.data)
      console.log('Vehicles:', vehicleRes.data)
      console.log('Transactions:', trxRes.data)

      const newAreas: Area[] = (areaRes.data.data || []).map((item: any) => ({
        id: Number(item.id_area),
        name: item.nama_area,
        location: item.lokasi,
        capacity: Number(item.kapasitas) || 0,
      }))

      const newVehicles: Vehicle[] = (vehicleRes.data.data || []).map((item: any) => ({
        id: Number(item.id_kendaraan),
        plate: item.nomor_plat,
        type: item.jenis_kendaraan,
      }))

      const newTrx: Transaction[] = (trxRes.data.data || []).map((item: any) => {
        const v = newVehicles.find(x => x.id === Number(item.id_kendaraan))
        const a = newAreas.find(x => x.id === Number(item.id_area))
        const exit = item.waktu_keluar || undefined
        return {
          id: Number(item.id_transaksi),
          vehicleId: Number(item.id_kendaraan),
          areaId: Number(item.id_area),
          plate: item.nomor_plat || v?.plate || '-',
          type: item.jenis_kendaraan || v?.type || '-',
          area: item.nama_area || a?.name || '-',
          entry: item.waktu_masuk,
          exit,
          fee: Number(item.biaya_parkir) || 0,
          status: exit ? 'Selesai' : 'Parkir',
        }
      }).sort((x, y) => {
        const tx = new Date(x.entry).getTime() || 0
        const ty = new Date(y.entry).getTime() || 0
        return ty - tx
      })

      setAreas(newAreas)
      setVehicles(newVehicles)
      setTransactions(newTrx)
    } catch (err) {
      console.error(err)
      setLoadError(`Gagal memuat data dari server. Pastikan backend berjalan di ${API_BASE}.`)
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  useEffect(() => {
    loadData(true)
  }, [])

  const activeCount = transactions.filter(t => t.status === 'Parkir').length
  const capacity = areas.reduce((sum, a) => sum + a.capacity, 0)
  const revenue = transactions
    .filter(t => t.status === 'Selesai' && isToday(t.exit))
    .reduce((sum, t) => sum + t.fee, 0)
  const available = Math.max(capacity - activeCount, 0)
  const filteredTransactions = transactions.filter(t =>
    `${t.plate} ${t.area} ${t.status}`.toLowerCase().includes(search.toLowerCase())
  )
  const filteredVehicles = vehicles.filter(v =>
    `${v.plate} ${v.type}`.toLowerCase().includes(search.toLowerCase())
  )

  const navItems: { label: Page; icon: typeof LayoutDashboard }[] = [
    { label: 'Dashboard', icon: LayoutDashboard },
    { label: 'Area Parkir', icon: MapPinned },
    { label: 'Kendaraan', icon: CarFront },
    { label: 'Transaksi', icon: ReceiptText },
  ]

  const handleExit = async (transaction: Transaction) => {
    const startMs = new Date(transaction.entry).getTime()
    const durationHours = isNaN(startMs) ? 1 : Math.max(1, Math.ceil((Date.now() - startMs) / 3600000))
    const isMobil = (transaction.type || '').toLowerCase() === 'mobil'
    const fee = isMobil
      ? 5000 + Math.max(0, durationHours - 1) * 3000
      : 2000 + Math.max(0, durationHours - 1) * 1000
    try {
      await axios.put(`${API_BASE}/transaksi-parkir/${transaction.id}/keluar`, { biaya_parkir: fee })
      showNotice(`Kendaraan ${transaction.plate} berhasil keluar. Biaya ${money(fee)}.`)
      await loadData()
    } catch (err) {
      console.error(err)
      showNotice('Gagal memproses kendaraan keluar.')
    }
  }

  const addArea = async (form: HTMLFormElement) => {
    const data = new FormData(form)
    try {
      await axios.post(`${API_BASE}/area-parkir`, {
        nama_area: String(data.get('name')),
        kapasitas: Number(data.get('capacity')),
        lokasi: String(data.get('location')),
      })
      setModal(null)
      showNotice('Area parkir berhasil ditambahkan.')
      await loadData()
    } catch (err) {
      console.error(err)
      showNotice('Gagal menambahkan area parkir.')
    }
  }

  const addVehicle = async (form: HTMLFormElement) => {
    const data = new FormData(form)
    try {
      await axios.post(`${API_BASE}/kendaraan`, {
        nomor_plat: String(data.get('plate')).toUpperCase(),
        jenis_kendaraan: String(data.get('type')),
      })
      setModal(null)
      showNotice('Data kendaraan berhasil ditambahkan.')
      await loadData()
    } catch (err) {
      console.error(err)
      showNotice('Gagal menambahkan kendaraan.')
    }
  }

  const addEntry = async (form: HTMLFormElement) => {
    const data = new FormData(form)
    const vehicleId = Number(data.get('vehicleId'))
    const areaId = Number(data.get('areaId'))
    if (!vehicleId || !areaId) {
      showNotice('Pilih kendaraan dan area parkir terlebih dahulu.')
      return
    }
    if (transactions.some(t => t.vehicleId === vehicleId && t.status === 'Parkir')) {
      showNotice('Kendaraan masih tercatat berada di area parkir.')
      return
    }
    try {
      await axios.post(`${API_BASE}/transaksi-parkir`, {
        id_kendaraan: vehicleId,
        id_area: areaId,
        biaya_parkir: 0,
      })
      setModal(null)
      showNotice('Kendaraan masuk berhasil dicatat.')
      await loadData()
    } catch (err) {
      console.error(err)
      showNotice('Gagal mencatat kendaraan masuk.')
    }
  }

  return (
    <div className="app-shell">
      {mobileNav && <div className="mobile-overlay" onClick={() => setMobileNav(false)} />}
      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-icon"><ParkingCircle size={25} /></div>
          <div><strong>SmartPark</strong><span>MANAGEMENT SYSTEM</span></div>
          <button className="close-nav" onClick={() => setMobileNav(false)}><X size={19}/></button>
        </div>
        <div className="workspace-label">MENU UTAMA</div>
        <nav>
          {navItems.map(item => {
            const Icon = item.icon
            return (
              <button
                key={item.label}
                className={`nav-item ${page === item.label ? 'active' : ''}`}
                onClick={() => { setPage(item.label); setSearch(''); setMobileNav(false) }}
              >
                <Icon size={19}/><span>{item.label}</span>
                {page === item.label && <span className="active-dot"/>}
              </button>
            )
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon"><Activity size={18}/></div>
            <strong>Parkir lebih teratur</strong>
            <p>Pantau aktivitas parkir dalam satu dashboard.</p>
          </div>
          <div className="profile">
            <div className="avatar">AD</div>
            <div><strong>Admin SmartPark</strong><span>Administrator</span></div>
            <MoreHorizontal size={19}/>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileNav(true)}><Menu size={21}/></button>
          <div className="breadcrumb">Workspace <span>/</span> <strong>{page}</strong></div>
          <div className="top-actions">
            <div className="date-pill">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <button className="icon-button" aria-label="Notifikasi"><Bell size={19}/><i/></button>
            <div className="top-avatar">AD</div>
          </div>
        </header>

        <div className="content">
          {loadError && (
            <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#b91c1c', marginBottom: '16px', fontSize: '14px' }}>
              {loadError}{' '}
              <button className="text-button" style={{ marginLeft: '8px' }} onClick={() => loadData(true)}>Coba lagi</button>
            </div>
          )}
          {loading && (
            <div style={{ padding: '10px 16px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', color: '#1d4ed8', marginBottom: '16px', fontSize: '14px' }}>
              Memuat data dari server...
            </div>
          )}

          <div className="page-heading">
            <div>
              <div className="eyebrow">PARKING MANAGEMENT</div>
              <h1>{page === 'Dashboard' ? 'Dashboard' : page}</h1>
              <p>
                {page === 'Dashboard'
                  ? 'Pantau kondisi dan aktivitas parkir hari ini.'
                  : page === 'Area Parkir'
                    ? 'Kelola area dan kapasitas parkir gedung.'
                    : page === 'Kendaraan'
                      ? 'Kelola data kendaraan yang terdaftar.'
                      : 'Pantau kendaraan masuk, keluar, dan pembayaran.'}
              </p>
            </div>
            <div className="heading-actions">
              {page === 'Transaksi' && (
                <button className="btn btn-primary" onClick={() => setModal('entry')}>
                  <Plus size={17}/> Kendaraan Masuk
                </button>
              )}
              {page === 'Area Parkir' && (
                <button className="btn btn-primary" onClick={() => setModal('area')}>
                  <Plus size={17}/> Tambah Area
                </button>
              )}
              {page === 'Kendaraan' && (
                <button className="btn btn-primary" onClick={() => setModal('vehicle')}>
                  <Plus size={17}/> Tambah Kendaraan
                </button>
              )}
            </div>
          </div>

          {page === 'Dashboard' && <>
            <div className="welcome-banner">
              <div>
                <div className="banner-tag">RINGKASAN HARI INI</div>
                <h2>Selamat datang di SmartPark</h2>
                <p>Semua aktivitas parkir dapat dipantau dari satu tempat.</p>
              </div>
              <div className="banner-art">
                <div className="art-circle"><CarFront size={48}/></div>
                <div className="art-line"/>
              </div>
            </div>
            <div className="stats-grid">
              <Stat title="Total Kapasitas" value={capacity.toString()} unit="slot parkir" icon={<MapPinned/>} tone="blue" trend="Seluruh area parkir"/>
              <Stat title="Kendaraan Parkir" value={activeCount.toString()} unit="kendaraan aktif" icon={<CarFront/>} tone="orange" trend="Sedang berada di area"/>
              <Stat title="Slot Tersedia" value={available.toString()} unit="slot tersedia" icon={<CircleCheck/>} tone="green" trend="Dari total kapasitas"/>
              <Stat title="Pendapatan Hari Ini" value={money(revenue)} unit="transaksi selesai" icon={<TrendingUp/>} tone="purple"/>
            </div>
            <div className="section-grid">
              <section className="panel area-panel">
                <div className="panel-heading">
                  <div><h3>Kondisi Area Parkir</h3><p>Penggunaan kapasitas setiap area</p></div>
                  <button className="text-button" onClick={() => setPage('Area Parkir')}>Lihat semua</button>
                </div>
                <div className="area-list">
                  {areas.map((a, i) => {
                    const used = transactions.filter(t => t.areaId === a.id && t.status === 'Parkir').length
                    const pct = Math.min(100, Math.round((used / (a.capacity || 1)) * 100))
                    return (
                      <div className="area-row" key={a.id}>
                        <div className={`area-symbol color-${i % 3}`}><MapPinned size={18}/></div>
                        <div className="area-info">
                          <div className="area-title"><strong>{a.name}</strong><span>{used}/{a.capacity} slot</span></div>
                          <small>{a.location}</small>
                          <div className="progress"><span style={{ width: `${pct}%` }}/></div>
                        </div>
                        <b className="percent">{pct}%</b>
                      </div>
                    )
                  })}
                  {areas.length === 0 && <p className="muted" style={{ padding: '12px 0' }}>Belum ada area parkir.</p>}
                </div>
              </section>
              <section className="panel quick-panel">
                <div className="panel-heading">
                  <div><h3>Aksi Cepat</h3><p>Pilih aktivitas yang ingin dilakukan</p></div>
                </div>
                <button className="quick-action" onClick={() => setModal('entry')}>
                  <div className="quick-icon in"><ArrowDownToLine size={20}/></div>
                  <div><strong>Catat Kendaraan Masuk</strong><span>Input kendaraan yang memasuki area</span></div>
                  <Plus size={17}/>
                </button>
                <button className="quick-action" onClick={() => setPage('Transaksi')}>
                  <div className="quick-icon out"><ArrowUpFromLine size={20}/></div>
                  <div><strong>Proses Kendaraan Keluar</strong><span>Lihat transaksi yang masih aktif</span></div>
                  <Plus size={17}/>
                </button>
                <button className="quick-action" onClick={() => setPage('Kendaraan')}>
                  <div className="quick-icon vehicle"><CarFront size={20}/></div>
                  <div><strong>Data Kendaraan</strong><span>Kelola kendaraan terdaftar</span></div>
                  <Plus size={17}/>
                </button>
              </section>
            </div>
            <section className="panel table-panel">
              <div className="panel-heading">
                <div><h3>Aktivitas Transaksi Terbaru</h3><p>Daftar aktivitas kendaraan terbaru</p></div>
                <button className="text-button" onClick={() => setPage('Transaksi')}>Lihat semua transaksi</button>
              </div>
              <TransactionTable rows={transactions.slice(0, 4)} onExit={handleExit}/>
            </section>
          </>}

          {page === 'Area Parkir' && (
            <section className="panel table-panel">
              <div className="toolbar">
                <div className="search-box">
                  <Search size={17}/>
                  <input placeholder="Cari area parkir..." value={search} onChange={e => setSearch(e.target.value)}/>
                </div>
                <span className="muted">{areas.length} area terdaftar</span>
              </div>
              <div className="area-cards">
                {areas
                  .filter(a => `${a.name} ${a.location}`.toLowerCase().includes(search.toLowerCase()))
                  .map((a, i) => {
                    const used = transactions.filter(t => t.areaId === a.id && t.status === 'Parkir').length
                    const pct = Math.round((used / (a.capacity || 1)) * 100)
                    return (
                      <div className="area-card" key={a.id}>
                        <div className="area-card-top">
                          <div className={`area-symbol color-${i % 3}`}><MapPinned size={19}/></div>
                          <span className="status status-active">Aktif</span>
                        </div>
                        <h3>{a.name}</h3>
                        <p>{a.location}</p>
                        <div className="capacity-line"><span>Kapasitas terpakai</span><strong>{used} / {a.capacity}</strong></div>
                        <div className="progress"><span style={{ width: `${Math.min(100, pct)}%` }}/></div>
                        <div className="card-foot"><span>{Math.max(a.capacity - used, 0)} slot tersedia</span><span>{pct}%</span></div>
                      </div>
                    )
                  })}
                {areas.length === 0 && <p className="muted">Belum ada area parkir terdaftar.</p>}
              </div>
            </section>
          )}

          {page === 'Kendaraan' && (
            <section className="panel table-panel">
              <div className="toolbar">
                <div className="search-box">
                  <Search size={17}/>
                  <input placeholder="Cari plat nomor atau jenis kendaraan..." value={search} onChange={e => setSearch(e.target.value)}/>
                </div>
                <span className="muted">{vehicles.length} kendaraan terdaftar</span>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Nomor Plat</th><th>Jenis Kendaraan</th><th>Status Parkir</th></tr>
                  </thead>
                  <tbody>
                    {filteredVehicles.map(v => {
                      const active = transactions.some(t => t.vehicleId === v.id && t.status === 'Parkir')
                      return (
                        <tr key={v.id}>
                          <td><strong>{v.plate}</strong></td>
                          <td><span className="vehicle-type"><CarFront size={15}/>{v.type}</span></td>
                          <td>
                            <span className={`status ${active ? 'status-warning' : 'status-done'}`}>
                              {active ? 'Sedang Parkir' : 'Tidak Parkir'}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                    {filteredVehicles.length === 0 && <EmptyRow cols={3}/>}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {page === 'Transaksi' && (
            <section className="panel table-panel">
              <div className="toolbar">
                <div className="search-box">
                  <Search size={17}/>
                  <input placeholder="Cari nomor plat, area, status..." value={search} onChange={e => setSearch(e.target.value)}/>
                </div>
                <div className="table-filters"><span className="muted">{filteredTransactions.length} transaksi</span></div>
              </div>
              <TransactionTable rows={filteredTransactions} onExit={handleExit}/>
            </section>
          )}

           </div>
      </main>

      {notice && <div className="toast"><CircleCheck size={18}/>{notice}</div>}

      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h2>
                  {modal === 'area' ? 'Tambah Area Parkir' : modal === 'vehicle' ? 'Tambah Kendaraan' : 'Catat Kendaraan Masuk'}
                </h2>
                <p>Lengkapi informasi berikut untuk melanjutkan.</p>
              </div>
              <button className="icon-button" onClick={() => setModal(null)}><X size={19}/></button>
            </div>
            <form
              onSubmit={async e => {
                e.preventDefault()
                if (submitting) return
                setSubmitting(true)
                try {
                  const form = e.currentTarget
                  if (modal === 'area') await addArea(form)
                  if (modal === 'vehicle') await addVehicle(form)
                  if (modal === 'entry') await addEntry(form)
                } finally {
                  setSubmitting(false)
                }
              }}
            >
              {modal === 'area' && (
                <>
                  <Field label="Nama Area" name="name" placeholder="Contoh: Area D" required/>
                  <Field label="Lokasi" name="location" placeholder="Contoh: Basement 3" required/>
                  <Field label="Kapasitas Slot" name="capacity" type="number" placeholder="Contoh: 50" required/>
                </>
              )}
              {modal === 'vehicle' && (
                <>
                  <Field label="Nomor Plat" name="plate" placeholder="Contoh: BK 1234 ABC" required/>
                  <label className="field">
                    <span>Jenis Kendaraan</span>
                    <select name="type"><option>Mobil</option><option>Motor</option></select>
                  </label>
                </>
              )}
              {modal === 'entry' && (
                <>
                  <label className="field">
                    <span>Nomor Plat Kendaraan</span>
                    <select name="vehicleId" required>
                      <option value="">Pilih kendaraan</option>
                      {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate} · {v.type}</option>)}
                    </select>
                  </label>
                  <label className="field">
                    <span>Area Parkir</span>
                    <select name="areaId" required>
                      <option value="">Pilih area</option>
                      {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </label>
                  <div className="form-note">Kendaraan harus sudah terdaftar sebelum dicatat masuk.</div>
                </>
              )}
              <div className="modal-actions">
                <button type="button" className="btn btn-light" onClick={() => setModal(null)}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Menyimpan...' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ title, value, unit, icon, tone, trend }: { title: string; value: string; unit: string; icon: React.ReactNode; tone: string; trend: string }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}>{icon}</div>
      <div className="stat-title">{title}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-bottom"><span>{unit}</span><small>{trend}</small></div>
    </div>
  )
}

function TransactionTable({ rows, onExit }: { rows: Transaction[]; onExit: (t: Transaction) => void }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Nomor Plat</th><th>Area</th><th>Waktu Masuk</th><th>Waktu Keluar</th>
            <th>Biaya</th><th>Status</th><th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(t => (
            <tr key={t.id}>
              <td><strong>{t.plate}</strong><small className="sub-cell">{t.type}</small></td>
              <td>{t.area}</td>
              <td>{formatDate(t.entry)}</td>
              <td>{t.exit ? formatDate(t.exit) : '—'}</td>
              <td>{t.status === 'Selesai' ? money(t.fee) : '—'}</td>
              <td>
                <span className={`status ${t.status === 'Parkir' ? 'status-warning' : 'status-done'}`}>
                  {t.status === 'Parkir' ? <Clock3 size={13}/> : <CircleCheck size={13}/>} {t.status}
                </span>
              </td>
              <td>
                {t.status === 'Parkir'
                  ? <button className="exit-button" onClick={() => onExit(t)}><ArrowUpFromLine size={14}/> Keluar</button>
                  : <span className="muted">Selesai</span>}
              </td>
            </tr>
          ))}
          {rows.length === 0 && <EmptyRow cols={7}/>}
        </tbody>
      </table>
    </div>
  )
}

function Field({ label, name, placeholder, type = 'text', required = false }: { label: string; name: string; placeholder: string; type?: string; required?: boolean }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input name={name} type={type} placeholder={placeholder} min={type === 'number' ? 1 : undefined} required={required}/>
    </label>
  )
}

function EmptyRow({ cols }: { cols: number }) {
  return <tr><td colSpan={cols} className="empty">Tidak ada data yang sesuai.</td></tr>
}