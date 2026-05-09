import React from "react";
import { Court } from "../types";
import { Button } from "./UI";

export const CourtCard: React.FC<{ court: Court }> = ({ court }) => (
  <div className="bg-surface-high rounded-xl overflow-hidden group">
    <div className="relative h-48">
      <img src={court.image} alt={court.name} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" referrerPolicy="no-referrer" />
      <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-primary">
        {court.distance}
      </div>
    </div>
    <div className="p-5">
      <h4 className="font-headline font-bold text-lg mb-1 uppercase tracking-tight">{court.name}</h4>
      <div className="flex items-center gap-2 text-on-surface-variant text-xs font-bold mb-4 uppercase">
        <span className="material-symbols-outlined text-sm">
          {court.premium ? "star" : "sports_tennis"}
        </span>
        {court.type}
      </div>
      <div className="flex justify-between items-center">
        <span className="font-headline font-black text-xl text-white">
          £{court.price}<span className="text-xs font-normal text-on-surface-variant">/hr</span>
        </span>
        <Button variant="primary" size="sm">BOOK NOW</Button>
      </div>
    </div>
  </div>
);
