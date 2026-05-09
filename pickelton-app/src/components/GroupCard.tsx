import React from "react";
import { Group } from "../types";
import { Badge, Button } from "./UI";

export const GroupCard: React.FC<{ group: Group }> = ({ group }) => (
  <div className="bg-surface-high rounded-2xl overflow-hidden group hover:shadow-[0px_24px_48px_rgba(0,0,0,0.4)] transition-all duration-300">
    <div className="h-40 relative">
      <img src={group.image} alt={group.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
      <div className="absolute top-4 right-4">
        <Badge className="bg-background/60 backdrop-blur-md text-secondary">
          {group.sport}
        </Badge>
      </div>
    </div>
    <div className="p-6">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{group.name}</h3>
        <div className="flex items-center gap-1 text-on-surface-variant text-xs font-bold">
          <span className="material-symbols-outlined text-sm">group</span> {group.members}
        </div>
      </div>
      <p className="text-on-surface-variant text-sm mb-6 line-clamp-2">{group.description}</p>
      <div className="flex items-center justify-between">
        {group.activity && (
          <div className="flex items-center gap-2 text-secondary text-xs font-bold">
            <span className="material-symbols-outlined text-sm">bolt</span> {group.activity}
          </div>
        )}
        <Button variant="primary" size="sm" className="ml-auto">Join</Button>
      </div>
    </div>
  </div>
);
