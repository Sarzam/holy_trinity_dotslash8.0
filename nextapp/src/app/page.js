"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  FaIdCard,
  FaPassport,
  FaGraduationCap,
  FaHandHoldingUsd,
  FaPiggyBank,
  FaIdBadge,
} from "react-icons/fa";
import Chatbot from "./components/chatbot";
import { useState } from "react";
import ServiceModal from "./components/ServiceModal";
import { serviceFaqs } from "./data/serviceFaqs";

const features = [
  {
    title: "Aadhar Card",
    description:
      "Manage your unique identification number and biometric information securely.",
    icon: <FaIdCard size={32} />,
  },
  {
    title: "PAN Card",
    description:
      "Access and manage your Permanent Account Number for tax-related services.",
    icon: <FaIdBadge size={32} />,
  },
  {
    title: "Passport",
    description:
      "Apply, renew, and track your passport applications seamlessly.",
    icon: <FaPassport size={32} />,
  },
  {
    title: "Pension Services",
    description: "Track and manage your pension benefits and disbursements.",
    icon: <FaHandHoldingUsd size={32} />,
  },
  {
    title: "Provident Fund",
    description:
      "Monitor your EPF contributions and access PF-related services.",
    icon: <FaPiggyBank size={32} />,
  },
  {
    title: "Education Services",
    description:
      "Access educational resources, certificates, and verification services.",
    icon: <FaGraduationCap size={32} />,
  },
];

const sponsors = [
  { id: 1, src: "/images/ETHIndia.png", alt: "Sponsor 1" },
  { id: 2, src: "/images/Polygon.png", alt: "Sponsor 2" },
  { id: 3, src: "/images/Mira.png", alt: "Sponsor 3" },
  { id: 4, src: "/images/Devfolio.png", alt: "Sponsor 4" },
  { id: 5, src: "/images/Aptos.png", alt: "Sponsor 5" },
];

