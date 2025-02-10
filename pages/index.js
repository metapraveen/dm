import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";

import React, { useState } from "react";
import { ArrowDown, ArrowRight } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  return <DependencyFlow />;
}


function DependencyFlow() {
  const [snapVersion, setSnapVersion] = useState(1);
  const [postgresVersion, setPostgresVersion] = useState(1);
  const [services, setServices] = useState([
    { name: "Bidder", version: 1 },
    { name: "Act", version: 1 },
    { name: "EP", version: 1 },
    { name: "Or any dm client", version: 1 },
  ]);

  const handleVersionChange = (index, newVersion) => {
    const updatedServices = services.map((service, i) =>
      i === index ? { ...service, version: newVersion } : service
    );
    setServices(updatedServices);
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold text-center">DM version upgrades</h1>

      <div className="flex items-center justify-center space-x-4">
        <ServiceCard
          name="Postgres"
          version={postgresVersion}
          snapVersion={snapVersion}
          postgresVersion={postgresVersion}
          ignoreVersionCheck={false}
          onVersionChange={(newVersion) => setPostgresVersion(newVersion)}
          isPostgres={true}
        />
        <Arrow />
        <ServiceCard
          name="Snap (Generates Snapshot)"
          version={snapVersion}
          snapVersion={snapVersion}
          postgresVersion={postgresVersion}
          ignoreVersionCheck={true}
          onVersionChange={(newVersion) => setSnapVersion(newVersion)}
          isSnap={true}
        />
      </div>

      <div className="flex items-center justify-center space-x-4">
        {services.map((service, index) => (
          <div key={service.name} className="flex flex-col items-center">
            <Arrow direction="down" />
            <ServiceCard
              name={service.name}
              version={service.version}
              snapVersion={snapVersion}
              postgresVersion={postgresVersion}
              onVersionChange={(newVersion) => handleVersionChange(index, newVersion)}
            />
          </div>
        ))}
      </div>

      <div className="text-center mt-6">
        <p>
          <strong>Deployment Order:</strong> Update DM → Deploy all services fully then snap at the end → Run postgres migration
        </p>
        <p className="mt-2 text-sm text-gray-500">
          * If the Postgres changes are not used in the DM, you can proceed with migration without updating the DM
        </p>
      </div>
    </div>
  );
}


const ServiceCard = ({ name, version, snapVersion, postgresVersion, ignoreVersionCheck, onVersionChange, isSnap, isPostgres }) => {
  const isOutdated = !ignoreVersionCheck && version < snapVersion && !isPostgres;
  const isInconsistent = !ignoreVersionCheck && version > snapVersion && !isPostgres;
  const isPostgresInconsistent = isPostgres && version > snapVersion;

  const cardClass = isOutdated
    ? 'bg-red-300'
    : isInconsistent || isPostgresInconsistent
    ? 'bg-yellow-500'
    : 'bg-green-300';

  return (
    <Card className={`p-4 text-center ${cardClass}`}>
      <CardContent>
        <div>{name}</div>
        {isSnap || isPostgres ? (
          <div>
            <label className="block text-sm font-semibold mt-2">Schema Version:</label>
            <input
              type="number"
              value={version}
              onChange={(e) => onVersionChange(parseInt(e.target.value, 10))}
              className="mt-1 p-1 border rounded w-full"
            />
          </div>
        ) : (
          <div className="mt-1 text-sm font-semibold">Schema Version: {version}</div>
        )}
        {!ignoreVersionCheck && !isSnap && !isPostgres && (
          <input
            type="number"
            value={version}
            onChange={(e) => onVersionChange(parseInt(e.target.value, 10))}
            className="mt-2 p-1 border rounded w-full"
          />
        )}
        {isOutdated && (
          <div className="mt-2 text-sm text-red-800 font-semibold">
            Service will fail to start: Schema Version is smaller than Snap's Schema Version ({snapVersion})
          </div>
        )}
        {isInconsistent && (
          <div className="mt-2 text-sm text-yellow-900 font-semibold">
            Please have consistent Schema Version across all services to avoid risk
          </div>
        )}
        {isPostgresInconsistent && (
          <div className="mt-2 text-sm text-yellow-900 font-semibold">
            If this version's change is used in DM, it is not consumed as DM does not know about it
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const Arrow = ({ direction = "right" }) => (
  <div className="flex items-center justify-center">
    {direction === "down" ? <ArrowDown size={24} /> : <ArrowRight size={24} />}
  </div>
);

export const Card = ({ children, className }) => (
  <div className={`shadow-md rounded-lg border p-4 ${className}`}>
    {children}
  </div>
);

export const CardContent = ({ children }) => (
  <div className="p-2">{children}</div>
);
