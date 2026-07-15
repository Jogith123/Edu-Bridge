import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, Search, Mail, Phone, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get('/admin/students');
        setStudents(response.data.students || []);
      } catch (err: any) {
        toast.error('Failed to load students directory');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const handleViewDetail = async (studentId: string) => {
    try {
      const response = await api.get(`/admin/students/${studentId}`);
      setSelectedStudent(response.data);
    } catch (err: any) {
      toast.error('Failed to load student details');
    }
  };

  const filteredStudents = students.filter((s) =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.phone?.includes(search)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center gap-2">
          <Users className="h-8 w-8 text-primary" />
          Student Directory
        </h1>
        <p className="text-text-secondary text-sm">
          Search, filter, and review details of registered students.
        </p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-text-muted" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input w-full pl-11"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Student Directory Table/List */}
        <div className="lg:col-span-2 space-y-4 max-h-[70vh] overflow-y-auto pr-2 scrollbar">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student, idx) => (
              <div
                key={idx}
                onClick={() => handleViewDetail(student.id)}
                className={`glass-panel p-5 cursor-pointer text-left transition-all ${
                  selectedStudent?.user?.id === student.id
                    ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/30'
                    : 'glass-panel-hover'
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-bold text-lg text-text-primary">{student.name}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-text-secondary">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        {student.email}
                      </span>
                      {student.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" />
                          {student.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    {student.profile_completed ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full border border-success/20">
                        <CheckCircle className="h-3 w-3" /> Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                        <XCircle className="h-3 w-3" /> Incomplete
                      </span>
                    )}

                    {student.state && (
                      <span className="text-[10px] bg-white/5 border border-white/10 text-text-secondary px-2 py-0.5 rounded-md font-semibold">
                        {student.state}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="glass-panel p-12 text-center text-text-muted italic">
              No students found.
            </div>
          )}
        </div>

        {/* Selected Student Detail View */}
        <div className="glass-panel p-6 space-y-6">
          {selectedStudent ? (
            <>
              <div>
                <h3 className="font-extrabold text-xl text-text-primary">{selectedStudent.user.name}</h3>
                <p className="text-xs text-text-secondary mt-1">{selectedStudent.user.email}</p>
              </div>

              {selectedStudent.profile ? (
                <div className="space-y-4 text-xs">
                  <div className="border-t border-white/5 pt-4 space-y-2">
                    <h4 className="font-bold text-text-secondary uppercase">Personal Details</h4>
                    <div className="grid grid-cols-2 gap-2 text-text-primary">
                      <div>State: <span className="font-semibold">{selectedStudent.profile.state}</span></div>
                      <div>District: <span className="font-semibold">{selectedStudent.profile.district}</span></div>
                      <div>Category: <span className="font-semibold uppercase">{selectedStudent.profile.category}</span></div>
                      <div>Income: <span className="font-semibold">₹{selectedStudent.profile.family_income}</span></div>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-4 space-y-2">
                    <h4 className="font-bold text-text-secondary uppercase">Academic details</h4>
                    <div className="grid grid-cols-2 gap-2 text-text-primary">
                      <div>Class: <span className="font-semibold">{selectedStudent.profile.current_class}</span></div>
                      <div>Stream: <span className="font-semibold">{selectedStudent.profile.stream}</span></div>
                      <div>10th %: <span className="font-semibold">{selectedStudent.profile.percentage_10th}%</span></div>
                      <div>12th %: <span className="font-semibold">{selectedStudent.profile.percentage_12th}%</span></div>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-4 space-y-2">
                    <h4 className="font-bold text-text-secondary uppercase">Interests</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedStudent.profile.career_interests?.map((interest: string, idx: number) => (
                        <span key={idx} className="bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-md font-semibold text-[10px]">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-4">
                    <span className="text-[10px] text-text-muted">Registered: {new Date(selectedStudent.user.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-text-muted text-xs italic">
                  Student has not completed their profile setup yet.
                </div>
              )}
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-20 text-text-muted space-y-3">
              <Users className="h-10 w-10 text-white/25" />
              <p className="text-sm italic max-w-[200px]">Select a student from the list to view their complete academic, economic and career profile details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