const Home = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleServiceClick = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
  };

  return (
    <div className="z-auto min-h-screen bg-gray-900 text-white">
      {/* <script src="https://cdn.botpress.cloud/webchat/v2.2/inject.js"></script>
      <script src="https://files.bpcontent.cloud/2025/02/01/18/20250201183607-3IM00KY8.js"></script> */}
      <Chatbot />
      <section className="desktop hero hidden md:block">
        <div className="3dviewer hidden md:block h-screen mx-auto">
          <script
            type="module"
            src="https://unpkg.com/@splinetool/viewer@1.9.59/build/spline-viewer.js"
          ></script>
          <spline-viewer
            loading-anim-type="spinner-small-light"
            url="https://prod.spline.design/eAiiKfUMzQGpOmPc/scene.splinecode"
          ></spline-viewer>
        </div>
        <div className="hidden md:flex absolute top-56 left-24 flex-col">
          <div className="w-[35vw] title text-8xl font-bold">
            Digital India, Empowered Citizens
          </div>
          <div className="description pt-4 text-3xl opacity-80">
            Your one-stop portal for seamless government services <br /> and
            digital documentation
          </div>
        </div>
      </section>

      {/* Mobile view */}
      <section
        className="mobile hero md:hidden bg-cover bg-center h-screen"
        style={{ backgroundImage: "url('images/main.png')" }}
      >
        <div className="flex flex-col absolute top-16 items-center text-left p-4">
          <div className="title text-4xl font-extrabold pl-8">
            Digital India, Empowered Citizens
          </div>
          <div className="description pt-2 px-12 text-sm opacity-80">
            Your one-stop portal for seamless government services and digital
            documentation
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-[#f8f9fa]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-gray-300 p-6 rounded-lg shadow-md text-gray-900 flex flex-col items-center transition-colors duration-300 hover:bg-[#403cd5] hover:text-white cursor-pointer"
                whileHover={{ scale: 1.05 }}
                onClick={() => handleServiceClick(feature)}
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-center">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal */}
      <ServiceModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        service={selectedService}
        faqs={
          selectedService && serviceFaqs[selectedService.title]
            ? serviceFaqs[selectedService.title]
            : []
        }
      />

      <section className="py-24 bg-[#403cd5]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">
            Our Sponsors
          </h2>
          {/* Desktop Sponsors */}
          <div className="hidden md:block relative w-full overflow-hidden">
            <div className="flex justify-center space-x-8">
              {sponsors.map((sponsor, index) => (
                <motion.div
                  key={index}
                  className="flex-shrink-0 p-8 bg-white/10 backdrop-blur-sm rounded-xl shadow-xl hover:bg-white/20 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                >
                  <Image
                    src={sponsor.src}
                    alt={sponsor.alt}
                    height={0}
                    width={0}
                    sizes="100vw"
                    style={{ width: "auto", height: "10vh" }}
                    className="object-contain"
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mobile Sponsors */}
          <div className="md:hidden">
            <div className="grid grid-cols-2 gap-4">
              {sponsors.map((sponsor, index) => (
                <motion.div
                  key={index}
                  className="p-4 bg-white/10 backdrop-blur-sm rounded-lg shadow-md hover:bg-white/20 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Image
                    src={sponsor.src}
                    alt={sponsor.alt}
                    height={0}
                    width={0}
                    sizes="100vw"
                    style={{ width: "100%", height: "auto" }}
                    className="object-contain"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <motion.h2
            className="text-3xl font-bold mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            Ready to get started?
          </motion.h2>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <Link
              href="/signup"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Sign Up Now
            </Link>
          </motion.div>
        </div>
      </section> */}

      {/* About Us Section */}
      <section id="aboutus" className="py-20 bg-[#f8f9fa]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-6xl mx-auto"
          >
            <h2 className="text-5xl font-bold mb-12 text-[#403cd5] text-center">
              About <span className="">Sathi</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-12 mb-16">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <h3 className="text-2xl font-bold mb-4 text-[#403cd5]">
                  Our Story
                </h3>
                <p className="text-gray-800 leading-relaxed text-lg">
                  Founded with a vision to revolutionize citizen services, Sathi
                  emerged as a response to the growing need for simplified
                  government interactions. We bridge the gap between citizens
                  and government services through innovative digital solutions.
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <h3 className="text-2xl font-bold mb-4 text-[#403cd5]">
                  Our Impact
                </h3>
                <p className="text-gray-800 leading-relaxed text-lg">
                  We've helped millions of citizens access government services
                  seamlessly, reducing processing times by 60% and improving
                  service accessibility by 80%. Our platform handles over 1
                  million transactions daily.
                </p>
              </motion.div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {[
                {
                  title: "Our Mission",
                  description:
                    "To digitize and streamline government services, making them accessible to every citizen regardless of their location or technical expertise.",
                },
                {
                  title: "Our Vision",
                  description:
                    "Creating a fully digital, transparent, and accessible governance system that empowers citizens and promotes efficient service delivery.",
                },
                {
                  title: "Our Values",
                  description:
                    "Built on the pillars of security, accessibility, efficiency, and transparency. We prioritize user privacy and service reliability.",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white p-8 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  <h3 className="text-3xl font-bold mb-4 text-[#403cd5]">
                    {item.title}
                  </h3>
                  <p className="text-gray-800 text-lg leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="bg-[#403cd5] p-8 rounded-2xl shadow-xl">
              <h3 className="text-3xl font-bold mb-8 text-white text-center">
                Key Achievements
              </h3>
              <div className="grid md:grid-cols-4 gap-6">
                {[
                  { number: "10M+", label: "Active Users" },
                  { number: "500+", label: "Services Integrated" },
                  { number: "98%", label: "Success Rate" },
                  { number: "24/7", label: "Support Available" },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.1 }}
                    className="text-center p-6 bg-white rounded-lg hover:shadow-lg transition-all duration-300"
                  >
                    <div className="text-4xl font-bold bg-[#403cd5] mb-2">
                      {stat.number}
                    </div>
                    <div className="text-gray-800 text-lg font-medium">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
