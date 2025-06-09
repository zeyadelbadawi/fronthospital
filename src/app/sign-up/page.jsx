'use client';
import { useState } from "react";
import { useRouter } from "next/navigation"; 
import SignUpLayer from "@/components/SignUpLayer";
import axios from "axios";

const Page = () => {
  const [role, setRole] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e, role) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      password: formData.get("password"),
      role: role,
      ...(role === "volunteer" && {
        volunteerType: formData.get("volunteerType"),
      }),
      ...(role === "patient" && {
        dateOfBirth: formData.get("dateOfBirth"),
        address: formData.get("address")
      })
    };

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/authentication/signup/${role}`, data);
      alert(`${role} registered successfully`);
      router.push("/sign-in"); 
    } catch (error) {
      console.error(error);
      alert("Error during registration");
    }
  };

  return (
    <SignUpLayer handleSubmit={handleSubmit} />
  );
};

export default Page;
  