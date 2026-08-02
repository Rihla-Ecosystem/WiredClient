"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Map,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Loader2,
} from "lucide-react";

import { geoApi, type GeoAdminSite } from "@/lib/api/geo";
import { cn } from "@/lib/utils/cn";

interface SiteForm {
  name: string;
  nameAr: string;
  latitude: string;
  longitude: string;
  category: string;
}

const INITIAL_FORM: SiteForm = {
  name: "",
  nameAr: "",
  latitude: "",
  longitude: "",
  category: "archaeological",
};

const CATEGORIES = [
  "archaeological",
  "islamic",
  "christian",
  "infrastructure",
];

function siteToForm(site: GeoAdminSite): SiteForm {
  return {
    name: site.name_en || site.name || "",
    nameAr: site.name_ar || "",
    latitude: String(site.lat ?? ""),
    longitude: String(site.lon ?? ""),
    category: site.categories?.[0] || site.site_type || "archaeological",
  };
}

export default function AdminGeoPage() {
  const t = useTranslations("admin");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<SiteForm>(INITIAL_FORM);
  const [sites, setSites] = useState<GeoAdminSite[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await geoApi.getAdminSites();
      setSites(data);
      setNotice(null);
    } catch {
      setNotice({ type: "error", message: "Failed to load sites from Geo service" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await geoApi.getAdminSites();
        if (cancelled) return;
        setSites(data);
      } catch {
        if (!cancelled) setNotice({ type: "error", message: "Failed to load sites from Geo service" });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async () => {
    const lat = parseFloat(form.latitude);
    const lon = parseFloat(form.longitude);
    if (!form.name.trim() || Number.isNaN(lat) || Number.isNaN(lon)) {
      setNotice({ type: "error", message: "Name, latitude and longitude are required" });
      return;
    }
    setSaving(true);
    try {
      const base = {
        name: form.name,
        name_en: form.name,
        name_ar: form.nameAr || undefined,
        categories: [form.category],
        site_type: form.category,
        lat,
        lon,
      };
      if (editingId) {
        await geoApi.updateAdminSite(editingId, base);
        setNotice({ type: "success", message: "Site updated" });
      } else {
        await geoApi.createAdminSite({
          ...base,
          osm_type: "point",
          osm_id: Math.abs(Math.floor(Date.now() / 1000)),
        });
        setNotice({ type: "success", message: "Site created" });
      }
      setForm(INITIAL_FORM);
      setEditingId(null);
      setShowForm(false);
      await load();
    } catch {
      setNotice({ type: "error", message: "Failed to save site" });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (site: GeoAdminSite) => {
    setForm(siteToForm(site));
    setEditingId(site.id);
    setShowForm(true);
    setNotice(null);
  };

  const handleDelete = async (id: string) => {
    try {
      await geoApi.deleteAdminSite(id);
      setNotice({ type: "success", message: "Site deleted" });
      await load();
    } catch {
      setNotice({ type: "error", message: "Failed to delete site" });
    }
  };

  const inputClass =
    "w-full px-3 py-2 rounded-lg border border-sand/60 dark:border-nile-light/40 bg-white dark:bg-nile-light text-nile dark:text-sand text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all";

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Map className="w-6 h-6 text-gold" />
          <h1 className="text-2xl font-serif font-bold text-nile dark:text-sand">
            {t("geoManagement")}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => {
            setForm(INITIAL_FORM);
            setEditingId(null);
            setShowForm(true);
            setNotice(null);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gold hover:bg-gold-dark text-white rounded-lg font-medium text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Site
        </button>
      </div>

      {notice && (
        <div
          className={cn(
            "mb-4 px-4 py-3 rounded-xl text-sm border",
            notice.type === "success"
              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
              : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-300"
          )}
        >
          {notice.message}
        </div>
      )}

      {showForm && (
        <div className="mb-6 p-6 bg-white dark:bg-nile rounded-2xl border border-sand/50 dark:border-nile-light/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-serif font-bold text-nile dark:text-sand">
              {editingId ? "Edit Site" : "Add New Site"}
            </h2>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setForm(INITIAL_FORM);
              }}
              className="text-muted-foreground hover:text-nile dark:hover:text-sand"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass}
                placeholder="Pyramids of Giza"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Name (Arabic)</label>
              <input
                value={form.nameAr}
                onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                className={inputClass}
                placeholder="أهرامات الجيزة"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={form.latitude}
                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                className={inputClass}
                placeholder="29.9792"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={form.longitude}
                onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                className={inputClass}
                placeholder="31.1342"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={inputClass}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gold hover:bg-gold-dark text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editingId ? "Update" : "Save"}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-nile rounded-2xl border border-sand/50 dark:border-nile-light/20 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-gold" />
          </div>
        ) : sites.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            <Map className="w-10 h-10 mx-auto mb-2 opacity-50" />
            No sites found. Add your first site.
          </div>
        ) : (
          <div className="divide-y divide-sand/30 dark:divide-nile-light/10">
            {sites.map((site) => (
              <div
                key={site.id}
                className="flex items-center justify-between p-4 hover:bg-sand/10 dark:hover:bg-nile-light/5 transition-colors"
              >
                <div>
                  <p className="font-medium text-nile dark:text-sand text-sm">
                    {site.name_en || site.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {site.name_ar && <span>{site.name_ar} · </span>}
                    {site.site_type || site.categories?.[0] || "—"} · {site.lat?.toFixed(4)}, {site.lon?.toFixed(4)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleEdit(site)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-nile dark:hover:text-sand hover:bg-sand/30 dark:hover:bg-nile-light/20 transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(site.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
