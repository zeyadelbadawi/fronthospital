'use client';

import SyncfusionDocx from './SyncfusionDocx';
import axiosInstance from "@/helper/axiosSetup";
import { useEffect, useState } from 'react';

const FullProgramComponent = ({ patientId }) => {
  const [activeTab, setActiveTab] = useState('physicalTherapy');
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tabs = [
    { id: 'physicalTherapy', label: 'Physical Therapy' },
    { id: 'occupationalTherapy', label: 'Occupational Therapy' },
    { id: 'speechTherapy', label: 'Speech Therapy' },
    { id: 'behavioralTherapy', label: 'Behavioral Therapy' },
    { id: 'educationalProgram', label: 'Educational Program' },
    { id: 'socialSkills', label: 'Social Skills' },
  ];

  const studentVideos = [
    '/videos/sample1.mp4',
    '/videos/sample2.mp4'
  ];

  useEffect(() => {
    console.log("patientId received in useEffect:", patientId);

    const fetchPlanData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching plan data for patientId:", patientId);

        const response = await axiosInstance.get(
          `${process.env.NEXT_PUBLIC_API_URL}/physicalTherapy/plan/${patientId}`
        );
        console.log("Plan data fetched:", response.data);
        setPlan(response.data);
      } catch (error) {
        console.error("Error fetching plan data:", error);
        setError("Error fetching plan data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPlanData();
    }
  }, [patientId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h4 className="card-title mb-4 text-primary">Full Program</h4>

        <div className="d-flex flex-column gap-3">
          {tabs.map(tab => (
            <div
              key={tab.id}
              className={`p-3 border rounded cursor-pointer ${activeTab === tab.id ? 'bg-primary bg-opacity-10 border-primary' : 'bg-white border-light'}`}
              style={{ transition: 'all 0.2s ease' }}
              onClick={() => setActiveTab(tab.id)}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.backgroundColor = 'rgba(13,110,253,0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.backgroundColor = 'white';
                }
              }}
            >
              <h6 className="mb-1 text-primary" style={{ fontWeight: '500' }}>{tab.label}</h6>

              {activeTab === tab.id && (
                <div className="mt-3 text-muted">
                  {tab.id === 'physicalTherapy' ? (
                    <>
                      <div className="d-flex flex-wrap gap-3 mb-4">
                        <div style={{ flex: 1, minWidth: '300px' }}>
                          <h6 className="text-secondary">Exam File</h6>
                          {plan && plan._id && (
                            <SyncfusionDocx
                              userData={{
                                docxId: plan._id,
                                patientId,
                                filePath: `${process.env.NEXT_PUBLIC_API_URL}/uploads/physical-therapy/plan/${plan.filePath || "physical-therapy-plan-defoult.docx"}`,
                                fileName: plan.fileName || "physical-therapy-plan-defoult.docx",
                                docxName: `physical-therapy-plan-${patientId}.docx`,
                              }}
                              planEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/authentication/py/upload-plan`}
                            />
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: '300px' }}>
                          <h6 className="text-secondary">Plan File</h6>
                          {plan && plan._id && (
                            <SyncfusionDocx
                              userData={{
                                docxId: plan._id,
                                patientId,
                                filePath: `${process.env.NEXT_PUBLIC_API_URL}/uploads/physical-therapy/plan/${plan.filePath || "physical-therapy-plan-defoult.docx"}`,
                                fileName: plan.fileName || "physical-therapy-plan-defoult.docx",
                                docxName: `physical-therapy-plan-${patientId}.docx`,
                              }}
                              planEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/authentication/py/upload-plan`}
                            />
                          )}
                        </div>
                      </div>

                      <div>
                        <h6 className="text-secondary mb-3">Student Videos</h6>
                        <div className="d-flex flex-wrap gap-3">
                          {studentVideos.map((videoUrl, index) => (
                            <video
                              key={index}
                              width="300"
                              height="200"
                              controls
                              style={{ borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}
                            >
                              <source src={videoUrl} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    `Content for ${tab.label}`
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FullProgramComponent;