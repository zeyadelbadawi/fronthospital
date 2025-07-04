import AppointmentPage from "@/app/appointments/appointment-page";
import Breadcrumb from "@/components/Breadcrumb";
import MasterLayout from "@/masterLayout/MasterLayout";
import { ModelProvider } from "@/contexts/ModelContext";

export const metadata = {
    title: "WowDash NEXT JS - Admin Dashboard Multipurpose Bootstrap 5 Template",
    description:
        "Wowdash NEXT JS is a developer-friendly, ready-to-use admin template designed for building attractive, scalable, and high-performing web applications.",
};

const Page = () => {
    return (
        <>
            {/* MasterLayout */}
            <MasterLayout>
                {/* Breadcrumb */}
                <Breadcrumb
                    heading="Full Program Appointments"
                    title="Dashboard / Full Program Appointments"
                />
                <ModelProvider>

                    {/* EditDoctorLayer  */}
                    <AppointmentPage />

                </ModelProvider>

            </MasterLayout>
        </>
    );
};

export default Page;