import AppointmentPage from "@/app/appointments/appointment-page";
import Breadcrumb from "@/components/Breadcrumb";
import MasterLayout from "@/masterLayout/MasterLayout";
import { ModelProvider } from "@/contexts/ModelContext";



const Page = () => {
    return (
        <>
            {/* MasterLayout */}
            <MasterLayout>
                {/* Breadcrumb */}
                <Breadcrumb
                    heading="Full Program Appointments"
                    title="Full Program Appointments"
                />
                <ModelProvider>

                    <AppointmentPage />

                </ModelProvider>

            </MasterLayout>
        </>
    );
};

export default Page;
