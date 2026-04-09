"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getAdminDashboardData, updateComplaintStatusAction } from "./actions";
import { logoutAction } from "../auth/actions";
import { UserCircle, FileText, CheckCircle, Clock, AlertTriangle, ChevronDown, LogOut } from "lucide-react";
import { format, differenceInDays } from "date-fns";

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    in_progress: "bg-blue-100 text-blue-800 border-blue-200",
    resolved: "bg-green-100 text-green-800 border-green-200",
    overdue: "bg-red-100 text-red-800 border-red-200 font-bold",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs uppercase tracking-wider border ${colors[status] || 'bg-slate-100 text-slate-800'}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [remarkInput, setRemarkInput] = useState("");
  const [statusSelect, setStatusSelect] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await getAdminDashboardData();
      if (res.error) {
        router.push("/auth/admin");
        return;
      }
      setData(res);
      setLoading(false);
    }
    load();
  }, [router]);

  const handleUpdate = async (complaintId: string) => {
    if (!statusSelect) return;
    setUpdating(true);
    await updateComplaintStatusAction(complaintId, statusSelect, remarkInput);
    const res = await getAdminDashboardData();
    setData(res);
    setExpandedId(null);
    setRemarkInput("");
    setUpdating(false);
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading Dashboard...</div>;
  }

  const { stats, complaints, user } = data;

  return (
    <div className="flex-1 p-6 lg:p-8 bg-slate-50 max-w-7xl mx-auto w-full">
      
      {/* Header Profile */}
      <div className="flex flex-wrap justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <UserCircle size={48} className="text-emerald-600" />
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-800">{user.fullName || 'Admin Staff'}</h2>
              <span className="bg-ku-light text-ku-navy px-2 py-1 rounded text-xs font-semibold">{user.department}</span>
            </div>
            <p className="text-sm text-slate-500 font-mono">{user.collegeId}</p>
          </div>
        </div>
        <Button 
          variant="ghost"
          onClick={async () => {
            await logoutAction();
            router.push("/");
          }}
          className="text-slate-500 hover:text-red-600 hover:bg-red-50"
        >
          <LogOut size={20} className="mr-2" />
          Logout
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-l-4 border-l-slate-400">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-slate-100 text-slate-600 rounded-lg"><FileText size={24}/></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Received</p>
              <h3 className="text-2xl font-bold text-slate-800">{stats.total}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-400">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg"><Clock size={24}/></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Pending</p>
              <h3 className="text-2xl font-bold text-slate-800">{stats.pending}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg"><CheckCircle size={24}/></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Resolved</p>
              <h3 className="text-2xl font-bold text-slate-800">{stats.resolved}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-lg"><AlertTriangle size={24}/></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Overdue</p>
              <h3 className="text-2xl font-bold text-slate-800">{stats.overdue}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Complaints Table */}
      <h3 className="text-xl font-bold text-slate-800 mb-4">Department Complaints</h3>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden text-sm">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">
          <div className="col-span-2">Ticket ID</div>
          <div className="col-span-3">Student</div>
          <div className="col-span-2">Submitted</div>
          <div className="col-span-2">Deadline</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        {complaints.length === 0 && <div className="p-8 text-center text-slate-500">No complaints in your department yet.</div>}

        {complaints.map((c: any) => {
          const isExpanded = expandedId === c.id;
          const isOverdue = new Date() > new Date(c.deadline) && c.status !== 'resolved';
          const daysLeft = differenceInDays(new Date(c.deadline), new Date());

          return (
            <div key={c.id}>
              <div 
                className={`grid grid-cols-12 gap-4 p-4 items-center border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer ${isOverdue ? 'bg-red-50 hover:bg-red-50' : ''}`}
                onClick={() => {
                  setExpandedId(isExpanded ? null : c.id);
                  setStatusSelect(c.status);
                  setRemarkInput("");
                }}
              >
                <div className="col-span-2 font-mono text-slate-600 font-bold">{c.id.split('-')[0].toUpperCase()}</div>
                <div className="col-span-3">
                  <div className="font-medium text-slate-800">{c.student.fullName}</div>
                  <div className="text-xs text-slate-500">{c.student.collegeId}</div>
                </div>
                <div className="col-span-2 text-slate-500">{format(new Date(c.createdAt), 'MMM d, yyyy')}</div>
                <div className="col-span-2 flex flex-col">
                  <span className={isOverdue ? 'text-red-600 font-bold' : 'text-slate-500'}>
                    {format(new Date(c.deadline), 'MMM d, yyyy')}
                  </span>
                  {!['resolved', 'overdue'].includes(c.status) && (
                    <span className="text-xs text-slate-400">{daysLeft} days left</span>
                  )}
                </div>
                <div className="col-span-2"><StatusBadge status={isOverdue ? 'overdue' : c.status} /></div>
                <div className="col-span-1 flex justify-end">
                  <ChevronDown className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
              </div>

              {/* Expanded Detail View */}
              {isExpanded && (
                <div className="bg-slate-100 p-6 border-b border-slate-200">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-bold text-slate-800 mb-2">Issue Description</h4>
                      <div className="bg-white p-4 rounded-md border border-slate-200 text-slate-700 whitespace-pre-wrap">
                        {c.description}
                      </div>

                      <h4 className="font-bold text-slate-800 mt-6 mb-2">Proof Document</h4>
                      {c.proofImageUrl ? (
                        <a href={c.proofImageUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-blue-600 hover:underline">
                          <FileText size={16} /> View Uploaded Image
                        </a>
                      ) : (
                        <span className="text-slate-500">No proof provided.</span>
                      )}
                      
                      {c.remarks?.length > 0 && (
                        <div className="mt-6">
                          <h4 className="font-bold text-slate-800 mb-2">Previous Remarks</h4>
                          <div className="space-y-2">
                            {c.remarks.map((r: any) => (
                              <div key={r.id} className="bg-white p-3 rounded border border-slate-200 text-sm">
                                <span className="text-xs text-slate-400 block mb-1">{format(new Date(r.createdAt), 'MMM d, h:mm a')}</span>
                                {r.message}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                        <h4 className="font-bold text-slate-800 mb-4">Action Panel</h4>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Update Status</label>
                            <select 
                              value={statusSelect}
                              onChange={(e) => setStatusSelect(e.target.value)}
                              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-ku-navy bg-white"
                            >
                              <option value="pending">Pending</option>
                              <option value="in_progress">In Progress</option>
                              <option value="resolved">Resolved</option>
                              <option value="overdue">Overdue</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Add Remark (Visible to Student)</label>
                            <textarea 
                              value={remarkInput}
                              onChange={(e) => setRemarkInput(e.target.value)}
                              rows={3}
                              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-ku-navy"
                              placeholder="Type a message to the student..."
                            />
                          </div>

                          <Button 
                            className="w-full" 
                            onClick={() => handleUpdate(c.id)}
                            loading={updating}
                            disabled={updating || !statusSelect}
                          >
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
