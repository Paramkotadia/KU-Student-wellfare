"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { submitComplaintAction, getStudentComplaints, getUserSession } from "./actions";
import { logoutAction } from "../actions";
import { UserCircle, UploadCloud, AlertCircle, LogOut } from "lucide-react";
import { format } from "date-fns";

const categories = [
  "Hostel Issues",
  "Classroom & Infrastructure Issues",
  "Parking Issues",
  "Transportation Issues",
  "Harassment / Ragging / Safety Issues",
  "General / Other Issues"
];

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    in_progress: "bg-blue-100 text-blue-800",
    resolved: "bg-green-100 text-green-800",
    overdue: "bg-red-100 text-red-800",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${colors[status] || 'bg-slate-100 text-slate-800'}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      const u = await getUserSession();
      if (!u || u.role !== 'student') {
        router.push("/auth/student");
        return;
      }
      setUser(u);
      const data = await getStudentComplaints();
      setComplaints(data);
      setLoading(false);
    }
    load();
  }, [router]);

  const hasActiveComplaint = complaints.some(c => ['pending', 'in_progress', 'overdue'].includes(c.status));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const res = await submitComplaintAction(formData);
    
    setSubmitting(false);
    
    if (res.error) {
      setError(res.error);
    } else if (res.ok) {
      setSuccess(true);
      const data = await getStudentComplaints();
      setComplaints(data);
      (e.target as HTMLFormElement).reset();
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading your profile...</div>;
  }

  return (
    <div className="flex-1 p-6 lg:p-8 bg-slate-50 max-w-6xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          {user?.profilePhotoUrl ? (
            <img src={user.profilePhotoUrl} alt="Profile" className="w-12 h-12 rounded-full border border-slate-200" />
          ) : (
            <UserCircle size={48} className="text-ku-navy" />
          )}
          <div>
            <h2 className="text-xl font-bold text-slate-800">{user?.fullName || 'Student'}</h2>
            <p className="text-sm text-slate-500 font-mono">{user?.collegeId}</p>
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

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader title="Raise a New Complaint" />
            <CardContent>
              {success ? (
                <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    ✓
                  </div>
                  <h3 className="font-bold text-green-800 mb-1">Submitted Successfully!</h3>
                  <p className="text-sm text-green-700 mb-4">Your complaint has been forwarded to the respective department.</p>
                  <Button variant="outline" size="sm" onClick={() => setSuccess(false)}>Raise Another Request</Button>
                </div>
              ) : hasActiveComplaint ? (
                <div className="p-4 bg-blue-50 text-blue-800 rounded-lg border border-blue-200 flex flex-col gap-2">
                  <AlertCircle className="shrink-0" />
                  <p className="text-sm">You already have an active complaint. Please wait for it to be resolved before submitting a new one.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                    <select name="category" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-ku-navy bg-white">
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Problem Description</label>
                    <textarea 
                      name="description" 
                      required 
                      minLength={50}
                      rows={4}
                      placeholder="Please describe your issue in detail... (Min 50 chars)"
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-ku-navy focus:outline-none focus:border-ku-navy"
                    />
                  </div>
                  <Input 
                    label="Date of Incident" 
                    type="date" 
                    name="incidentDate"
                    required
                    max={new Date().toISOString().split('T')[0]} 
                  />
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Upload Proof (Max 5MB)</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md bg-slate-50 hover:bg-slate-100 cursor-pointer relative">
                      <div className="space-y-1 text-center">
                        <UploadCloud className="mx-auto h-8 w-8 text-slate-400" />
                        <div className="flex text-sm text-slate-600 justify-center">
                          <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md font-medium text-ku-navy hover:underline focus-within:outline-none">
                            <span>Upload a file</span>
                            <input id="file-upload" name="proofImage" type="file" accept="image/png, image/jpeg" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" required />
                          </label>
                        </div>
                        <p className="text-xs text-slate-500">PNG, JPG up to 5MB</p>
                      </div>
                    </div>
                  </div>
                  {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
                  <Button type="submit" className="w-full" loading={submitting} disabled={submitting}>
                    Submit Complaint
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader title="My Complaint History" description="All your active and past tickets from the last year." />
            <CardContent>
              {complaints.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  You have not submitted any complaints yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {complaints.map(complaint => (
                    <div key={complaint.id} className="border border-slate-200 rounded-lg p-4 bg-white flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                            {complaint.id.split('-')[0].toUpperCase()}
                          </span>
                          <StatusBadge status={complaint.status} />
                        </div>
                        <h4 className="font-semibold text-slate-800">{complaint.category}</h4>
                        <p className="text-sm text-slate-600 line-clamp-2">{complaint.description}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                          <span>Incident: {format(new Date(complaint.incidentDate), 'MMM d, yyyy')}</span>
                          <span>Submitted: {format(new Date(complaint.createdAt), 'MMM d, yyyy')}</span>
                        </div>
                        
                        {complaint.remarks && complaint.remarks.length > 0 && (
                          <div className="mt-4 bg-slate-50 p-3 rounded-md border border-slate-100 border-l-4 border-l-ku-navy">
                            <p className="text-xs font-semibold text-ku-navy mb-1">Admin Remark:</p>
                            <p className="text-sm text-slate-700">{complaint.remarks[0].message}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="sm:text-right shrink-0">
                        {['pending', 'in_progress'].includes(complaint.status) && (
                          <div className="text-xs font-medium text-slate-500">
                            Deadline: 
                            <br/><span className="text-slate-800">{format(new Date(complaint.deadline), 'MMM d')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
