// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Crosswalks Client Component
// Owner: Afronovation, Inc.
// ===========================================

'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Globe, 
  Search, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MapPin,
  X,
  Loader2,
} from 'lucide-react';

interface Crosswalk {
  iso3: string;
  name: string;
  region: 'africa' | 'caribbean';
  censusCode: string | null;
  comtradeCode: string | null;
  wdiCode: string | null;
  imfCode: string | null;
  excluded: boolean;
}

const ITEMS_PER_PAGE = 10;

export function CrosswalksClient() {
  const [crosswalks, setCrosswalks] = useState<Crosswalk[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState<'all' | 'africa' | 'caribbean'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'excluded'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [rotationIndex, setRotationIndex] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    async function fetchCrosswalks() {
      try {
        const response = await fetch('/api/v1/admin/crosswalks');
        if (response.ok) {
          const data = await response.json();
          setCrosswalks(data.crosswalks || []);
        } else {
          setCrosswalks(getSampleCrosswalks());
        }
      } catch {
        setCrosswalks(getSampleCrosswalks());
      } finally {
        setLoading(false);
      }
    }

    fetchCrosswalks();
  }, []);

  useEffect(() => {
    if (crosswalks.length === 0) return;
    
    const interval = setInterval(() => {
      setRotationIndex(prev => (prev + 1) % Math.max(1, crosswalks.length - ITEMS_PER_PAGE));
    }, 8000);

    return () => clearInterval(interval);
  }, [crosswalks.length]);

  useEffect(() => {
    setRotationIndex(0);
  }, [searchQuery, regionFilter, statusFilter]);

  const filteredCrosswalks = useMemo(() => {
    let filtered = crosswalks;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.iso3.toLowerCase().includes(query) ||
        c.name.toLowerCase().includes(query) ||
        c.censusCode?.toLowerCase().includes(query) ||
        c.comtradeCode?.toLowerCase().includes(query) ||
        c.wdiCode?.toLowerCase().includes(query) ||
        c.imfCode?.toLowerCase().includes(query)
      );
    }

    if (regionFilter !== 'all') {
      filtered = filtered.filter(c => c.region === regionFilter);
    }

    if (statusFilter === 'active') {
      filtered = filtered.filter(c => !c.excluded);
    } else if (statusFilter === 'excluded') {
      filtered = filtered.filter(c => c.excluded);
    }

    return filtered;
  }, [crosswalks, searchQuery, regionFilter, statusFilter]);

  const stats = useMemo(() => ({
    african: crosswalks.filter(c => c.region === 'africa' && !c.excluded).length,
    caribbean: crosswalks.filter(c => c.region === 'caribbean' && !c.excluded).length,
    excluded: crosswalks.filter(c => c.excluded).length,
    total: crosswalks.filter(c => !c.excluded).length,
  }), [crosswalks]);

  const totalPages = Math.ceil(filteredCrosswalks.length / ITEMS_PER_PAGE);
  
  const displayedCrosswalks = useMemo(() => {
    if (searchQuery || regionFilter !== 'all' || statusFilter !== 'all') {
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      return filteredCrosswalks.slice(start, start + ITEMS_PER_PAGE);
    }
    return filteredCrosswalks.slice(rotationIndex, rotationIndex + ITEMS_PER_PAGE);
  }, [filteredCrosswalks, currentPage, rotationIndex, searchQuery, regionFilter, statusFilter]);

  const isFiltering = searchQuery || regionFilter !== 'all' || statusFilter !== 'all';

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-zinc-800 rounded w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-zinc-800/50 rounded-xl" />)}
        </div>
        <div className="h-96 bg-zinc-800/50 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Country Code Crosswalks
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Map external country codes to Souvera's {stats.total}-market scope
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm text-white font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Mapping
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2">
              <Globe className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.african}</p>
              <p className="text-xs text-zinc-500">African Markets</p>
            </div>
          </div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2">
              <MapPin className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.caribbean}</p>
              <p className="text-xs text-zinc-500">Caribbean Markets</p>
            </div>
          </div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-2">
              <CheckCircle className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-zinc-500">Total Active</p>
            </div>
          </div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.excluded}</p>
              <p className="text-xs text-zinc-500">Excluded</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search by ISO3, name, or external code..."
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Filter className="w-4 h-4 text-zinc-500" />
            </div>
            <select
              value={regionFilter}
              onChange={(e) => { setRegionFilter(e.target.value as 'all' | 'africa' | 'caribbean'); setCurrentPage(1); }}
              className="px-3 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500/50"
            >
              <option value="all">All Regions</option>
              <option value="africa">Africa</option>
              <option value="caribbean">Caribbean</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as 'all' | 'active' | 'excluded'); setCurrentPage(1); }}
              className="px-3 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500/50"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="excluded">Excluded Only</option>
            </select>
          </div>
        </div>

        {!isFiltering && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-800">
            <RefreshCw className="w-3.5 h-3.5 text-zinc-500 animate-spin" style={{ animationDuration: '8s' }} />
            <span className="text-xs text-zinc-500">
              Showing {rotationIndex + 1}-{Math.min(rotationIndex + ITEMS_PER_PAGE, filteredCrosswalks.length)} of {filteredCrosswalks.length} countries (auto-rotating)
            </span>
          </div>
        )}
      </div>

      {/* Crosswalks Table */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Country</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">ISO3</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Region</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Census</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Comtrade</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">WDI</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {displayedCrosswalks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Globe className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                    <p className="text-zinc-400">No countries found</p>
                    <p className="text-xs text-zinc-500 mt-1">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                displayedCrosswalks.map((row) => (
                  <tr 
                    key={row.iso3} 
                    className={`hover:bg-zinc-800/30 transition-colors ${row.excluded ? 'opacity-50' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">{row.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-zinc-300 font-mono">{row.iso3}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                        row.region === 'africa' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {row.region === 'africa' ? 'Africa' : 'Caribbean'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-zinc-400 font-mono text-sm">{row.censusCode || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-zinc-400 font-mono text-sm">{row.comtradeCode || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-zinc-400 font-mono text-sm">{row.wdiCode || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      {row.excluded ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400">
                          <XCircle className="w-3 h-3" />
                          Excluded
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-xs text-emerald-400">
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {isFiltering && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800">
            <p className="text-sm text-zinc-500">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredCrosswalks.length)} of {filteredCrosswalks.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-zinc-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Code System Reference */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">External Code Systems</h3>
        <div className="grid md:grid-cols-3 gap-6 text-sm">
          <div>
            <p className="text-zinc-300 font-medium mb-2">U.S. Census</p>
            <p className="text-zinc-500 text-xs">
              4-digit codes used in U.S. Census International Trade data.
              Required for Census Trade API integration.
            </p>
          </div>
          <div>
            <p className="text-zinc-300 font-medium mb-2">UN Comtrade (M49)</p>
            <p className="text-zinc-500 text-xs">
              UN M49 standard numeric codes used in UN Comtrade database.
              Required for Comtrade API integration.
            </p>
          </div>
          <div>
            <p className="text-zinc-300 font-medium mb-2">World Bank WDI</p>
            <p className="text-zinc-500 text-xs">
              ISO3 codes used in World Bank World Development Indicators.
              Usually matches Souvera ISO3.
            </p>
          </div>
        </div>
      </div>

      {/* Add Mapping Modal */}
      {showAddModal && (
        <AddMappingModal 
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}

// Full country list with known code mappings
const COUNTRY_LIST: Array<{
  iso3: string;
  name: string;
  region: 'africa' | 'caribbean';
  knownCodes?: {
    census?: string;
    comtrade?: string;
    wdi?: string;
    imf?: string;
  };
}> = [
  { iso3: 'DZA', name: 'Algeria', region: 'africa', knownCodes: { census: '7210', comtrade: '012', wdi: 'DZA', imf: '612' } },
  { iso3: 'AGO', name: 'Angola', region: 'africa', knownCodes: { census: '7620', comtrade: '024', wdi: 'AGO', imf: '614' } },
  { iso3: 'BEN', name: 'Benin', region: 'africa', knownCodes: { census: '7260', comtrade: '204', wdi: 'BEN', imf: '638' } },
  { iso3: 'BWA', name: 'Botswana', region: 'africa', knownCodes: { census: '7690', comtrade: '072', wdi: 'BWA', imf: '616' } },
  { iso3: 'BFA', name: 'Burkina Faso', region: 'africa', knownCodes: { census: '7480', comtrade: '854', wdi: 'BFA', imf: '748' } },
  { iso3: 'BDI', name: 'Burundi', region: 'africa', knownCodes: { census: '7560', comtrade: '108', wdi: 'BDI', imf: '618' } },
  { iso3: 'CPV', name: 'Cabo Verde', region: 'africa', knownCodes: { census: '7270', comtrade: '132', wdi: 'CPV', imf: '624' } },
  { iso3: 'CMR', name: 'Cameroon', region: 'africa', knownCodes: { census: '7280', comtrade: '120', wdi: 'CMR', imf: '622' } },
  { iso3: 'CAF', name: 'Central African Republic', region: 'africa', knownCodes: { census: '7290', comtrade: '140', wdi: 'CAF', imf: '626' } },
  { iso3: 'TCD', name: 'Chad', region: 'africa', knownCodes: { census: '7300', comtrade: '148', wdi: 'TCD', imf: '628' } },
  { iso3: 'COM', name: 'Comoros', region: 'africa', knownCodes: { census: '7590', comtrade: '174', wdi: 'COM', imf: '632' } },
  { iso3: 'COG', name: 'Congo', region: 'africa', knownCodes: { census: '7570', comtrade: '178', wdi: 'COG', imf: '634' } },
  { iso3: 'COD', name: 'Congo (DRC)', region: 'africa', knownCodes: { census: '7580', comtrade: '180', wdi: 'COD', imf: '636' } },
  { iso3: 'CIV', name: "Côte d'Ivoire", region: 'africa', knownCodes: { census: '7310', comtrade: '384', wdi: 'CIV', imf: '662' } },
  { iso3: 'DJI', name: 'Djibouti', region: 'africa', knownCodes: { census: '7830', comtrade: '262', wdi: 'DJI', imf: '611' } },
  { iso3: 'EGY', name: 'Egypt', region: 'africa', knownCodes: { census: '7850', comtrade: '818', wdi: 'EGY', imf: '469' } },
  { iso3: 'GNQ', name: 'Equatorial Guinea', region: 'africa', knownCodes: { census: '7320', comtrade: '226', wdi: 'GNQ', imf: '642' } },
  { iso3: 'ERI', name: 'Eritrea', region: 'africa', knownCodes: { census: '7430', comtrade: '232', wdi: 'ERI', imf: '643' } },
  { iso3: 'SWZ', name: 'Eswatini', region: 'africa', knownCodes: { census: '7700', comtrade: '748', wdi: 'SWZ', imf: '734' } },
  { iso3: 'ETH', name: 'Ethiopia', region: 'africa', knownCodes: { census: '7440', comtrade: '231', wdi: 'ETH', imf: '644' } },
  { iso3: 'GAB', name: 'Gabon', region: 'africa', knownCodes: { census: '7340', comtrade: '266', wdi: 'GAB', imf: '646' } },
  { iso3: 'GMB', name: 'Gambia', region: 'africa', knownCodes: { census: '7350', comtrade: '270', wdi: 'GMB', imf: '648' } },
  { iso3: 'GHA', name: 'Ghana', region: 'africa', knownCodes: { census: '7360', comtrade: '288', wdi: 'GHA', imf: '652' } },
  { iso3: 'GIN', name: 'Guinea', region: 'africa', knownCodes: { census: '7380', comtrade: '324', wdi: 'GIN', imf: '656' } },
  { iso3: 'GNB', name: 'Guinea-Bissau', region: 'africa', knownCodes: { census: '7390', comtrade: '624', wdi: 'GNB', imf: '654' } },
  { iso3: 'KEN', name: 'Kenya', region: 'africa', knownCodes: { census: '7600', comtrade: '404', wdi: 'KEN', imf: '664' } },
  { iso3: 'LSO', name: 'Lesotho', region: 'africa', knownCodes: { census: '7710', comtrade: '426', wdi: 'LSO', imf: '666' } },
  { iso3: 'LBR', name: 'Liberia', region: 'africa', knownCodes: { census: '7400', comtrade: '430', wdi: 'LBR', imf: '668' } },
  { iso3: 'LBY', name: 'Libya', region: 'africa', knownCodes: { census: '7810', comtrade: '434', wdi: 'LBY', imf: '672' } },
  { iso3: 'MDG', name: 'Madagascar', region: 'africa', knownCodes: { census: '7720', comtrade: '450', wdi: 'MDG', imf: '674' } },
  { iso3: 'MWI', name: 'Malawi', region: 'africa', knownCodes: { census: '7730', comtrade: '454', wdi: 'MWI', imf: '676' } },
  { iso3: 'MLI', name: 'Mali', region: 'africa', knownCodes: { census: '7410', comtrade: '466', wdi: 'MLI', imf: '678' } },
  { iso3: 'MRT', name: 'Mauritania', region: 'africa', knownCodes: { census: '7450', comtrade: '478', wdi: 'MRT', imf: '682' } },
  { iso3: 'MUS', name: 'Mauritius', region: 'africa', knownCodes: { census: '7740', comtrade: '480', wdi: 'MUS', imf: '684' } },
  { iso3: 'MAR', name: 'Morocco', region: 'africa', knownCodes: { census: '7800', comtrade: '504', wdi: 'MAR', imf: '686' } },
  { iso3: 'MOZ', name: 'Mozambique', region: 'africa', knownCodes: { census: '7750', comtrade: '508', wdi: 'MOZ', imf: '688' } },
  { iso3: 'NAM', name: 'Namibia', region: 'africa', knownCodes: { census: '7760', comtrade: '516', wdi: 'NAM', imf: '728' } },
  { iso3: 'NER', name: 'Niger', region: 'africa', knownCodes: { census: '7420', comtrade: '562', wdi: 'NER', imf: '692' } },
  { iso3: 'NGA', name: 'Nigeria', region: 'africa', knownCodes: { census: '7560', comtrade: '566', wdi: 'NGA', imf: '694' } },
  { iso3: 'RWA', name: 'Rwanda', region: 'africa', knownCodes: { census: '7530', comtrade: '646', wdi: 'RWA', imf: '714' } },
  { iso3: 'STP', name: 'São Tomé and Príncipe', region: 'africa', knownCodes: { census: '7610', comtrade: '678', wdi: 'STP', imf: '716' } },
  { iso3: 'SEN', name: 'Senegal', region: 'africa', knownCodes: { census: '7460', comtrade: '686', wdi: 'SEN', imf: '722' } },
  { iso3: 'SYC', name: 'Seychelles', region: 'africa', knownCodes: { census: '7770', comtrade: '690', wdi: 'SYC', imf: '718' } },
  { iso3: 'SLE', name: 'Sierra Leone', region: 'africa', knownCodes: { census: '7470', comtrade: '694', wdi: 'SLE', imf: '724' } },
  { iso3: 'SOM', name: 'Somalia', region: 'africa', knownCodes: { census: '7780', comtrade: '706', wdi: 'SOM', imf: '726' } },
  { iso3: 'ZAF', name: 'South Africa', region: 'africa', knownCodes: { census: '7910', comtrade: '710', wdi: 'ZAF', imf: '199' } },
  { iso3: 'SSD', name: 'South Sudan', region: 'africa', knownCodes: { census: '7765', comtrade: '728', wdi: 'SSD', imf: '733' } },
  { iso3: 'SDN', name: 'Sudan', region: 'africa', knownCodes: { census: '7840', comtrade: '729', wdi: 'SDN', imf: '732' } },
  { iso3: 'TZA', name: 'Tanzania', region: 'africa', knownCodes: { census: '7630', comtrade: '834', wdi: 'TZA', imf: '738' } },
  { iso3: 'TGO', name: 'Togo', region: 'africa', knownCodes: { census: '7500', comtrade: '768', wdi: 'TGO', imf: '742' } },
  { iso3: 'TUN', name: 'Tunisia', region: 'africa', knownCodes: { census: '7640', comtrade: '788', wdi: 'TUN', imf: '744' } },
  { iso3: 'UGA', name: 'Uganda', region: 'africa', knownCodes: { census: '7650', comtrade: '800', wdi: 'UGA', imf: '746' } },
  { iso3: 'ZMB', name: 'Zambia', region: 'africa', knownCodes: { census: '7660', comtrade: '894', wdi: 'ZMB', imf: '754' } },
  { iso3: 'ZWE', name: 'Zimbabwe', region: 'africa', knownCodes: { census: '7670', comtrade: '716', wdi: 'ZWE', imf: '698' } },
  { iso3: 'ATG', name: 'Antigua and Barbuda', region: 'caribbean', knownCodes: { census: '2310', comtrade: '028', wdi: 'ATG', imf: '311' } },
  { iso3: 'BHS', name: 'Bahamas', region: 'caribbean', knownCodes: { census: '2350', comtrade: '044', wdi: 'BHS', imf: '313' } },
  { iso3: 'BRB', name: 'Barbados', region: 'caribbean', knownCodes: { census: '2380', comtrade: '052', wdi: 'BRB', imf: '316' } },
  { iso3: 'BLZ', name: 'Belize', region: 'caribbean', knownCodes: { census: '2050', comtrade: '084', wdi: 'BLZ', imf: '339' } },
  { iso3: 'DMA', name: 'Dominica', region: 'caribbean', knownCodes: { census: '2460', comtrade: '212', wdi: 'DMA', imf: '321' } },
  { iso3: 'DOM', name: 'Dominican Republic', region: 'caribbean', knownCodes: { census: '2470', comtrade: '214', wdi: 'DOM', imf: '243' } },
  { iso3: 'GRD', name: 'Grenada', region: 'caribbean', knownCodes: { census: '2210', comtrade: '308', wdi: 'GRD', imf: '328' } },
  { iso3: 'GUY', name: 'Guyana', region: 'caribbean', knownCodes: { census: '8020', comtrade: '328', wdi: 'GUY', imf: '336' } },
  { iso3: 'HTI', name: 'Haiti', region: 'caribbean', knownCodes: { census: '2240', comtrade: '332', wdi: 'HTI', imf: '263' } },
  { iso3: 'JAM', name: 'Jamaica', region: 'caribbean', knownCodes: { census: '2110', comtrade: '388', wdi: 'JAM', imf: '343' } },
  { iso3: 'KNA', name: 'Saint Kitts and Nevis', region: 'caribbean', knownCodes: { census: '2560', comtrade: '659', wdi: 'KNA', imf: '361' } },
  { iso3: 'LCA', name: 'Saint Lucia', region: 'caribbean', knownCodes: { census: '2580', comtrade: '662', wdi: 'LCA', imf: '362' } },
  { iso3: 'VCT', name: 'Saint Vincent and the Grenadines', region: 'caribbean', knownCodes: { census: '2590', comtrade: '670', wdi: 'VCT', imf: '364' } },
  { iso3: 'SUR', name: 'Suriname', region: 'caribbean', knownCodes: { census: '8050', comtrade: '740', wdi: 'SUR', imf: '366' } },
  { iso3: 'TTO', name: 'Trinidad and Tobago', region: 'caribbean', knownCodes: { census: '2740', comtrade: '780', wdi: 'TTO', imf: '369' } },
];

function AddMappingModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [iso3, setIso3] = useState('');
  const [name, setName] = useState('');
  const [region, setRegion] = useState<'africa' | 'caribbean'>('africa');
  const [censusCode, setCensusCode] = useState('');
  const [comtradeCode, setComtradeCode] = useState('');
  const [wdiCode, setWdiCode] = useState('');
  const [imfCode, setImfCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setSearchQuery('');
    setName('');
    setIso3('');
    setCensusCode('');
    setComtradeCode('');
    setWdiCode('');
    setImfCode('');
  }, [region]);

  const filteredCountries = useMemo(() => {
    const regionCountries = COUNTRY_LIST.filter(c => c.region === region);
    if (!searchQuery) return regionCountries;
    const query = searchQuery.toLowerCase();
    return regionCountries.filter(c => 
      c.name.toLowerCase().includes(query) || c.iso3.toLowerCase().includes(query)
    );
  }, [searchQuery, region]);

  const selectCountry = (country: typeof COUNTRY_LIST[0]) => {
    setIso3(country.iso3);
    setName(country.name);
    setSearchQuery(country.name);
    setShowSuggestions(false);
    
    if (country.knownCodes) {
      setCensusCode(country.knownCodes.census || '');
      setComtradeCode(country.knownCodes.comtrade || '');
      setWdiCode(country.knownCodes.wdi || '');
      setImfCode(country.knownCodes.imf || '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/admin/crosswalks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          iso3: iso3.toUpperCase(),
          name,
          region,
          censusCode: censusCode || null,
          comtradeCode: comtradeCode || null,
          wdiCode: wdiCode || null,
          imfCode: imfCode || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add mapping');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add mapping');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-2">
              <Globe className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Add Country Mapping</h2>
              <p className="text-xs text-zinc-500">Add a new country code crosswalk</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                ISO3 Code *
              </label>
              <input
                type="text"
                value={iso3}
                onChange={(e) => setIso3(e.target.value.toUpperCase())}
                required
                maxLength={3}
                placeholder="NGA"
                className="w-full px-3 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white font-mono placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Region *
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as 'africa' | 'caribbean')}
                className="w-full px-3 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white focus:outline-none focus:border-indigo-500/50"
              >
                <option value="africa">Africa</option>
                <option value="caribbean">Caribbean</option>
              </select>
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Country Name *
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setName(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              required
              placeholder="Type to search countries..."
              className="w-full px-3 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
            />
            {showSuggestions && filteredCountries.length > 0 && (
              <div ref={suggestionsRef} className="absolute z-10 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl overflow-hidden">
                <div className="px-3 py-1.5 bg-zinc-800/80 border-b border-zinc-700 flex items-center justify-between">
                  <span className="text-xs text-zinc-500">
                    {filteredCountries.length} {region === 'africa' ? 'African' : 'Caribbean'} countries
                  </span>
                  <span className="text-xs text-zinc-600">Scroll to see all ↓</span>
                </div>
                <div className="max-h-56 overflow-y-auto">
                  {filteredCountries.map((country) => (
                    <button
                      key={country.iso3}
                      type="button"
                      onClick={() => selectCountry(country)}
                      className="w-full px-3 py-2.5 text-left text-sm text-white hover:bg-indigo-500/20 flex items-center justify-between border-b border-zinc-700/30 last:border-b-0"
                    >
                      <span>{country.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-500 font-mono">{country.iso3}</span>
                        {country.knownCodes && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded">
                            codes known
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* External Codes Section */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-zinc-300">External Code Mappings</p>
              {iso3 && COUNTRY_LIST.find(c => c.iso3 === iso3)?.knownCodes && (
                <span className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                  Auto-populated from known data
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 mb-3">
              Select a country above to auto-fill known codes, or enter manually.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                U.S. Census Code
              </label>
              <p className="text-[10px] text-zinc-600 mb-2">4-digit code for Census Trade API</p>
              <input
                type="text"
                value={censusCode}
                onChange={(e) => setCensusCode(e.target.value)}
                placeholder="e.g., 7560"
                className="w-full px-3 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white font-mono placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                UN Comtrade Code (M49)
              </label>
              <p className="text-[10px] text-zinc-600 mb-2">UN M49 standard numeric code</p>
              <input
                type="text"
                value={comtradeCode}
                onChange={(e) => setComtradeCode(e.target.value)}
                placeholder="e.g., 566"
                className="w-full px-3 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white font-mono placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                World Bank WDI Code
              </label>
              <p className="text-[10px] text-zinc-600 mb-2">Usually same as ISO3</p>
              <input
                type="text"
                value={wdiCode}
                onChange={(e) => setWdiCode(e.target.value)}
                placeholder="e.g., NGA"
                className="w-full px-3 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white font-mono placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                IMF Country Code
              </label>
              <p className="text-[10px] text-zinc-600 mb-2">3-digit IMF numeric identifier</p>
              <input
                type="text"
                value={imfCode}
                onChange={(e) => setImfCode(e.target.value)}
                placeholder="e.g., 694"
                className="w-full px-3 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white font-mono placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !iso3 || !name}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Mapping
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function getSampleCrosswalks(): Crosswalk[] {
  return [
    { iso3: 'NGA', name: 'Nigeria', region: 'africa', censusCode: '7560', comtradeCode: '566', wdiCode: 'NGA', imfCode: '694', excluded: false },
    { iso3: 'ZAF', name: 'South Africa', region: 'africa', censusCode: '7910', comtradeCode: '710', wdiCode: 'ZAF', imfCode: '199', excluded: false },
    { iso3: 'KEN', name: 'Kenya', region: 'africa', censusCode: '7600', comtradeCode: '404', wdiCode: 'KEN', imfCode: '664', excluded: false },
    { iso3: 'GHA', name: 'Ghana', region: 'africa', censusCode: '7360', comtradeCode: '288', wdiCode: 'GHA', imfCode: '652', excluded: false },
    { iso3: 'EGY', name: 'Egypt', region: 'africa', censusCode: '7850', comtradeCode: '818', wdiCode: 'EGY', imfCode: '469', excluded: false },
    { iso3: 'MAR', name: 'Morocco', region: 'africa', censusCode: '7800', comtradeCode: '504', wdiCode: 'MAR', imfCode: '686', excluded: false },
    { iso3: 'TUN', name: 'Tunisia', region: 'africa', censusCode: '7640', comtradeCode: '788', wdiCode: 'TUN', imfCode: '744', excluded: false },
    { iso3: 'CIV', name: "Côte d'Ivoire", region: 'africa', censusCode: '7310', comtradeCode: '384', wdiCode: 'CIV', imfCode: '662', excluded: false },
    { iso3: 'SEN', name: 'Senegal', region: 'africa', censusCode: '7460', comtradeCode: '686', wdiCode: 'SEN', imfCode: '722', excluded: false },
    { iso3: 'ETH', name: 'Ethiopia', region: 'africa', censusCode: '7440', comtradeCode: '231', wdiCode: 'ETH', imfCode: '644', excluded: false },
    { iso3: 'TZA', name: 'Tanzania', region: 'africa', censusCode: '7630', comtradeCode: '834', wdiCode: 'TZA', imfCode: '738', excluded: false },
    { iso3: 'UGA', name: 'Uganda', region: 'africa', censusCode: '7650', comtradeCode: '800', wdiCode: 'UGA', imfCode: '746', excluded: false },
    { iso3: 'RWA', name: 'Rwanda', region: 'africa', censusCode: '7530', comtradeCode: '646', wdiCode: 'RWA', imfCode: '714', excluded: false },
    { iso3: 'AGO', name: 'Angola', region: 'africa', censusCode: '7620', comtradeCode: '024', wdiCode: 'AGO', imfCode: '614', excluded: false },
    { iso3: 'DZA', name: 'Algeria', region: 'africa', censusCode: '7210', comtradeCode: '012', wdiCode: 'DZA', imfCode: '612', excluded: false },
    { iso3: 'JAM', name: 'Jamaica', region: 'caribbean', censusCode: '2110', comtradeCode: '388', wdiCode: 'JAM', imfCode: '343', excluded: false },
    { iso3: 'TTO', name: 'Trinidad and Tobago', region: 'caribbean', censusCode: '2740', comtradeCode: '780', wdiCode: 'TTO', imfCode: '369', excluded: false },
    { iso3: 'BRB', name: 'Barbados', region: 'caribbean', censusCode: '2380', comtradeCode: '052', wdiCode: 'BRB', imfCode: '316', excluded: false },
    { iso3: 'BHS', name: 'Bahamas', region: 'caribbean', censusCode: '2350', comtradeCode: '044', wdiCode: 'BHS', imfCode: '313', excluded: false },
    { iso3: 'HTI', name: 'Haiti', region: 'caribbean', censusCode: '2240', comtradeCode: '332', wdiCode: 'HTI', imfCode: '263', excluded: false },
    { iso3: 'DOM', name: 'Dominican Republic', region: 'caribbean', censusCode: '2470', comtradeCode: '214', wdiCode: 'DOM', imfCode: '243', excluded: false },
    { iso3: 'GUY', name: 'Guyana', region: 'caribbean', censusCode: '8020', comtradeCode: '328', wdiCode: 'GUY', imfCode: '336', excluded: false },
    { iso3: 'SUR', name: 'Suriname', region: 'caribbean', censusCode: '8050', comtradeCode: '740', wdiCode: 'SUR', imfCode: '366', excluded: false },
    { iso3: 'BLZ', name: 'Belize', region: 'caribbean', censusCode: '2050', comtradeCode: '084', wdiCode: 'BLZ', imfCode: '339', excluded: false },
    { iso3: 'ESH', name: 'Western Sahara', region: 'africa', censusCode: null, comtradeCode: '732', wdiCode: 'ESH', imfCode: null, excluded: true },
  ];
}
