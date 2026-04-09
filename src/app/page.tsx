import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { GraduationCap, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col justify-center items-center p-4">
      <div className="max-w-3xl w-full text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-extrabold text-ku-navy mb-4 tracking-tight">
          Welcome to <span className="text-blue-600">KU WellFare</span>
        </h2>
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
          A dedicated portal for Karnavati University to manage, resolve, and
          escalate campus-related grievances securely and efficiently.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl">
        <Link href="/auth/student" className="group">
          <Card className="h-full transition-all duration-300 hover:shadow-lg hover:border-ku-navy group-hover:-translate-y-1">
            <CardContent className="p-8 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <GraduationCap size={40} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Student Portal</h3>
              <p className="text-slate-500 mb-6">
                Submit and track your campus grievances, hostel issues, and feedback.
              </p>
              <div className="mt-auto px-6 py-2 bg-slate-100 text-slate-700 font-semibold rounded-full group-hover:bg-ku-navy group-hover:text-white transition-colors">
                Login as Student &rarr;
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/auth/admin" className="group">
          <Card className="h-full transition-all duration-300 hover:shadow-lg hover:border-ku-navy group-hover:-translate-y-1">
            <CardContent className="p-8 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck size={40} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Admin / Staff Portal</h3>
              <p className="text-slate-500 mb-6">
                Manage assigned complaints, track deadlines, and communicate resolutions.
              </p>
              <div className="mt-auto px-6 py-2 bg-slate-100 text-slate-700 font-semibold rounded-full group-hover:bg-ku-navy group-hover:text-white transition-colors">
                Login as Admin &rarr;
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
