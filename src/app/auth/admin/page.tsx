"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { checkIdAction, loginAction, registerAction } from "../actions";

const departments = [
  "Hostel Issues",
  "Classroom & Infrastructure Issues",
  "Parking Issues",
  "Transportation Issues",
  "Harassment / Ragging / Safety Issues",
  "General / Other Issues"
];

export default function AdminAuth() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [isRegistered, setIsRegistered] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Form state
  const [collegeId, setCollegeId] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState(departments[0]);

  const handleIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await checkIdAction(collegeId, email, "admin");
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else if (res.ok) {
      setIsRegistered(!!res.isRegistered);
      setStep(2);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = isRegistered
      ? await loginAction(collegeId, password)
      : await registerAction(collegeId, fullName, password, department);

    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else if (res.ok) {
      router.push("/admin/dashboard");
    }
  };

  return (
    <div className="flex-1 flex justify-center items-center p-4 bg-slate-50">
      <Card className="w-full max-w-md">
        <CardHeader 
          title="Staff / Admin Login" 
          description={step === 1 ? "Enter your Staff ID to proceed." : (isRegistered ? "Welcome back. Enter your password." : "Complete your staff registration.") } 
        />
        <CardContent>
          <form onSubmit={step === 1 ? handleIdSubmit : handleFinalSubmit} className="space-y-4">
            
            {step === 1 ? (
              <>
                 <Input 
                   label="Staff ID (e.g. KUSTAFF001)" 
                   value={collegeId}
                   onChange={(e) => setCollegeId(e.target.value)}
                   disabled={loading}
                   required 
                 />
                 <Input 
                   label="University Email" 
                   type="email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   disabled={loading}
                   required 
                 />
              </>
            ) : (
              <>
                <Input 
                  label="Staff ID" 
                  value={collegeId}
                  disabled
                />
                {!isRegistered && (
                  <>
                    <Input 
                      label="Full Name" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={loading}
                      required 
                    />
                    <div className="w-full">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Managing Department
                      </label>
                      <select 
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ku-navy transition-colors bg-white"
                        disabled={loading}
                      >
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
                <Input 
                  label="Password" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required 
                  minLength={8}
                />
              </>
            )}

            {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">{error}</p>}
            
            <div className="flex gap-3 pt-2">
              {step === 2 && (
                <Button type="button" variant="outline" onClick={() => setStep(1)} disabled={loading}>
                  Back
                </Button>
              )}
              <Button type="submit" className="flex-1" loading={loading} disabled={loading}>
                {step === 1 ? "Continue" : (isRegistered ? "Login" : "Register")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
