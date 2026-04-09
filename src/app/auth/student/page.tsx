"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { checkIdAction, loginAction, registerAction } from "../actions";

export default function StudentAuth() {
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

  const handleIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await checkIdAction(collegeId, email, "student");
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else if (res.ok) {
      setIsRegistered(!!res.isRegistered);
      if (res.fullName) setFullName(res.fullName);
      setStep(2);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = isRegistered
      ? await loginAction(collegeId, password)
      : await registerAction(collegeId, fullName, password);

    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else if (res.ok) {
      router.push("/student/dashboard");
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center p-4 bg-slate-50">
      <div className="mb-4 w-full max-w-md">
        <Link href="/" className="text-sm text-slate-500 hover:text-ku-navy flex items-center gap-1 transition-colors">
          &larr; Back to Home
        </Link>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader 
          title="Student Login" 
          description={
            step === 1 
              ? "Enter your KU ID and Email to proceed." 
              : isRegistered 
                ? `Welcome back, ${fullName}. Enter your password.` 
                : `Hello, ${fullName}. Please complete your registration.`
          } 
        />
        <CardContent>
          <form onSubmit={step === 1 ? handleIdSubmit : handleFinalSubmit} className="space-y-4">
            
            {step === 1 ? (
              <>
                 <Input 
                   label="College ID (e.g. KU2023001)" 
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
                  label="College ID" 
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
